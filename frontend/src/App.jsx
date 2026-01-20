import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';
import MovieCard from './Homecards';
import MovieList from './MovieList';
import WebSeriesPage from './WebSeriesPage';
import AnimeRecommender from './AnimeRecommender';
import Mangarecommender from './Mangarecommender';
import HomePage from './HomePage';

import './App.css';

function NavigationButtons() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="button-group mb-4 text-center app-nav-group">
      <Link
        to="/movies"
        className={`app-nav-pill ${path === '/movies' ? 'app-nav-pill-active' : ''}`}
      >
        <span className="app-nav-icon">🎬</span>
        <span className="app-nav-label">Movies</span>
      </Link>
      <Link
        to="/webseries"
        className={`app-nav-pill ${path === '/webseries' ? 'app-nav-pill-active' : ''}`}
      >
        <span className="app-nav-icon">📺</span>
        <span className="app-nav-label">Web Series</span>
      </Link>
      <Link
        to="/anime"
        className={`app-nav-pill ${path === '/anime' ? 'app-nav-pill-active' : ''}`}
      >
        <span className="app-nav-icon">🌀</span>
        <span className="app-nav-label">Anime</span>
      </Link>
      <Link
        to="/manga"
        className={`app-nav-pill ${path === '/manga' ? 'app-nav-pill-active' : ''}`}
      >
        <span className="app-nav-icon">📚</span>
        <span className="app-nav-label">Manga</span>
      </Link>
    </div>
  );
}

