import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, ListGroup, Badge } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaBookmark, FaStar, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { movieAPI, postAPI } from '../services/api';

function MovieDetails() {
  const { tmdbId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [localMovie, setLocalMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [postContent, setPostContent] = useState('');

  const IMAGE_BASE = 'https://image.tmdb.org/t/p';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tmdbId]);

  useEffect(() => {
    fetchMovieDetails();
  }, [tmdbId, user]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      // Fetch movie details and credits in parallel
      const [tmdbRes, creditsRes] = await Promise.all([
        movieAPI.getMovieFromTMDB(tmdbId),
        movieAPI.getMovieCredits(tmdbId)
      ]);

      setMovie(tmdbRes.data);
      setCredits(creditsRes.data);

      // Try to fetch from local DB and check if user has saved it
      try {
        if (user) {
          // Fetch user's saved movies to check if this movie is saved
          const userMoviesRes = await movieAPI.getUserMovies(user._id);
          const savedMovies = userMoviesRes.data || [];
          const isSavedByUser = savedMovies.some(m => m.tmdbId === parseInt(tmdbId));
          setIsSaved(isSavedByUser);

          // If saved, set the local movie data
          if (isSavedByUser) {
            const savedMovie = savedMovies.find(m => m.tmdbId === parseInt(tmdbId));
            setLocalMovie(savedMovie);
          }
        }

        // Also fetch from all movies to get reviews and other data
        const localRes = await movieAPI.getAllMovies();
        const found = localRes.data.movies.find(m => m.tmdbId === parseInt(tmdbId));
        if (found && !localMovie) {
          setLocalMovie(found);
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
      const response = await movieAPI.saveMovie({
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

      // Update state immediately without full refresh
      setIsSaved(true);
      setLocalMovie(response.data);

      // Show success notification
      toast.success(
        <div className="d-flex align-items-center">
          <FaCheck className="me-2" />
          <span>Movie saved successfully!</span>
        </div>,
        {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
        }
      );
    } catch (err) {
      console.error('Error saving movie:', err);
      toast.error('Failed to save movie. Please try again.', {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };

  const handleUnsaveMovie = async () => {
    if (!isAuthenticated || !localMovie) {
      return;
    }

    try {
      await movieAPI.unsaveMovie(localMovie._id);

      // Update state immediately
      setIsSaved(false);

      // Show success notification
      toast.info('Movie removed from saved', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
      });
    } catch (err) {
      console.error('Error unsaving movie:', err);
      toast.error('Failed to remove movie. Please try again.', {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };

  const handleToggleSave = () => {
    if (isSaved) {
      handleUnsaveMovie();
    } else {
      handleSaveMovie();
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

      toast.success('Review posted successfully!', {
        position: "bottom-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error('Error adding review:', err);
      toast.error(err.response?.data?.message || 'Failed to post review', {
        position: "bottom-right",
        autoClose: 3000,
      });
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

      toast.success('Post created successfully!', {
        position: "bottom-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error('Error creating post:', err);
      toast.error('Failed to create post. Please try again.', {
        position: "bottom-right",
        autoClose: 3000,
      });
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
                variant={isSaved ? 'outline-danger' : 'primary'}
                className="w-100"
                onClick={handleToggleSave}
              >
                {isSaved ? (
                  <>
                    <FaTimes className="me-2" />
                    Remove from Saved
                  </>
                ) : (
                  <>
                    <FaBookmark className="me-2" />
                    Save Movie
                  </>
                )}
              </Button>
              {isSaved && (
                <div className="text-center mt-2">
                  <small className="text-success">
                    <FaCheck className="me-1" />
                    Saved to your collection
                  </small>
                </div>
              )}
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
                  <span className="numeric-value">{movie.vote_average?.toFixed(1)}</span> / 10
                </Badge>
                <Badge bg="secondary">{movie.release_date?.split('-')[0]}</Badge>
                {movie.runtime && (
                  <Badge bg="secondary" className="ms-2"><span className="numeric-value">{movie.runtime}</span> min</Badge>
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

              {credits && (
                <>
                  {/* Director Section */}
                  {credits.crew && credits.crew.find(person => person.job === 'Director') && (
                    <div className="mb-3">
                      <h6>Director</h6>
                      <p className="mb-0">
                        {credits.crew
                          .filter(person => person.job === 'Director')
                          .map(director => director.name)
                          .join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Cast Section */}
                  {credits.cast && credits.cast.length > 0 && (
                    <div className="mb-3">
                      <h6>Cast</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {credits.cast.slice(0, 10).map((actor) => (
                          <div key={actor.id} className="text-center" style={{ width: '80px' }}>
                            <img
                              src={
                                actor.profile_path
                                  ? `${IMAGE_BASE}/w185${actor.profile_path}`
                                  : 'https://via.placeholder.com/80x120?text=No+Photo'
                              }
                              alt={actor.name}
                              className="rounded mb-1"
                              style={{ width: '80px', height: '120px', objectFit: 'cover' }}
                            />
                            <small className="d-block text-truncate" style={{ fontSize: '0.75rem' }}>
                              <strong>{actor.name}</strong>
                            </small>
                            <small className="d-block text-muted text-truncate" style={{ fontSize: '0.7rem' }}>
                              {actor.character}
                            </small>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
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
                        <Link
                          to={`/profile/${review.author?._id}`}
                          className="text-decoration-none"
                        >
                          <strong>{review.author?.username}</strong>
                        </Link>
                        <Badge bg="warning" text="dark">
                          <FaStar /> {review.rating}/10
                        </Badge>
                      </div>
                      <p className="mb-0">{review.content}</p>
                      <small className="text-muted">
                        {new Date(review.createdAt).toLocaleString()}
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
