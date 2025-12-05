import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, ListGroup, Modal, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHeart, FaComment, FaShare, FaFilm, FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { postAPI, movieAPI, commentAPI } from '../services/api';
import OnboardingModal from '../components/OnboardingModal';

// Custom Dropdown Toggle without caret
const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <span
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
    style={{ cursor: 'pointer' }}
    className="text-muted"
  >
    {children}
  </span>
));

function Home() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [selectedPostLikes, setSelectedPostLikes] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [deletingPost, setDeletingPost] = useState(null);

  useEffect(() => {
    fetchData();
    checkOnboarding();
  }, [isAuthenticated, user]);

  const checkOnboarding = () => {
    console.log('checkOnboarding called');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
    console.log('hasCompletedOnboarding:', user?.hasCompletedOnboarding);

    if (isAuthenticated && user && !user.hasCompletedOnboarding) {
      console.log('Opening onboarding modal');
      setShowOnboarding(true);
    } else if (user && user.hasCompletedOnboarding) {
      console.log('Onboarding completed, closing modal');
      // If onboarding is completed, make sure modal is closed
      setShowOnboarding(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const postsRes = await (isAuthenticated ? postAPI.getFeed() : postAPI.getAllPosts());
      setPosts(postsRes.data.posts || []);

      // Fetch movies based on user preferences or generic trending
      if (isAuthenticated && user?.preferredGenres && user.preferredGenres.length > 0) {
        await fetchPersonalizedMovies();
      } else {
        const moviesRes = await movieAPI.getTrendingMovies();
        setTrendingMovies(moviesRes.data.results?.slice(0, 6) || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalizedMovies = async () => {
    try {
      // Genre mapping
      const genreMap = {
        'Action': 28, 'Adventure': 12, 'Animation': 16, 'Comedy': 35,
        'Crime': 80, 'Documentary': 99, 'Drama': 18, 'Family': 10751,
        'Fantasy': 14, 'History': 36, 'Horror': 27, 'Music': 10402,
        'Mystery': 9648, 'Romance': 10749, 'Science Fiction': 878,
        'Thriller': 53, 'War': 10752, 'Western': 37
      };

      const preferredGenreIds = user.preferredGenres
        ?.map(genre => genreMap[genre])
        .filter(Boolean) || [];

      // Use user's preferred languages, or default to English
      const languages = user.preferredLanguages || ['en'];
      const allMovies = [];

      // Fetch movies for each language + genre combination
      for (const lang of languages.slice(0, 2)) { // Limit to 2 languages for performance
        for (const genreId of preferredGenreIds.slice(0, 3)) { // Limit to 3 genres
          try {
            const response = await movieAPI.discoverMovies(lang, genreId.toString(), 1);
            allMovies.push(...(response.data.results || []));
          } catch (err) {
            console.error(`Error fetching ${lang} ${genreId} movies:`, err);
          }
        }
      }

      // Remove duplicates
      const uniqueMovies = Array.from(
        new Map(allMovies.map(movie => [movie.id, movie])).values()
      );

      // Sort by popularity and take top 6
      const sortedMovies = uniqueMovies
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 6);

      setTrendingMovies(sortedMovies);
    } catch (err) {
      console.error('Error fetching personalized movies:', err);
      // Fallback to trending if personalization fails
      const moviesRes = await movieAPI.getTrendingMovies();
      setTrendingMovies(moviesRes.data.results?.slice(0, 6) || []);
    }
  };

  const handleOnboardingComplete = () => {
    console.log('handleOnboardingComplete called');
    console.log('Setting showOnboarding to false');
    setShowOnboarding(false);
    console.log('Fetching data...');
    fetchData(); // Refresh to show personalized content
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      await postAPI.createPost({ content: newPost });
      setNewPost('');
      fetchData();
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post');
    }
  };

  const handleLike = async (postId) => {
    if (!isAuthenticated) {
      setError('Please login to like posts');
      return;
    }
    try {
      await postAPI.toggleLike(postId);
      fetchData();
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const toggleComments = async (postId) => {
    const isExpanded = expandedComments[postId];

    if (isExpanded) {
      // Collapse comments
      setExpandedComments({ ...expandedComments, [postId]: false });
    } else {
      // Expand and fetch comments if not already loaded
      setExpandedComments({ ...expandedComments, [postId]: true });

      if (!comments[postId]) {
        await fetchComments(postId);
      }
    }
  };

  const fetchComments = async (postId) => {
    try {
      setLoadingComments({ ...loadingComments, [postId]: true });
      const response = await commentAPI.getComments(postId);
      setComments({ ...comments, [postId]: response.data || [] });
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoadingComments({ ...loadingComments, [postId]: false });
    }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    if (!newComment[postId]?.trim() || !isAuthenticated) return;

    try {
      await commentAPI.createComment(postId, { content: newComment[postId] });
      setNewComment({ ...newComment, [postId]: '' });
      await fetchComments(postId);
      // Update post comment count
      fetchData();
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
    }
  };

  const showPostLikes = async (post) => {
    if (!post.likes || post.likes.length === 0) return;

    try {
      // Fetch full user details for likes
      const postDetails = await postAPI.getPost(post._id);
      setSelectedPostLikes(postDetails.data.likes || []);
      setShowLikesModal(true);
    } catch (err) {
      console.error('Error fetching likes:', err);
      setError('Failed to load likes');
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditedContent(post.content);
    setShowEditModal(true);
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    if (!editedContent.trim()) {
      setError('Post content cannot be empty');
      return;
    }

    try {
      await postAPI.updatePost(editingPost._id, { content: editedContent });
      setShowEditModal(false);
      setEditingPost(null);
      setEditedContent('');
      fetchData();
    } catch (err) {
      console.error('Error updating post:', err);
      setError('Failed to update post');
    }
  };

  const handleDeleteClick = (post) => {
    setDeletingPost(post);
    setShowDeleteModal(true);
  };

  const handleDeletePost = async () => {
    try {
      await postAPI.deletePost(deletingPost._id);
      setShowDeleteModal(false);
      setDeletingPost(null);
      fetchData();
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post');
    }
  };

  const canModifyPost = (post) => {
    if (!isAuthenticated || !user) return false;
    return post.author?._id === user._id ||
           user.role === 'admin' ||
           user.role === 'moderator';
  };

  const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

  return (
    <Container className="main-content py-4">
      <OnboardingModal show={showOnboarding} onComplete={handleOnboardingComplete} />

      {/* Hero Section - Visible to all users */}
      {!isAuthenticated && (
        <Card className="hero-section mb-4 border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <h1 className="display-4 fw-bold mb-3">
              <FaFilm className="me-3 text-primary" />
              ReelTalk
            </h1>
            <p className="lead mb-4">
              Connect with friends and discover amazing movies together
            </p>
            <p className="text-muted mb-4">
              Share your favorite films, get personalized recommendations, and engage with a community of movie lovers
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <Button as={Link} to="/register" variant="primary" size="lg">
                Get Started
              </Button>
              <Button as={Link} to="/search" variant="outline-primary" size="lg">
                Explore Movies
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      <Row>
        <Col lg={8}>
          <h2 className="mb-4">
            {isAuthenticated ? `Welcome back, ${user?.username}!` : 'Latest Posts'}
          </h2>

          {isAuthenticated && (
            <Card className="mb-4">
              <Card.Body>
                <Form onSubmit={handleCreatePost}>
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="What's on your mind?"
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                    />
                  </Form.Group>
                  <div className="d-flex justify-content-end mt-3">
                    <Button type="submit" variant="primary">
                      Post
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}

          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              {posts.length === 0 ? (
                <Card>
                  <Card.Body className="text-center py-5">
                    <p className="text-muted">No posts yet. Be the first to post!</p>
                  </Card.Body>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post._id} className="mb-3">
                    <Card.Body>
                      <div className="d-flex align-items-center mb-3">
                        <img
                          src={post.author?.profilePicture || 'https://via.placeholder.com/40'}
                          alt={post.author?.username}
                          className="rounded-circle me-2"
                          style={{ width: '40px', height: '40px' }}
                        />
                        <div className="flex-grow-1">
                          <Link to={`/profile/${post.author?._id}`} className="text-decoration-none">
                            <strong>{post.author?.username}</strong>
                          </Link>
                          {post.author?.role === 'moderator' && (
                            <span className="badge bg-success ms-2">Moderator</span>
                          )}
                          {post.author?.role === 'admin' && (
                            <span className="badge bg-danger ms-2">Admin</span>
                          )}
                          <div className="text-muted small">
                            {new Date(post.createdAt).toLocaleString()}
                            {post.isEdited && <span className="ms-1">(edited)</span>}
                          </div>
                        </div>
                        {canModifyPost(post) && (
                          <Dropdown align="end">
                            <Dropdown.Toggle as={CustomToggle} id={`dropdown-${post._id}`}>
                              <FaEllipsisV />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => handleEditPost(post)}>
                                <FaEdit className="me-2" />
                                Edit
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleDeleteClick(post)} className="text-danger">
                                <FaTrash className="me-2" />
                                Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        )}
                      </div>
                      <p>{post.content}</p>
                      {post.movie && (
                        <Card className="mb-2 border">
                          <Card.Body>
                            <Link to={`/details/${post.movie.tmdbId}`} className="text-decoration-none">
                              <div className="d-flex">
                                <img
                                  src={`${IMAGE_BASE}${post.movie.posterPath}`}
                                  alt={post.movie.title}
                                  style={{ width: '60px', height: 'auto' }}
                                  className="me-3"
                                />
                                <div>
                                  <strong>{post.movie.title}</strong>
                                  <p className="text-muted small mb-0">{post.movie.overview?.substring(0, 100)}...</p>
                                </div>
                              </div>
                            </Link>
                          </Card.Body>
                        </Card>
                      )}
                      <div className="d-flex gap-3 pt-2 border-top">
                        <Button
                          variant="link"
                          className="text-decoration-none"
                          onClick={() => handleLike(post._id)}
                        >
                          <FaHeart className={post.likes?.includes(user?._id) ? 'text-danger' : 'text-muted'} />
                          <span
                            className="ms-1"
                            style={{ cursor: post.likes?.length > 0 ? 'pointer' : 'default' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (post.likes?.length > 0) showPostLikes(post);
                            }}
                          >
                            {post.likes?.length || 0}
                          </span>
                        </Button>
                        <Button
                          variant="link"
                          onClick={() => toggleComments(post._id)}
                          className="text-decoration-none text-muted"
                        >
                          <FaComment />
                          <span className="ms-1">{post.comments?.length || 0}</span>
                        </Button>
                      </div>

                      {/* Inline Comments Section */}
                      {expandedComments[post._id] && (
                        <div className="mt-3 pt-3 border-top">
                          {isAuthenticated ? (
                            <Form onSubmit={(e) => handleAddComment(e, post._id)} className="mb-3">
                              <Form.Group>
                                <Form.Control
                                  as="textarea"
                                  rows={2}
                                  placeholder="Write a comment..."
                                  value={newComment[post._id] || ''}
                                  onChange={(e) => setNewComment({ ...newComment, [post._id]: e.target.value })}
                                />
                              </Form.Group>
                              <Button type="submit" variant="primary" size="sm" className="mt-2">
                                Comment
                              </Button>
                            </Form>
                          ) : (
                            <p className="text-muted text-center mb-3">
                              <Link to="/login">Login</Link> to comment
                            </p>
                          )}

                          {loadingComments[post._id] ? (
                            <div className="text-center py-3">
                              <div className="spinner-border spinner-border-sm text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            </div>
                          ) : comments[post._id]?.length === 0 ? (
                            <p className="text-muted text-center small">No comments yet. Be the first to comment!</p>
                          ) : (
                            <ListGroup variant="flush">
                              {comments[post._id]?.map((comment) => (
                                <ListGroup.Item key={comment._id} className="px-0 border-0">
                                  <div className="d-flex">
                                    <img
                                      src={comment.author?.profilePicture || 'https://via.placeholder.com/32'}
                                      alt={comment.author?.username}
                                      className="rounded-circle me-2"
                                      style={{ width: '32px', height: '32px' }}
                                    />
                                    <div className="flex-grow-1">
                                      <div className="bg-light p-2 rounded">
                                        <Link to={`/profile/${comment.author?._id}`} className="text-decoration-none">
                                          <strong className="small">{comment.author?.username}</strong>
                                        </Link>
                                        <p className="mb-0 mt-1 small">{comment.content}</p>
                                      </div>
                                      <div className="text-muted small mt-1">
                                        {new Date(comment.createdAt).toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          )}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                ))
              )}
            </>
          )}
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header>
              <strong>
                {isAuthenticated && user?.preferredGenres?.length > 0
                  ? 'Recommended For You'
                  : 'Trending Movies'}
              </strong>
            </Card.Header>
            <Card.Body>
              {trendingMovies.map((movie) => (
                <Link
                  key={movie.id}
                  to={`/details/${movie.id}`}
                  className="text-decoration-none"
                >
                  <div className="d-flex mb-3 pb-3 border-bottom">
                    <img
                      src={`${IMAGE_BASE}${movie.poster_path}`}
                      alt={movie.title}
                      style={{ width: '60px', height: 'auto' }}
                      className="me-2"
                    />
                    <div className="flex-grow-1">
                      <div className="fw-bold">{movie.title}</div>
                      <div className="text-muted small">
                        ⭐ {movie.vote_average?.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </Card.Body>
          </Card>

          {!isAuthenticated && (
            <Card className="mt-3">
              <Card.Body>
                <h5>Join ReelTalk</h5>
                <p className="text-muted">Connect with friends and discover amazing movies!</p>
                <Button as={Link} to="/register" variant="primary" className="w-100">
                  Sign Up
                </Button>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Likes Modal */}
      <Modal show={showLikesModal} onHide={() => setShowLikesModal(false)} centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Likes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPostLikes.length === 0 ? (
            <p className="text-muted text-center">No likes yet</p>
          ) : (
            <ListGroup variant="flush">
              {selectedPostLikes.map((likedUser) => (
                <ListGroup.Item key={likedUser._id} className="px-0">
                  <div className="d-flex align-items-center">
                    <img
                      src={likedUser.profilePicture || 'https://via.placeholder.com/40'}
                      alt={likedUser.username}
                      className="rounded-circle me-2"
                      style={{ width: '40px', height: '40px' }}
                    />
                    <div className="flex-grow-1">
                      <Link
                        to={`/profile/${likedUser._id}`}
                        className="text-decoration-none"
                        onClick={() => setShowLikesModal(false)}
                      >
                        <strong>{likedUser.username}</strong>
                      </Link>
                      {likedUser.firstName && likedUser.lastName && (
                        <div className="text-muted small">
                          {likedUser.firstName} {likedUser.lastName}
                        </div>
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
      </Modal>

      {/* Edit Post Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdatePost}>
            <Form.Group>
              <Form.Label>Post Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="What's on your mind?"
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this post? This action cannot be undone.</p>
          {deletingPost && (
            <Card className="bg-light">
              <Card.Body>
                <p className="mb-0 text-muted small">{deletingPost.content}</p>
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeletePost}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Home;
