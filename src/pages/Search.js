import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Form, InputGroup } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FaSortAmountDown } from 'react-icons/fa';
import { movieAPI } from '../services/api';

function Search() {
  const { query } = useParams();
  const [movies, setMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('rating_desc'); // rating_desc, rating_asc, title_asc, title_desc, date_asc, date_desc, popularity_desc, popularity_asc

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

  const displayMovies = useMemo(() => {
    const moviesToSort = query ? movies : popularMovies;
    if (!moviesToSort || moviesToSort.length === 0) return [];

    // Filter out movies without poster images
    const moviesWithPosters = moviesToSort.filter(movie => movie.poster_path);
    let sorted = [...moviesWithPosters];

    switch (sortBy) {
      case 'rating_desc':
        sorted.sort((a, b) => {
          const ratingDiff = (parseFloat(b.vote_average) || 0) - (parseFloat(a.vote_average) || 0);
          if (ratingDiff !== 0) return ratingDiff;
          // Secondary sort by popularity
          return (parseFloat(b.popularity) || 0) - (parseFloat(a.popularity) || 0);
        });
        break;
      case 'rating_asc':
        sorted.sort((a, b) => {
          const ratingDiff = (parseFloat(a.vote_average) || 0) - (parseFloat(b.vote_average) || 0);
          if (ratingDiff !== 0) return ratingDiff;
          // Secondary sort by popularity
          return (parseFloat(b.popularity) || 0) - (parseFloat(a.popularity) || 0);
        });
        break;
      case 'title_asc':
        sorted.sort((a, b) => {
          const titleCompare = (a.title || '').localeCompare(b.title || '');
          if (titleCompare !== 0) return titleCompare;
          // Secondary sort by rating
          return (parseFloat(b.vote_average) || 0) - (parseFloat(a.vote_average) || 0);
        });
        break;
      case 'title_desc':
        sorted.sort((a, b) => {
          const titleCompare = (b.title || '').localeCompare(a.title || '');
          if (titleCompare !== 0) return titleCompare;
          // Secondary sort by rating
          return (parseFloat(b.vote_average) || 0) - (parseFloat(a.vote_average) || 0);
        });
        break;
      case 'date_desc':
        sorted.sort((a, b) => {
          const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
          const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
          const dateDiff = dateB - dateA;
          if (dateDiff !== 0) return dateDiff;
          // Secondary sort by rating
          return (parseFloat(b.vote_average) || 0) - (parseFloat(a.vote_average) || 0);
        });
        break;
      case 'date_asc':
        sorted.sort((a, b) => {
          const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
          const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
          const dateDiff = dateA - dateB;
          if (dateDiff !== 0) return dateDiff;
          // Secondary sort by rating
          return (parseFloat(b.vote_average) || 0) - (parseFloat(a.vote_average) || 0);
        });
        break;
      case 'popularity_desc':
        sorted.sort((a, b) => {
          const popDiff = (parseFloat(b.popularity) || 0) - (parseFloat(a.popularity) || 0);
          if (popDiff !== 0) return popDiff;
          // Secondary sort by rating
          return (parseFloat(b.vote_average) || 0) - (parseFloat(a.vote_average) || 0);
        });
        break;
      case 'popularity_asc':
        sorted.sort((a, b) => {
          const popDiff = (parseFloat(a.popularity) || 0) - (parseFloat(b.popularity) || 0);
          if (popDiff !== 0) return popDiff;
          // Secondary sort by rating
          return (parseFloat(b.vote_average) || 0) - (parseFloat(a.vote_average) || 0);
        });
        break;
      default:
        sorted.sort((a, b) => {
          const ratingDiff = (parseFloat(b.vote_average) || 0) - (parseFloat(a.vote_average) || 0);
          if (ratingDiff !== 0) return ratingDiff;
          return (parseFloat(b.popularity) || 0) - (parseFloat(a.popularity) || 0);
        });
    }

    return sorted;
  }, [movies, popularMovies, query, sortBy]);

  const getSortLabel = () => {
    switch (sortBy) {
      case 'rating_desc': return 'Rating (High to Low)';
      case 'rating_asc': return 'Rating (Low to High)';
      case 'title_asc': return 'Title (A-Z)';
      case 'title_desc': return 'Title (Z-A)';
      case 'date_asc': return 'Release Date (Oldest)';
      case 'date_desc': return 'Release Date (Newest)';
      case 'popularity_desc': return 'Popularity (High to Low)';
      case 'popularity_asc': return 'Popularity (Low to High)';
      default: return 'Rating (High to Low)';
    }
  };

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
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <strong>
                  {query ? `Search Results (${displayMovies.length})` : `Popular Movies (${displayMovies.length})`}
                </strong>
                <InputGroup style={{ width: 'auto' }}>
                  <InputGroup.Text>
                    <FaSortAmountDown />
                  </InputGroup.Text>
                  <Form.Select
                    size="sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ minWidth: '200px' }}
                  >
                    <optgroup label="Rating (IMDB Score)">
                      <option value="rating_desc">High to Low</option>
                      <option value="rating_asc">Low to High</option>
                    </optgroup>
                    <optgroup label="Title">
                      <option value="title_asc">A-Z</option>
                      <option value="title_desc">Z-A</option>
                    </optgroup>
                    <optgroup label="Release Date">
                      <option value="date_desc">Newest First</option>
                      <option value="date_asc">Oldest First</option>
                    </optgroup>
                    <optgroup label="Popularity (TMDB)">
                      <option value="popularity_desc">High to Low</option>
                      <option value="popularity_asc">Low to High</option>
                    </optgroup>
                  </Form.Select>
                </InputGroup>
              </div>
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
