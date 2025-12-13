import React, { useEffect, useState } from 'react';
import MovieCard from './Homecards';

const TMDB_API_KEY = '4c721686b6152435ecb264fffd802d0e';

const MovieList = ({ movies }) => {
  const [moviesWithDetails, setMoviesWithDetails] = useState([]);

  // Utility to clean titles by removing special chars
  const cleanTitle = (title) => title.replace(/[^\w\s]/gi, '').trim();

  useEffect(() => {
    const fetchDetails = async () => {
      const updatedMovies = await Promise.all(
        movies.map(async (movie) => {
          try {
            const query = encodeURIComponent(cleanTitle(movie.title));
            const response = await fetch(
              `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${query}`
            );
            const data = await response.json();

            console.log(`TMDB results for "${movie.title}":`, data.results);

            const firstResult = data.results?.[0] || {};

            return {
              ...movie,
              poster: firstResult.poster_path
                ? `https://image.tmdb.org/t/p/w500${firstResult.poster_path}`
                : 'https://via.placeholder.com/250x375',
              description: firstResult.overview || 'No description available.'
            };
          } catch (error) {
            console.error('Error fetching TMDB data for:', movie.title, error);
            return {
              ...movie,
              poster: 'https://via.placeholder.com/250x375',
              description: 'No description available.'
            };
          }
        })
      );

      setMoviesWithDetails(updatedMovies);
    };

    if (movies.length > 0) {
      fetchDetails();
    }
  }, [movies]);

  return (
    <div
      className="scroll-container"
      style={{
        display: 'flex',
        gap: '1rem',
        overflowX: 'auto',
        padding: '1rem'
      }}
    >
      {moviesWithDetails.map((movie, index) => (
        <MovieCard
          key={index}
          title={movie.title}
          poster={movie.poster}
          description={movie.description}
          rating={movie.average_rating ? movie.average_rating / 2 : 0}
          genre={movie.genres ? movie.genres.replace(/([A-Z])/g, ' $1').trim() : ''}
          year=""
        />
      ))}
    </div>
  );
};

export default MovieList;
