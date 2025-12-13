import React from 'react';
import { Button, Card, Badge } from 'react-bootstrap';

function MovieCard({ title, poster, description = "", rating, genre, year }) {
  const handleDetailsClick = () => {
    if (title) {
      const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(title)}`;
      window.open(googleSearchUrl, "_blank");
    } else {
      alert("Title not available");
    }
  };

  return (
    <Card className="movie-card">
      <Card.Img
        variant="top"
        src={poster || 'https://via.placeholder.com/250x375'}
        alt={title}
        className="movie-card-img"
      />

      <Card.Body className="movie-card-body">
        <div className="movie-card-badges">
          {genre && <Badge bg="secondary" className="me-1">{genre}</Badge>}
          {year && <Badge bg="info">{year}</Badge>}
        </div>

        <Card.Title className="movie-card-title">{title}</Card.Title>

        <Card.Text className="movie-card-description">
          {description}
        </Card.Text>

        <div className="movie-card-footer">
          {rating && (
            <div>
              {'★'.repeat(Math.round(rating))}
              {'☆'.repeat(5 - Math.round(rating))}
              <span className="ms-2">{rating.toFixed(1)}</span>
            </div>
          )}
          <Button
            variant="outline-light"
            size="sm"
            onClick={handleDetailsClick}
          >
            Details
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default MovieCard;
