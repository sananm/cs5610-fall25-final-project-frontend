import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, ListGroup, Badge } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaBookmark, FaStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { movieAPI, postAPI } from '../services/api';

function MovieDetails() {
  const { tmdbId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [localMovie, setLocalMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [postContent, setPostContent] = useState('');

  const IMAGE_BASE = 'https://image.tmdb.org/t/p';

  useEffect(() => {
    fetchMovieDetails();
  }, [tmdbId]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const tmdbRes = await movieAPI.getMovieFromTMDB(tmdbId);
      setMovie(tmdbRes.data);

      // Try to fetch from local DB
      try {
        const localRes = await movieAPI.getAllMovies();
        const found = localRes.data.movies.find(m => m.tmdbId === parseInt(tmdbId));
        if (found) {
          setLocalMovie(found);
          if (user) {
            setIsSaved(found.savedBy?.some(u => u._id === user._id));
          }
        }
      } catch (err) {
        console.log('Movie not in local DB yet');
      }
    } catch (err) {
      console.error('Error fetching movie:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMovie = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await movieAPI.saveMovie({
        tmdbId: movie.id,
        title: movie.title,
        overview: movie.overview,
        posterPath: movie.poster_path,
        backdropPath: movie.backdrop_path,
        releaseDate: movie.release_date,
        voteAverage: movie.vote_average,
        voteCount: movie.vote_count,
        genres: movie.genres?.map(g => g.name),
        runtime: movie.runtime,
        tagline: movie.tagline
      });
      setIsSaved(true);
      fetchMovieDetails();
    } catch (err) {
      console.error('Error saving movie:', err);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!localMovie) {
      await handleSaveMovie();
    }

    try {
      await movieAPI.addReview(localMovie._id, {
        rating: reviewRating,
        content: reviewContent
      });
      setReviewContent('');
      setReviewRating(5);
      fetchMovieDetails();
    } catch (err) {
      console.error('Error adding review:', err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await postAPI.createPost({
        content: postContent,
        movie: localMovie?._id
      });
      setPostContent('');
      alert('Post created successfully!');
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  if (loading) {
    return (
      <Container className="main-content">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      </Container>
    );
  }

  if (!movie) {
    return (
      <Container className="main-content">
        <Card><Card.Body className="text-center">Movie not found</Card.Body></Card>
      </Container>
    );
  }

  return (
    <Container className="main-content py-4">
      <Row>
        <Col lg={4}>
          <Card>
            <Card.Img
              variant="top"
              src={movie.poster_path ?
                `${IMAGE_BASE}/w500${movie.poster_path}` :
                'https://via.placeholder.com/500x750?text=No+Poster'
              }
              alt={movie.title}
            />
            <Card.Body>
              <Button
                variant={isSaved ? 'success' : 'primary'}
                className="w-100"
                onClick={handleSaveMovie}
                disabled={isSaved}
              >
                <FaBookmark className="me-2" />
                {isSaved ? 'Saved' : 'Save Movie'}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="mb-3">
            <Card.Body>
              <h1>{movie.title}</h1>
              {movie.tagline && <p className="text-muted fst-italic">"{movie.tagline}"</p>}
              <div className="mb-3">
                <Badge bg="primary" className="me-2">
                  <FaStar className="me-1" />
                  {movie.vote_average?.toFixed(1)} / 10
                </Badge>
                <Badge bg="secondary">{movie.release_date?.split('-')[0]}</Badge>
                {movie.runtime && (
                  <Badge bg="secondary" className="ms-2">{movie.runtime} min</Badge>
                )}
              </div>
              {movie.genres && (
                <div className="mb-3">
                  {movie.genres.map(genre => (
                    <Badge key={genre.id} bg="light" text="dark" className="me-2">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              )}
              <h5>Overview</h5>
              <p>{movie.overview}</p>
            </Card.Body>
          </Card>

          {isAuthenticated ? (
            <Card className="mb-3">
              <Card.Header><strong>Create a Post</strong></Card.Header>
              <Card.Body>
                <Form onSubmit={handleCreatePost}>
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Share your thoughts about this movie..."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                    />
                  </Form.Group>
                  <Button type="submit" variant="primary" className="mt-2">
                    Post
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          ) : (
            <Card className="mb-3">
              <Card.Body className="text-center p-4 bg-light">
                <p className="mb-2 text-muted">Want to share this movie with your followers?</p>
                <Button as={Link} to="/login" variant="primary" size="sm">
                  Login to Create a Post
                </Button>
              </Card.Body>
            </Card>
          )}

          <Card className="mb-3">
            <Card.Header><strong>Reviews</strong></Card.Header>
            <Card.Body>
              {isAuthenticated ? (
                <Form onSubmit={handleAddReview} className="mb-4">
                  <Form.Group className="mb-2">
                    <Form.Label>Rating (1-10)</Form.Label>
                    <Form.Range
                      min={1}
                      max={10}
                      value={reviewRating}
                      onChange={(e) => setReviewRating(parseInt(e.target.value))}
                    />
                    <div className="text-center"><strong>{reviewRating} / 10</strong></div>
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Write your review..."
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Button type="submit" variant="primary">Submit Review</Button>
                </Form>
              ) : (
                <div className="text-center p-4 bg-light rounded mb-4">
                  <p className="mb-2 text-muted">Want to share your thoughts about this movie?</p>
                  <Button as={Link} to="/login" variant="primary" size="sm">
                    Login to Post a Review
                  </Button>
                  <span className="mx-2 text-muted">or</span>
                  <Button as={Link} to="/register" variant="outline-primary" size="sm">
                    Sign Up
                  </Button>
                </div>
              )}

              {localMovie?.reviews && localMovie.reviews.length > 0 ? (
                <ListGroup variant="flush">
                  {localMovie.reviews.map((review, index) => (
                    <ListGroup.Item key={index}>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <strong>{review.author?.username}</strong>
                        <Badge bg="warning" text="dark">
                          <FaStar /> {review.rating}/10
                        </Badge>
                      </div>
                      <p className="mb-0">{review.content}</p>
                      <small className="text-muted">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </small>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-muted text-center">No reviews yet. Be the first to review!</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default MovieDetails;