function MoviesPage() {
  const [movies, setMovies] = React.useState([]);
  const [inputTitle, setInputTitle] = React.useState('');
  const [recommendations, setRecommendations] = React.useState([]);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [movieSuggestions, setMovieSuggestions] = React.useState([]);
  const [suppressSuggestions, setSuppressSuggestions] = React.useState(false);
  const recommendationsRef = React.useRef(null);
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  React.useEffect(() => {
    const fetchTopRatedMovies = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`
        );
        const data = await response.json();
        setMovies(data.results);
      } catch (error) {
        console.error('Error fetching top-rated movies:', error);
      }
    };

    fetchTopRatedMovies();
  }, []);

  // Fetch movie title suggestions as the user types
  React.useEffect(() => {
    if (suppressSuggestions) {
      setMovieSuggestions([]);
      return;
    }

    const query = inputTitle.trim();

    if (!query || query.length < 2) {
      setMovieSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
            query
          )}&page=1&include_adult=false`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (data && Array.isArray(data.results)) {
          const titles = data.results
            .slice(0, 8)
            .map((m) => m.title)
            .filter(Boolean);
          setMovieSuggestions(titles);
        } else {
          setMovieSuggestions([]);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching movie suggestions:', err);
        }
      }
    }, 250); // small debounce

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [inputTitle, API_KEY, suppressSuggestions]);

  const handleSearch = async () => {
    if (!inputTitle.trim()) {
      setErrorMessage('Please enter a movie title');
      return;
    }

    setErrorMessage('Searching...');
    try {
      const response = await fetch(
        `http://localhost:5000/recommend/?title=${encodeURIComponent(inputTitle)}`
      );

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setErrorMessage(`Backend error: Expected JSON response but got ${contentType || 'unknown'} (Status: ${response.status})`);
        setRecommendations([]);
        return;
      }

      const data = await response.json();

      if (response.ok) {
        if (data.length === 0) {
          setErrorMessage('No recommendations found for this movie.');
        } else {
          setRecommendations(data);
          setErrorMessage('');

          // Smoothly scroll to the recommended movies cards
          window.setTimeout(() => {
            if (recommendationsRef.current) {
              recommendationsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 50);
        }
      } else {
        if (data && typeof data.error === 'string' && data.error.includes('not found in dataset')) {
          setErrorMessage('We could not find this movie in our recommendation dataset. Please try another title.');
        } else {
          setErrorMessage(`Error: ${data?.error || `Server returned ${response.status}`}`);
        }
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Error connecting to backend:', error);
      setErrorMessage(`Connection error: ${error.message}. Make sure the backend server is running on http://localhost:5000`);
      setRecommendations([]);
    }
  };

  return (
    <div className="page-transition">
      <Container fluid className="px-4 py-4">
        <div className="app-hero mb-4">
          <div className="app-hero-content">
            <h1 className="app-title">Movie Recommendation System</h1>
            <p className="app-subtitle">
              Smart recommendations to match your mood across movies, web series, anime, and manga.
            </p>
          </div>
          <div className="app-hero-nav">
            <NavigationButtons />
          </div>
        </div>

        <h4 className="text-white ms-3 mb-3">Top Rated Movies</h4>
        <div className="scroll-container auto-scroll">
          <div className="auto-scroll-track">
            {[...movies, ...movies].map((movie, index) => (
              <MovieCard
                key={`${movie.id}-${index}`}
                title={movie.title}
                poster={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                description={movie.overview}
                rating={movie.vote_average / 2}
                genre=""
                year={movie.release_date?.split('-')[0] || ''}
              />
            ))}
          </div>
        </div>

        <div className="search-container text-center mt-5">
          <form
            className="input-space position-relative d-inline-block movie-input-wrapper"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <div className="d-inline-flex align-items-center gap-2 movie-input-row">
              <label htmlFor="movieInput" className="me-2">
                Enter a movie you liked recently:
              </label>
              <div id="poda" className="movie-futuristic-input">
                <div className="glow" />
                <div className="darkBorderBg" />
                <div className="darkBorderBg" />
                <div className="darkBorderBg" />

                <div className="white" />
                <div className="border" />

                <div id="main">
                  <input
                    type="text"
                    id="movieInput"
                    name="text"
                    className="input movie-futuristic-input-field"
                    placeholder="Eg: Interstellar"
                    value={inputTitle}
                    onChange={(e) => {
                      setSuppressSuggestions(false);
                      setInputTitle(e.target.value);
                    }}
                  />
                  <div id="input-mask" />
                  <div id="pink-mask" />
                </div>
              </div>

              {movieSuggestions.length > 0 && (
                <ul className="movie-suggestions-list">
                  {movieSuggestions.map((title) => (
                    <li
                      key={title}
                      className="movie-suggestion-item"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSuppressSuggestions(true);
                        setInputTitle(title);
                        setMovieSuggestions([]);
                      }}
                    >
                      {title}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button type="submit" className="btn primary-search-btn mt-3">
              Search
            </button>
          </form>
        </div>

        {errorMessage && (
          <p className="text-center text-danger mt-3">{errorMessage}</p>
        )}

        {recommendations.length > 0 && (
          <div className="mt-5" ref={recommendationsRef}>
            <h4 className="text-white ms-3 mb-3">Recommended Movies:</h4>
            <MovieList movies={recommendations} />
          </div>
        )}
      </Container>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App bg-dark text-white min-vh-100">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/webseries" element={<WebSeriesPage />} />

          <Route
            path="/anime"
            element={
              <div className="page-transition">
                <Container fluid className="px-4 py-4">
                  <div className="app-hero mb-4">
                    <div className="app-hero-content">
                      <h1 className="app-title">Anime Recommendation System</h1>
                      <p className="app-subtitle">
Smart recommendations to match your mood across movies, web series, anime, and manga.                    </p>
                    </div>
                    <div className="app-hero-nav">
                      <NavigationButtons />
                    </div>
                  </div>
                  <AnimeRecommender />
                </Container>
              </div>
            }
          />

          <Route
            path="/manga"
            element={
              <div className="page-transition">
                <Container fluid className="px-4 py-4">
                  <div className="app-hero mb-4">
                    <div className="app-hero-content">
                      <h1 className="app-title">Manga Recommendation System</h1>
                      <p className="app-subtitle">
Smart recommendations to match your mood across movies, web series, anime, and manga.                    </p>
                    </div>
                    <div className="app-hero-nav">
                      <NavigationButtons />
                    </div>
                  </div>
                  <Mangarecommender />
                </Container>
              </div>
            }
          />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
