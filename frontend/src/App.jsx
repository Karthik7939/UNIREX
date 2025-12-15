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
    <Container fluid className="px-4 py-4">
      <div className="app-hero mb-4">
        <div className="app-hero-content">
          <h1 className="app-title">Movie Recommendation System</h1>
          <p className="app-subtitle">
Smart recommendations to match your mood across movies, web series, anime, and manga.          </p>
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
            <div className="searchBox">
            <input
              type="text"
              id="movieInput"
              className="searchInput"
              placeholder="Eg: Interstellar"
              value={inputTitle}
              onChange={(e) => {
                setSuppressSuggestions(false);
                setInputTitle(e.target.value);
              }}
            />
            {movieSuggestions.length > 0 && (
              <ul className="movie-suggestions-list">
                {movieSuggestions.map((title) => (
                  <li
                    key={title}
                    className="movie-suggestion-item"
                    onMouseDown={(e) => {
                      // onMouseDown so click works before input loses focus
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
            <button className="searchButton" type="submit">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={29}
                height={29}
                viewBox="0 0 29 29"
                fill="none"
              >
                <g clipPath="url(#clip0_2_17)">
                  <g filter="url(#filter0_d_2_17)">
                    <path
                      d="M23.7953 23.9182L19.0585 19.1814M19.0585 19.1814C19.8188 18.4211 20.4219 17.5185 20.8333 16.5251C21.2448 15.5318 21.4566 14.4671 21.4566 13.3919C21.4566 12.3167 21.2448 11.252 20.8333 10.2587C20.4219 9.2653 19.8188 8.36271 19.0585 7.60242C18.2982 6.84214 17.3956 6.23905 16.4022 5.82759C15.4089 5.41612 14.3442 5.20435 13.269 5.20435C12.1938 5.20435 11.1291 5.41612 10.1358 5.82759C9.1424 6.23905 8.23981 6.84214 7.47953 7.60242C5.94407 9.13789 5.08145 11.2204 5.08145 13.3919C5.08145 15.5634 5.94407 17.6459 7.47953 19.1814C9.01499 20.7168 11.0975 21.5794 13.269 21.5794C15.4405 21.5794 17.523 20.7168 19.0585 19.1814Z"
                      stroke="white"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      shapeRendering="crispEdges"
                    />
                  </g>
                </g>
                <defs>
                  <filter
                    id="filter0_d_2_17"
                    x="-0.418549"
                    y="3.70435"
                    width="29.7139"
                    height="29.7139"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity={0} result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset dy={4} />
                    <feGaussianBlur stdDeviation={2} />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="BackgroundImageFix"
                      result="effect1_dropShadow_2_17"
                    />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="effect1_dropShadow_2_17"
                      result="shape"
                    />
                  </filter>
                  <clipPath id="clip0_2_17">
                    <rect
                      width="28.0702"
                      height="28.0702"
                      fill="white"
                      transform="translate(0.403503 0.526367)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </button>
            </div>
          </div>
        </form>
      </div>

      {errorMessage && (
        <div className="text-danger text-center mt-4">{errorMessage}</div>
      )}

      {recommendations.length > 0 && (
        <div className="mt-5" ref={recommendationsRef}>
          <h4 className="text-white ms-3 mb-3">Recommended Movies:</h4>
          <MovieList movies={recommendations} />
        </div>
      )}
    </Container>
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
            }
          />

          <Route
            path="/manga"
            element={
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
            }
          />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
