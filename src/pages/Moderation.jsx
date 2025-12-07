import React, { useState, useEffect } from 'react';
import { Container, Card, ListGroup, Button, Badge, Alert, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaFlag, FaTrash, FaEye, FaUser, FaCalendar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../services/api';
import { toast } from 'react-toastify';

function Moderation() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [reportedPosts, setReportedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  useEffect(() => {
    // Redirect if not authenticated or not a moderator/admin
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'moderator' && user?.role !== 'admin') {
      navigate('/');
      toast.error('Access denied. Moderator or admin privileges required.');
      return;
    }

    fetchReportedPosts();
  }, [isAuthenticated, user, navigate]);

  const fetchReportedPosts = async () => {
    try {
      setLoading(true);
      const response = await postAPI.getReportedPosts();
      setReportedPosts(response.data || []);
    } catch (err) {
      console.error('Error fetching reported posts:', err);
      toast.error('Failed to load reported posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;

    try {
      await postAPI.deletePost(postToDelete._id);
      toast.success('Post deleted successfully');
      setReportedPosts(reportedPosts.filter(p => p._id !== postToDelete._id));
      setShowDeleteModal(false);
      setPostToDelete(null);
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error('Failed to delete post');
    }
  };

  const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

  if (loading) {
    return (
      <Container className="main-content py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="main-content py-4">
      <Card className="mb-4">
        <Card.Header className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <FaFlag className="text-danger me-2" />
            <h4 className="mb-0">Moderation Dashboard</h4>
          </div>
          <Badge bg="danger" pill>
            {reportedPosts.length} Reported {reportedPosts.length === 1 ? 'Post' : 'Posts'}
          </Badge>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">
            <strong>Moderator Role:</strong> Review reported posts and take appropriate action. Posts with multiple reports appear first.
          </Alert>
        </Card.Body>
      </Card>

      {reportedPosts.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <FaFlag size={50} className="text-muted mb-3" />
            <h5 className="text-muted">No Reported Posts</h5>
            <p className="text-muted">All clear! There are no posts pending moderation.</p>
          </Card.Body>
        </Card>
      ) : (
        <ListGroup>
          {reportedPosts.map((post) => (
            <ListGroup.Item key={post._id} className="mb-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  {/* Post Author Info */}
                  <div className="d-flex align-items-center mb-2">
                    <img
                      src={post.author?.profilePicture || "/default-avatar.png"}
                      alt={post.author?.username}
                      className="rounded-circle me-2"
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <Link
                          to={`/profile/${post.author?._id}`}
                          className="text-decoration-none fw-bold"
                        >
                          <FaUser className="me-1" />
                          {post.author?.username}
                        </Link>
                        {post.author?.role === 'admin' && (
                          <Badge bg="danger" className="small">Admin</Badge>
                        )}
                        {post.author?.role === 'moderator' && (
                          <Badge bg="success" className="small">Moderator</Badge>
                        )}
                      </div>
                      <div className="text-muted small">
                        <FaCalendar className="me-1" />
                        {new Date(post.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <Card className="mb-2">
                    <Card.Body>
                      <p className="mb-2">{post.content}</p>

                      {/* Post Images */}
                      {post.images && post.images.length > 0 && (
                        <div className="d-flex flex-wrap gap-2 mb-2">
                          {post.images.map((image, idx) => (
                            <img
                              key={idx}
                              src={image}
                              alt={`Post image ${idx + 1}`}
                              style={{
                                maxWidth: '200px',
                                maxHeight: '200px',
                                borderRadius: '8px',
                                objectFit: 'cover'
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Movie Card */}
                      {post.movie && (
                        <Card className="border">
                          <Card.Body className="p-2">
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={post.movie.posterPath ?
                                  `${IMAGE_BASE}${post.movie.posterPath}` :
                                  'https://via.placeholder.com/50x75?text=No+Poster'
                                }
                                alt={post.movie.title}
                                style={{ width: '50px', height: '75px', borderRadius: '4px' }}
                              />
                              <div>
                                <strong>{post.movie.title}</strong>
                                <div className="text-muted small">
                                  {post.movie.releaseDate?.substring(0, 4)}
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      )}

                      {/* Post Stats */}
                      <div className="text-muted small mt-2">
                        {post.likes?.length || 0} likes · {post.comments?.length || 0} comments
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Report Info */}
                  <div className="d-flex align-items-center gap-3">
                    <Badge bg="danger" className="d-flex align-items-center">
                      <FaFlag className="me-1" />
                      {post.reportCount} {post.reportCount === 1 ? 'Report' : 'Reports'}
                    </Badge>
                    <small className="text-muted">Post ID: {post._id}</small>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex flex-column gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    as={Link}
                    to={`/posts/${post._id}`}
                    title="View full post"
                  >
                    <FaEye className="me-1" /> View
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteClick(post)}
                    title="Delete post"
                  >
                    <FaTrash className="me-1" /> Delete
                  </Button>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <strong>Warning:</strong> This action cannot be undone.
          </Alert>
          <p>Are you sure you want to delete this post?</p>
          {postToDelete && (
            <Card className="bg-light">
              <Card.Body>
                <small className="text-muted">Post by: </small>
                <strong>{postToDelete.author?.username}</strong>
                <p className="mb-0 mt-2">{postToDelete.content?.substring(0, 100)}...</p>
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeletePost}>
            <FaTrash className="me-1" /> Delete Post
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Moderation;
