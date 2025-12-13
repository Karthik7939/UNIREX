from flask import Flask, request, jsonify
from flask_cors import CORS
from manga_recommend import recommend_manga_advanced

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

@app.route('/')
def home():
    return "Manga Recommendation API is running. Use /recommend/?title=MangaTitle"

@app.route('/recommend/', methods=['GET'])
def recommend():
    title = request.args.get('title', default=None, type=str)

    if not title:
        return jsonify({"error": "Please provide a manga title via the 'title' query parameter."}), 400

    recommendations = recommend_manga_advanced(title)

    if isinstance(recommendations, dict) and 'error' in recommendations:
        return jsonify(recommendations), 404

    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5003)
