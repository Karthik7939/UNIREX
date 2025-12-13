import pickle
import numpy as np
import pandas as pd
import re
from sklearn.metrics.pairwise import cosine_similarity
import os

# Load bundled data
bundle_path = os.path.join(os.path.dirname(__file__), 'tv_series_recommender_bundle.pkl')
with open(bundle_path, 'rb') as f:
    bundle = pickle.load(f)

# Unpack components
model = bundle['model']
tfidf = bundle['tfidf']
scaler = bundle['scaler']
tv = bundle['tv']
tfidf_matrix = bundle['tfidf_matrix']
normalized_ratings = bundle['normalized_ratings']
normalized_popularity = bundle['normalized_popularity']

# Precompute cosine similarity for tags
tag_similarities = cosine_similarity(tfidf_matrix)

# Clean text utility
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    stop_words = {'tv', 'show', 'series', 'episode', 'season', 'film', 'movie'}
    words = [word for word in text.split() if word not in stop_words]
    return ' '.join(words).strip()

# Add cleaned tags if not present
if 'cleaned_tags' not in tv.columns:
    tv['cleaned_tags'] = tv['tags'].fillna('').apply(clean_text)

# Genre settings (domain knowledge)
GENRE_SETTINGS = {
    'comedy': {'keywords': {'mockumentary', 'workplace', 'sitcom', 'funny'}, 'weight': 1.5, 'min_rating': 6.5},
    'drama': {'keywords': {'intense', 'emotional', 'character', 'story'}, 'weight': 1.3, 'min_rating': 7.0},
    'sci-fi': {'keywords': {'futuristic', 'space', 'technology', 'alien'}, 'weight': 1.4, 'min_rating': 7.0},
    'fantasy': {'keywords': {'magic', 'supernatural', 'mythology', 'adventure'}, 'weight': 1.4, 'min_rating': 7.0},
    'action': {'keywords': {'adventure', 'fight', 'thriller', 'stunt'}, 'weight': 1.2, 'min_rating': 6.5},
    'default': {'keywords': set(), 'weight': 1.0, 'min_rating': 6.0}
}

# Main recommendation function
def recommend_tv_series(title, top_n=10, weights=(0.4, 0.3, 0.2, 0.1)):
    alpha, beta, gamma, delta = weights  # genre, popularity, tags, rating

    # Robust title matching
    title_lower = title.lower().strip()
    title_map = tv['title'].str.lower().str.strip()
    matched_indices = title_map[title_map == title_lower].index

    if len(matched_indices) == 0:
        # Fallback: try partial match
        partial_matches = title_map[title_map.str.contains(title_lower, na=False)]
        if not partial_matches.empty:
            matched_indices = partial_matches.index[:1]
        else:
            return {"error": f"TV Series titled '{title}' not found in dataset."}

    input_idx = matched_indices[0]

    # Genre similarity
    input_genres = [g.lower() for g in tv.loc[input_idx, 'genres'].split()]
    primary_genre = input_genres[0] if input_genres else 'default'
    settings = GENRE_SETTINGS.get(primary_genre, GENRE_SETTINGS['default'])

    def genre_similarity(other_genres):
        g_set = set(other_genres.lower().split())
        input_set = set(input_genres)
        union = input_set | g_set
        intersection = input_set & g_set
        weighted_intersection = sum(GENRE_SETTINGS.get(g, GENRE_SETTINGS['default'])['weight'] for g in intersection)
        weighted_union = sum(GENRE_SETTINGS.get(g, GENRE_SETTINGS['default'])['weight'] for g in union)
        return weighted_intersection / weighted_union if weighted_union else 0

    genre_sim = tv['genres'].apply(genre_similarity).values
    popularity_sim = normalized_popularity

    input_tags = set(tv.loc[input_idx, 'cleaned_tags'].split())
    content_boost = np.array([
        1.3 if settings['keywords'] & set(tags.split()) else 1.0
        for tags in tv['cleaned_tags']
    ])

    final_scores = (
        alpha * genre_sim +
        beta * popularity_sim +
        gamma * tag_similarities[input_idx] * content_boost +
        delta * normalized_ratings
    )

    results = tv.copy()
    results['score'] = final_scores
    recommendations = results.drop(index=input_idx).sort_values(by='score', ascending=False)

    return recommendations[['title', 'genres', 'average_rating', 'popularity', 'score']].head(top_n).reset_index(drop=True).to_dict(orient='records')
