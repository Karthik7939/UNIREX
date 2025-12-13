import React, { useState, useEffect } from 'react';
import MovieCard from './Homecards'; // Your card component

function AnimeRecommend() {
  const [searchTerm, setSearchTerm] = useState('');
  const [animeList, setAnimeList] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loadingTop, setLoadingTop] = useState(true);
  const [error, setError] = useState('');
  const [animeSuggestions, setAnimeSuggestions] = useState([]);
  const [suppressAnimeSuggestions, setSuppressAnimeSuggestions] = useState(false);
  const resultsRef = React.useRef(null);

  useEffect(() => {
    const fetchTopRated = async () => {
      try {
        const response = await fetch('https://api.jikan.moe/v4/top/anime?limit=10');
        const data = await response.json();
        if (data.data) {
          setTopRated(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch top rated anime:', err);
      } finally {
        setLoadingTop(false);
      }
    };

    fetchTopRated();
  }, []);

  // Fetch anime title suggestions as the user types
  useEffect(() => {
    if (suppressAnimeSuggestions) {
      setAnimeSuggestions([]);
      return;
    }

    const query = searchTerm.trim();

    if (!query || query.length < 2) {
      setAnimeSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=8`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (data && Array.isArray(data.data)) {
          const titles = data.data
            .map((a) => a.title)
            .filter(Boolean);
          setAnimeSuggestions(titles);
        } else {
          setAnimeSuggestions([]);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching anime suggestions:', err);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [searchTerm, suppressAnimeSuggestions]);

  const fetchAnime = async (query) => {
    if (!query) {
      setAnimeList([]);
      setError('');
      return;
    }
    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=12`);
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        setAnimeList(data.data);
        setError('');

        // Smoothly scroll to the anime search results cards
        window.setTimeout(() => {
          if (resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 50);
      } else {
        setAnimeList([]);
        setError('No results found.');
      }
    } catch (err) {
      setAnimeList([]);
      setError('Failed to fetch anime. Please try again later.');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAnime(searchTerm.trim());
  };

  return (
    <div style={{ padding: '1rem', color: 'white' }}>
      <h4 className="text-white ms-3 mb-3">Top Rated Anime</h4>
      {loadingTop ? (
        <p className="text-center">Loading top anime...</p>
      ) : (
        <div
          style={{
            width: '100vw',
            position: 'relative',
            left: '50%',
            right: '50%',
            marginLeft: '-50vw',
            marginRight: '-50vw',
            padding: '0 1rem',
          }}
        >
          <div
            className="scroll-container auto-scroll d-flex flex-row"
            style={{
              overflowX: 'hidden',
              gap: '1rem',
              paddingBottom: '1rem',
            }}
          >
            <div className="auto-scroll-track">
              {[...topRated, ...topRated].map((anime, index) => (
                <MovieCard
                  key={`${anime.mal_id}-${index}`}
                  title={anime.title}
                  poster={anime.images.jpg.image_url}
                  description={anime.synopsis || 'No description available.'}
                  rating={anime.score ? anime.score / 2 : 0}
                  genre=""
                  year={anime.aired?.from ? anime.aired.from.slice(0, 4) : ''}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="search-container text-center mt-5 mb-4">
        <form
          onSubmit={handleSearch}
          className="input-space position-relative d-inline-block movie-input-wrapper"
          style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}
        >
          <label htmlFor="animeInput" style={{ whiteSpace: 'nowrap' }}>
            Enter an anime you watched recently:
          </label>
          <input
            type="text"
            id="animeInput"
            className="ip-box"
            placeholder="Eg: Naruto"
            value={searchTerm}
            onChange={(e) => {
              setSuppressAnimeSuggestions(false);
              setSearchTerm(e.target.value);
            }}
            style={{ flexGrow: 1, minWidth: '250px' }}
          />
          {animeSuggestions.length > 0 && (
            <ul className="movie-suggestions-list">
              {animeSuggestions.map((title) => (
                <li
                  key={title}
                  className="movie-suggestion-item"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSuppressAnimeSuggestions(true);
                    setSearchTerm(title);
                    setAnimeSuggestions([]);
                  }}
                >
                  {title}
                </li>
              ))}
            </ul>
          )}
          <button type="submit" className="btn primary-search-btn">
            Search
          </button>
        </form>
      </div>

      {error && <div className="text-danger text-center mb-4">{error}</div>}

      {animeList.length > 0 && (
        <>
          <h4 className="mb-3 text-center" ref={resultsRef}>Anime Search Results:</h4>
          <div
            style={{
              width: '100vw',
              position: 'relative',
              left: '50%',
              right: '50%',
              marginLeft: '-50vw',
              marginRight: '-50vw',
              padding: '0 1rem',
            }}
          >
            <div
              className="scroll-container d-flex flex-row"
              style={{
                overflowX: 'auto',
                gap: '1rem',
                paddingBottom: '1rem',
              }}
            >
              {animeList.map((anime) => (
                <MovieCard
                  key={anime.mal_id}
                  title={anime.title}
                  poster={anime.images.jpg.image_url}
                  description={anime.synopsis || 'No description available.'}
                  rating={anime.score ? anime.score / 2 : 0}
                  genre=""
                  year={anime.aired?.from ? anime.aired.from.slice(0, 4) : ''}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AnimeRecommend;
