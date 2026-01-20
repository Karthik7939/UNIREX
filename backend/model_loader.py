import os
import pickle
import threading
from typing import Dict, Any

import requests

# Mapping from logical model name to GitHub Releases asset URL
MODEL_URLS: Dict[str, str] = {
    "anime": "https://github.com/Karthik7939/UNIREX/releases/download/v1.0.0/anime_recommender_bundle.pkl",
    "manga": "https://github.com/Karthik7939/UNIREX/releases/download/v1.0.0/manga_recommender_bundle.pkl",
    "movie": "https://github.com/Karthik7939/UNIREX/releases/download/v1.0.0/movie_recommender_bundle2.pkl",
    "tv": "https://github.com/Karthik7939/UNIREX/releases/download/v1.0.0/tv_series_recommender_bundle.pkl",
}

# Local filenames for each bundle (stored under backend/ next to this file)
MODEL_FILENAMES: Dict[str, str] = {
    "anime": "anime_recommender_bundle.pkl",
    "manga": "manga_recommender_bundle.pkl",
    "movie": "movie_recommender_bundle2.pkl",
    "tv": "tv_series_recommender_bundle.pkl",
}

# Cache for already loaded bundles (to avoid re-reading from disk)
_BUNDLES: Dict[str, Dict[str, Any]] = {}
_LOCK = threading.Lock()


def _download_if_needed(name: str) -> str:
    """Ensure the bundle file for `name` exists locally, downloading from GitHub Releases if needed.

    Returns the local path to the bundle file.
    """
    if name not in MODEL_URLS or name not in MODEL_FILENAMES:
        raise ValueError(f"Unknown model bundle name: {name}")

    backend_dir = os.path.dirname(__file__)
    local_path = os.path.join(backend_dir, MODEL_FILENAMES[name])

    if os.path.exists(local_path):
        return local_path

    url = MODEL_URLS[name]
    os.makedirs(backend_dir, exist_ok=True)

    # Stream download to avoid high memory usage
    with requests.get(url, stream=True) as resp:
        resp.raise_for_status()
        with open(local_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=1024 * 1024):  # 1MB chunks
                if chunk:
                    f.write(chunk)

    return local_path


def get_bundle(name: str) -> Dict[str, Any]:
    """Return the unpickled bundle for the given logical model name.

    The bundle is downloaded from GitHub Releases to the server only once, then
    cached in memory for subsequent calls.
    """
    with _LOCK:
        if name in _BUNDLES:
            return _BUNDLES[name]

        local_path = _download_if_needed(name)
        with open(local_path, "rb") as f:
            bundle = pickle.load(f)

        _BUNDLES[name] = bundle
        return bundle
