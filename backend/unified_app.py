from flask import Flask, request, jsonify
from flask_cors import CORS

from movie_recommend import recommend_movies_advanced
from manga_recommend import recommend_manga_advanced
from animeapp import recommend_anime_advanced
from seriesapp import recommend_tv_series

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return (
        "Unified Recommendation API is running. "
        "Use /movies/recommend/, /manga/recommend/, /anime/recommend/<title>, /series/recommend/<title>. "
        "Legacy movie endpoint: /recommend/?title=MovieTitle"
    )


@app.route("/movies/recommend/", methods=["GET"])
def recommend_movies():
    title = request.args.get("title", default=None, type=str)

    if not title:
        return (
            jsonify(
                {
                    "error": "Please provide a movie title via the 'title' query parameter.",
                    "example": "/movies/recommend/?title=Inception",
                }
            ),
            400,
        )

    recommendations = recommend_movies_advanced(title)

    if isinstance(recommendations, dict) and "error" in recommendations:
        return jsonify(recommendations), 404

    return jsonify(recommendations)


# Legacy route for movies to keep existing frontend paths working
@app.route("/recommend/", methods=["GET"])
def recommend_movies_legacy():
    return recommend_movies()


@app.route("/manga/recommend/", methods=["GET"])
def recommend_manga():
    title = request.args.get("title", default=None, type=str)

    if not title:
        return (
            jsonify(
                {
                    "error": "Please provide a manga title via the 'title' query parameter.",
                    "example": "/manga/recommend/?title=Naruto",
                }
            ),
            400,
        )

    recommendations = recommend_manga_advanced(title)

    if isinstance(recommendations, dict) and "error" in recommendations:
        return jsonify(recommendations), 404

    return jsonify(recommendations)


@app.route("/anime/recommend/<string:title>", methods=["GET"])
def recommend_anime(title):
    result = recommend_anime_advanced(title)

    if isinstance(result, dict) and "error" in result:
        return jsonify(result), 404

    return jsonify(result)


@app.route("/series/recommend/<string:title>", methods=["GET"])
def recommend_series(title):
    result = recommend_tv_series(title)

    if isinstance(result, dict) and "error" in result:
        return jsonify(result), 404

    return jsonify(result)


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)
