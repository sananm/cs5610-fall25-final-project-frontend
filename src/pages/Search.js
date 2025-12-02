import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { movieAPI } from '../services/api';

function Search() {
  const { query } = useParams();
  const [movies, setMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

  useEffect(() => {
    if (query) {
      handleSearch(query);
    } else {
      fetchPopularMovies();
    }
  }, [query]);

  const fetchPopularMovies = async () => {
    try {
      setLoading(true);
      const response = await movieAPI.getPopularMovies();
      setPopularMovies(response.data.results || []);
    } catch (err) {
      console.error('Error fetching popular movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      const response = await movieAPI.searchMovies(searchTerm);
      setMovies(response.data.results || []);
    } catch (err) {
      console.error('Error searching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const displayMovies = query ? movies : popularMovies;

  return (
    <Container className="main-content py-4">
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : displayMovies.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <p className="text-muted">
              {query ? `No movies found for "${query}"` : 'No popular movies available'}
            </p>
            <small className="text-muted">Try searching with a different title</small>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Card className="mb-4">
            <Card.Header>
              <strong>
                {query ? `Search Results (${displayMovies.length})` : `Popular Movies (${displayMovies.length})`}
              </strong>
            </Card.Header>
          </Card>
          <Row>
            {displayMovies.map((movie) => (
              <Col key={movie.id} xs={6} sm={4} md={3} lg={2} className="mb-4">
                <Link to={`/details/${movie.id}`} className="text-decoration-none">
                  <Card className="h-100 movie-card">
                    <Card.Img
                      variant="top"
                      src={movie.poster_path ?
                        `${IMAGE_BASE}${movie.poster_path}` :
                        'https://via.placeholder.com/200x300?text=No+Image'
                      }
                      alt={movie.title}
                    />
                    <Card.Body>
                      <Card.Title className="small">{movie.title}</Card.Title>
                      <div className="text-muted small">
                        ⭐ {movie.vote_average?.toFixed(1)}
                      </div>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
}

export default Search;
