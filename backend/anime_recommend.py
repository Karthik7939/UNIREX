import pickle
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import re

# Load anime bundle
with open('anime_recommender_bundle.pkl', 'rb') as f:
    bundle = pickle.load(f)

model = bundle['model']
tfidf = bundle['tfidf']
scaler = bundle['scaler']
anime = bundle['anime']
tfidf_matrix = bundle['tfidf_matrix']
normalized_ratings = bundle['normalized_ratings']
combined_popularity = bundle['combined_popularity']

# Precompute tag similarities
tag_similarities = cosine_similarity(tfidf_matrix)

# Clean tag text
def clean_text(text):
    text = str(text).lower()
    return re.sub(r'[^a-zA-Z0-9\s]', '', text)

# Advanced recommender
def recommend_anime_advanced(title, top_n=10, weights=(0.2, 0.4, 0.25, 0.15)):
    alpha, beta, gamma, delta = weights

    if 'cleaned_tags' not in anime.columns:
        anime['cleaned_tags'] = anime['tags'].fillna('').apply(clean_text)

    title_lower = title.lower()
    title_map = anime['title'].str.lower()

    if title_lower not in title_map.values:
        return {"error": f"❌ '{title}' not found in the dataset."}

    input_idx = title_map[title_map == title_lower].index[0]

    try:
        input_genres = set(anime.loc[input_idx, 'genres'].lower().split())
    except:
        input_genres = set()

    def genre_jaccard(g):
        try:
            g_set = set(g.lower().split())
            return len(input_genres & g_set) / len(input_genres | g_set) if input_genres | g_set else 0
        except:
            return 0

    genre_sim = anime['genres'].apply(genre_jaccard).values

    final_scores = (
        alpha * genre_sim +
        beta * tag_similarities[input_idx] +
        gamma * normalized_ratings +
        delta * combined_popularity
    )

    results = anime.copy()
    results['score'] = final_scores

    recommendations = results.drop(index=input_idx).sort_values(by='score', ascending=False)

    return recommendations[['title', 'genres', 'average_rating', 'score']].head(top_n).reset_index(drop=True).to_dict(orient='records')
