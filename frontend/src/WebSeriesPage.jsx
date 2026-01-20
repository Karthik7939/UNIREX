import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import MovieCard from './Homecards';
import MovieList from './MovieList';
import './App.css';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function WebSeriesPage() {
  const [webSeries, setWebSeries] = useState([]);
  const [inputTitle, setInputTitle] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [seriesSuggestions, setSeriesSuggestions] = useState([]);
  const [suppressSeriesSuggestions, setSuppressSeriesSuggestions] = useState(false);
  const recommendationsRef = React.useRef(null);

  const location = useLocation();

  useEffect(() => {
    const fetchWebSeries = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`
        );
        const data = await response.json();
        setWebSeries(data.results);
      } catch (error) {
        console.error('Error fetching web series:', error);
      }
    };

    fetchWebSeries();
  }, []);

  // Fetch web series title suggestions as the user types
  useEffect(() => {
    if (suppressSeriesSuggestions) {
      setSeriesSuggestions([]);
      return;
    }

    const query = inputTitle.trim();

    if (!query || query.length < 2) {
      setSeriesSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(
            query
          )}&page=1&include_adult=false`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (data && Array.isArray(data.results)) {
          const titles = data.results
            .slice(0, 8)
            .map((s) => s.name)
            .filter(Boolean);
          setSeriesSuggestions(titles);
        } else {
          setSeriesSuggestions([]);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching web series suggestions:', err);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [inputTitle, suppressSeriesSuggestions]);

  const handleWebseriesSearch = async () => {
    if (!inputTitle.trim()) return;

    try {
      const response = await fetch(
        `http://localhost:5000/series/recommend/${encodeURIComponent(inputTitle)}`
      );
      const data = await response.json();

      if (response.ok && !data.error) {
        setRecommendations(data);

        // Smoothly scroll to the recommended web series cards
        window.setTimeout(() => {
          if (recommendationsRef.current) {
            recommendationsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 50);
      } else {
        console.error('Backend error:', data.error || 'Unknown error');
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Error connecting to backend:', error);
      setRecommendations([]);
    }
  };

  return (
    <div className="App bg-dark text-white min-vh-100 page-transition">
      <Container fluid className="px-4 py-4">
        <div className="app-hero mb-4">
          <div className="app-hero-content">
            <h1 className="app-title">Web Series Recommendation System</h1>
            <p className="app-subtitle">
Smart recommendations to match your mood across movies, web series, anime, and manga.            </p>
          </div>

          {/* Navigation Button Group with same styling as main header */}
          <div className="app-hero-nav">
            <div className="button-group mb-0 text-center app-nav-group">
              <Link
                to="/"
                className={`app-nav-pill ${location.pathname === '/' ? 'app-nav-pill-active' : ''}`}
              >
                <span className="app-nav-icon">🎬</span>
                <span className="app-nav-label">Movies</span>
              </Link>
              <Link
                to="/webseries"
                className={`app-nav-pill ${location.pathname === '/webseries' ? 'app-nav-pill-active' : ''}`}
              >
                <span className="app-nav-icon">📺</span>
                <span className="app-nav-label">Web Series</span>
              </Link>
              <Link
                to="/anime"
                className={`app-nav-pill ${location.pathname === '/anime' ? 'app-nav-pill-active' : ''}`}
              >
                <span className="app-nav-icon">🌀</span>
                <span className="app-nav-label">Anime</span>
              </Link>
              <Link
                to="/manga"
                className={`app-nav-pill ${location.pathname === '/manga' ? 'app-nav-pill-active' : ''}`}
              >
                <span className="app-nav-icon">📚</span>
                <span className="app-nav-label">Manga</span>
              </Link>
            </div>
          </div>
        </div>

        <h4 className="text-white ms-3 mb-3">Top Rated Web Series</h4>
        <div className="scroll-container auto-scroll">
          <div className="auto-scroll-track">
            {[...webSeries, ...webSeries].map((series, index) => (
              <MovieCard
                key={`${series.id}-${index}`}
                title={series.name}
                poster={`https://image.tmdb.org/t/p/w500${series.poster_path}`}
                description={series.overview}
                rating={series.vote_average / 2}
                genre=""
                year={series.first_air_date?.split('-')[0] || ''}
              />
            ))}
          </div>
        </div>

        <div className="search-container text-center mt-5">
          <form
            className="input-space position-relative d-inline-block movie-input-wrapper"
            onSubmit={(e) => {
              e.preventDefault();
              handleWebseriesSearch();
            }}
          >
            <div className="d-inline-flex align-items-center gap-2 movie-input-row">
              <label htmlFor="webseriesInput" className="me-2">
                Enter a web series you watched recently:
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
                    id="webseriesInput"
                    name="text"
                    className="input movie-futuristic-input-field"
                    placeholder="Eg: Dark"
                    value={inputTitle}
                    onChange={(e) => {
                      setSuppressSeriesSuggestions(false);
                      setInputTitle(e.target.value);
                    }}
                  />
                  <div id="input-mask" />
                  <div id="pink-mask" />
                </div>
              </div>

              {seriesSuggestions.length > 0 && (
                <ul className="movie-suggestions-list">
                  {seriesSuggestions.map((title) => (
                    <li
                      key={title}
                      className="movie-suggestion-item"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSuppressSeriesSuggestions(true);
                        setInputTitle(title);
                        setSeriesSuggestions([]);
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

        {recommendations.length > 0 && (
          <div className="mt-5" ref={recommendationsRef}>
            <h4 className="text-white ms-3 mb-3">Recommended Web Series:</h4>
            <MovieList movies={recommendations} />
          </div>
        )}
      </Container>
    </div>
  );
}

export default WebSeriesPage;
