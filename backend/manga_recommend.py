import pickle
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

# Load bundled manga data
with open('manga_recommender_bundle.pkl', 'rb') as f:
    bundle = pickle.load(f)

model = bundle['model']
tfidf = bundle['tfidf']
scaler = bundle['scaler']
manga = bundle['manga']
tfidf_matrix = bundle['tfidf_matrix']
normalized_ratings = bundle['normalized_ratings']
normalized_popularity = bundle['normalized_popularity']

# Precompute tag similarities
tag_similarities = cosine_similarity(tfidf_matrix)

# Text cleaner
def clean_text(text):
    import re
    text = str(text).lower()
    return re.sub(r'[^a-zA-Z0-9\s]', '', text)

# Advanced recommendation
def recommend_manga_advanced(title, top_n=10, weights=(0.2, 0.4, 0.25, 0.15)):
    alpha, beta, gamma, delta = weights

    if 'cleaned_tags' not in manga.columns:
        manga['cleaned_tags'] = manga['tags'].fillna('').apply(clean_text)

    title_lower = title.lower()
    title_map = manga['title'].str.lower()

    if title_lower not in title_map.values:
        return {"error": f"❌ '{title}' not found in the dataset."}

    input_idx = title_map[title_map == title_lower].index[0]

    try:
        input_genres = set(manga.loc[input_idx, 'genre'].lower().split())
    except:
        input_genres = set()

    def genre_jaccard(g):
        try:
            g_set = set(g.lower().split())
            return len(input_genres & g_set) / len(input_genres | g_set) if input_genres | g_set else 0
        except:
            return 0

    genre_sim = manga['genre'].apply(genre_jaccard).values

    final_scores = (
        alpha * genre_sim +
        beta * tag_similarities[input_idx] +
        gamma * normalized_ratings +
        delta * normalized_popularity
    )

    results = manga.copy()
    results['score'] = final_scores

    recommendations = results.drop(index=input_idx).sort_values(by='score', ascending=False)

    return recommendations[['title', 'genre', 'average_rating', 'score']].head(top_n).reset_index(drop=True).to_dict(orient='records')
