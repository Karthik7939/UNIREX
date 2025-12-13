from flask import Flask, request, jsonify
from flask_cors import CORS
from movie_recommend import recommend_movies_advanced

app = Flask(__name__)
CORS(app)  # Enable CORS so frontend can access

@app.route('/')
def home():
    return "Movie Recommendation API is running. Use /recommend/?title=MovieName"

@app.route('/recommend/', methods=['GET'])
def recommend():
    title = request.args.get('title', default=None, type=str)

    if not title:
        return jsonify({"error": "Please provide a movie title via the 'title' query parameter."}), 400

    recommendations = recommend_movies_advanced(title)

    # If recommendation returns error dict
    if isinstance(recommendations, dict) and 'error' in recommendations:
        return jsonify(recommendations), 404

    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')