import pickle
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import os
import pandas as pd
import re
import sys
import types

from model_loader import get_bundle

# Work around old pickled objects that reference sentence_transformers and
# sentence_transformers.model_card. We don't need the actual library at
# runtime; the bundled 'model' is not used in this file.
pkg_name = 'sentence_transformers'
submodule_name = 'sentence_transformers.model_card'

if pkg_name not in sys.modules:
    pkg_module = types.ModuleType(pkg_name)
    sys.modules[pkg_name] = pkg_module
else:
    pkg_module = sys.modules[pkg_name]

if submodule_name not in sys.modules:
    model_card_module = types.ModuleType(submodule_name)

    class ModelCard:  # type: ignore
        pass

    class SentenceTransformerModelCardData:  # type: ignore
        pass

    def generate_model_card(*args, **kwargs):  # type: ignore
        return None

    model_card_module.ModelCard = ModelCard  # type: ignore[attr-defined]
    model_card_module.SentenceTransformerModelCardData = SentenceTransformerModelCardData  # type: ignore[attr-defined]
    model_card_module.generate_model_card = generate_model_card  # type: ignore[attr-defined]

    # Expose as attribute on the parent package as well
    setattr(pkg_module, 'model_card', model_card_module)
    sys.modules[submodule_name] = model_card_module

# Work around legacy BERT attention class referenced in the pickled model
bert_module_name = 'transformers.models.bert.modeling_bert'
try:
    bert_module = __import__(bert_module_name, fromlist=['*'])
    if not hasattr(bert_module, 'BertSdpaSelfAttention'):
        class BertSdpaSelfAttention:  # type: ignore
            pass

        setattr(bert_module, 'BertSdpaSelfAttention', BertSdpaSelfAttention)
except Exception:
    # If anything goes wrong here, we still try to proceed; worst case
    # unpickling will fail with a clear error.
    pass

# Load the bundled data via shared loader (downloads from GitHub Releases if needed)
bundle = get_bundle("movie")

# Unpack components
model = bundle['model']
tfidf = bundle['tfidf']
scaler = bundle['scaler']
movies = bundle['movies']
tfidf_matrix = bundle['tfidf_matrix']
normalized_ratings = bundle['normalized_ratings']
normalized_popularity = bundle['normalized_popularity']

# Precompute tag similarity matrix for efficiency
tag_similarities = cosine_similarity(tfidf_matrix)

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    return text

def recommend_movies_advanced(title, top_n=10, weights=(0.2, 0.4, 0.25, 0.15)):
    alpha, beta, gamma, delta = weights

    # Case-insensitive title matching
    title_lower = title.lower()
    title_map = movies['title'].str.lower()

    if title_lower not in title_map.values:
        return {"error": f"Movie titled '{title}' not found in dataset."}

    input_idx = title_map[title_map == title_lower].index[0]

    # Add cleaned_tags column if not present
    if 'cleaned_tags' not in movies.columns:
        movies['cleaned_tags'] = movies['tags'].fillna('').apply(clean_text)

    # Genre similarity using Jaccard index
    try:
        input_genres = set(movies.loc[input_idx, 'genres'].lower().split())
    except Exception:
        input_genres = set()

    def genre_jaccard(g):
        try:
            g_set = set(g.lower().split())
            union = input_genres | g_set
            if not union:
                return 0
            return len(input_genres & g_set) / len(union)
        except:
            return 0

    genre_sim = movies['genres'].apply(genre_jaccard).values

    # Calculate final scores combining all factors
    final_scores = (
        alpha * genre_sim +
        beta * tag_similarities[input_idx] +
        gamma * normalized_ratings +
        delta * normalized_popularity
    )

    results = movies.copy()
    results['score'] = final_scores

    # Exclude the input movie itself
    recommendations = results.drop(index=input_idx).sort_values(by='score', ascending=False)

    return recommendations[['title', 'genres', 'average_rating', 'popularity', 'score']].head(top_n).reset_index(drop=True).to_dict(orient='records')
