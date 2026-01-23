from flask import Flask, jsonify
from flask_cors import CORS
import pickle
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import re

app = Flask(__name__)
CORS(app)

# Load bundled data once at startup
with open('anime_recommender_bundle.pkl', 'rb') as f:
    bundle = pickle.load(f)

# Lightweight bundle does not include the original model object
tfidf = bundle['tfidf']
scaler = bundle['scaler']
anime = bundle['anime']
tfidf_matrix = bundle['tfidf_matrix']
normalized_ratings = bundle['normalized_ratings']
combined_popularity = bundle['combined_popularity']

# Precompute tag similarity matrix
tag_similarities = cosine_similarity(tfidf_matrix)

def clean_text(text):
    text = str(text).lower()
    return re.sub(r'[^a-zA-Z0-9\s]', '', text)

def recommend_anime_advanced(title, top_n=10, weights=(0.2, 0.4, 0.25, 0.15)):
    alpha, beta, gamma, delta = weights

    title_lower = title.lower()
    title_map = anime['title'].str.lower()

    if title_lower not in title_map.values:
        return {"error": f"'{title}' not found in the dataset."}

    input_idx = title_map[title_map == title_lower].index[0]

    # Add cleaned tags if missing
    if 'cleaned_tags' not in anime.columns:
        anime['cleaned_tags'] = anime['tags'].fillna('').apply(clean_text)

    try:
        input_genres = set(anime.loc[input_idx, 'genres'].lower().split())
    except Exception:
        input_genres = set()

    def genre_jaccard(g):
        try:
            g_set = set(g.lower().split())
            return len(input_genres & g_set) / len(input_genres | g_set) if input_genres | g_set else 0
        except Exception:
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

    return recommendations[['title', 'genres', 'score']].head(top_n).reset_index(drop=True).to_dict(orient='records')


@app.route('/recommend/<string:title>', methods=['GET'])
def recommend(title):
    result = recommend_anime_advanced(title)
    # Handle error response as JSON with status code 404
    if isinstance(result, dict) and 'error' in result:
        return jsonify(result), 404
    return jsonify(result)


@app.route('/')
def home():
    return "🎌 Anime Recommender API is running!"


if __name__ == '__main__':
    #app.run(debug=True)
# anime_recommend.py
#if __name__ == '__main__':
    app.run(port=5001)
