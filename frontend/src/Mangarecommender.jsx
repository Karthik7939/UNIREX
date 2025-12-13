import React, { useEffect, useState } from 'react';
import MovieCard from './Homecards'; // Your existing card component

function Mangarecommender() {
  const [topManga, setTopManga] = useState([]);
  const [loadingTop, setLoadingTop] = useState(true);

  const [inputTitle, setInputTitle] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [mangaSuggestions, setMangaSuggestions] = useState([]);
  const [suppressMangaSuggestions, setSuppressMangaSuggestions] = useState(false);
  const recommendationsRef = React.useRef(null);

  useEffect(() => {
    const fetchTopManga = async () => {
      try {
        const response = await fetch('https://api.jikan.moe/v4/top/manga');
        const data = await response.json();
        setTopManga(data.data.slice(0, 10));
      } catch (error) {
        console.error('Failed to fetch top manga:', error);
      } finally {
        setLoadingTop(false);
      }
    };

    fetchTopManga();
  }, []);

  // Fetch manga title suggestions as the user types
  useEffect(() => {
    if (suppressMangaSuggestions) {
      setMangaSuggestions([]);
      return;
    }

    const query = inputTitle.trim();

    if (!query || query.length < 2) {
      setMangaSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=8`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (data && Array.isArray(data.data)) {
          const titles = data.data
            .map((m) => m.title)
            .filter(Boolean);
          setMangaSuggestions(titles);
        } else {
          setMangaSuggestions([]);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching manga suggestions:', err);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [inputTitle, suppressMangaSuggestions]);

  async function fetchMangaDetailsFromKitsu(title) {
    try {
      const response = await fetch(
        `https://kitsu.io/api/edge/manga?filter[text]=${encodeURIComponent(title)}`
      );
      const json = await response.json();
      if (json.data && json.data.length > 0) {
        const manga = json.data[0].attributes;
        return {
          title: manga.titles?.en_jp || manga.titles?.en || manga.titles?.ja_jp || title,
          poster: manga.posterImage?.small || manga.coverImage?.small || '',
          description: manga.synopsis || '',
          score: manga.averageRating ? Number(manga.averageRating) / 20 : 0,
          genre: manga.categories ? manga.categories.map((c) => c.title).join(', ') : '',
          year: manga.startDate ? manga.startDate.slice(0, 4) : '',
        };
      }
    } catch (err) {
      console.error('Kitsu API error:', err);
    }
    return null;
  }

  const BACKEND_URL = 'http://localhost:5000/recommend/?title=';

  const handleSearch = async () => {
    if (!inputTitle.trim()) {
      setErrorMessage('Please enter a manga title');
      setRecommendations([]);
      return;
    }

    setErrorMessage('Searching...');
    try {
      const response = await fetch(BACKEND_URL + encodeURIComponent(inputTitle.trim()));
      const contentType = response.headers.get('content-type');

      if (!contentType || !contentType.includes('application/json')) {
        setErrorMessage(
          `Backend error: Expected JSON but got ${contentType || 'unknown'}`
        );
        setRecommendations([]);
        return;
      }

      const data = await response.json();

      if (response.ok) {
        if (!Array.isArray(data) || data.length === 0) {
          setErrorMessage('No recommendations found for this manga.');
          setRecommendations([]);
          return;
        }

        const enrichedRecommendations = [];
        for (const rec of data) {
          let details = null;
          if (rec.title) {
            details = await fetchMangaDetailsFromKitsu(rec.title);
          }

          enrichedRecommendations.push({
            mal_id: rec.mal_id || rec.id || rec.title,
            title: details?.title || rec.title || 'Unknown Title',
            poster: details?.poster || rec.image_url || rec.image || rec.images?.jpg?.image_url || '',
            description: details?.description || rec.synopsis || '',
            score: details?.score || (rec.score ? rec.score / 2 : 0),
            genre: details?.genre || '',
            year: details?.year || (rec.start_date ? rec.start_date.slice(0, 4) : ''),
          });
        }
        setRecommendations(enrichedRecommendations);
        setErrorMessage('');

        // Smoothly scroll to the manga recommendations cards
        window.setTimeout(() => {
          if (recommendationsRef.current) {
            recommendationsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 50);
      } else {
        setErrorMessage(`Error: ${data.error || `Server returned ${response.status}`}`);
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Error connecting to backend:', error);
      setErrorMessage(
        `Connection error: ${error.message}. Make sure backend server is running.`
      );
      setRecommendations([]);
    }
  };

  return (
    <div style={{ padding: '1rem', color: 'white' }}>
      <h4 className="text-white ms-3 mb-3">Top Rated Manga</h4>
      {loadingTop ? (
        <p className="text-center">Loading top manga...</p>
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
              {[...topManga, ...topManga].map((manga, index) => (
                <MovieCard
                  key={`${manga.mal_id}-${index}`}
                  title={manga.title}
                  poster={manga.images.jpg.image_url}
                  description={manga.synopsis || ''}
                  rating={manga.score ? manga.score / 2 : 0}
                  genre=""
                  year={manga.start_date ? manga.start_date.slice(0, 4) : ''}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="search-container text-center mt-5 mb-4">
        <form
          className="input-space position-relative d-inline-block movie-input-wrapper"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}
        >
          <label htmlFor="mangaInput" style={{ whiteSpace: 'nowrap' }}>
            Enter a manga you read recently:
          </label>
          <input
            type="text"
            id="mangaInput"
            className="ip-box"
            placeholder="Eg: One Piece"
            value={inputTitle}
            onChange={(e) => {
              setSuppressMangaSuggestions(false);
              setInputTitle(e.target.value);
            }}
            style={{ flexGrow: 1, minWidth: '250px' }}
          />
          {mangaSuggestions.length > 0 && (
            <ul className="movie-suggestions-list">
              {mangaSuggestions.map((title) => (
                <li
                  key={title}
                  className="movie-suggestion-item"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSuppressMangaSuggestions(true);
                    setInputTitle(title);
                    setMangaSuggestions([]);
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

      {errorMessage && (
        <div className="text-danger text-center mb-4">{errorMessage}</div>
      )}

      {recommendations.length > 0 && (
        <>
          <h4 className="mb-3 text-center" ref={recommendationsRef}>Manga Recommendations:</h4>
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
              {recommendations.map((rec) => (
                <MovieCard
                  key={rec.mal_id}
                  title={rec.title}
                  poster={rec.poster}
                  description={rec.description}
                  rating={rec.score}
                  genre={rec.genre}
                  year={rec.year}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Mangarecommender;
