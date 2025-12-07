import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, ListGroup, Modal, Dropdown, Alert } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaReply, FaEllipsisV, FaEdit, FaTrash, FaFlag } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { postAPI, commentAPI } from '../services/api';

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

function PostDetails() {
  const { postId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      const [postRes, commentsRes] = await Promise.all([
        postAPI.getPost(postId),
        commentAPI.getComments(postId)
      ]);
      setPost(postRes.data);
      setComments(commentsRes.data || []);
    } catch (err) {
      console.error('Error fetching post details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) return;
    try {
      await postAPI.toggleLike(postId);
      fetchPostDetails();
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    try {
      await commentAPI.createComment(postId, { content: newComment });
      setNewComment('');
      fetchPostDetails();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleEditPost = () => {
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
      await postAPI.updatePost(postId, { content: editedContent });
      setShowEditModal(false);
      setEditedContent('');
      fetchPostDetails();
    } catch (err) {
      console.error('Error updating post:', err);
      setError('Failed to update post');
    }
  };

  const handleDeletePost = async () => {
    try {
      await postAPI.deletePost(postId);
      navigate('/');
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post');
      setShowDeleteModal(false);
    }
  };

  const handleReportPost = async () => {
    try {
      await postAPI.reportPost(postId);
      setShowReportModal(false);
      setError('Post reported successfully. Our moderation team will review it.');
    } catch (err) {
      console.error('Error reporting post:', err);
      setError('Failed to report post');
    }
  };

  const canModifyPost = () => {
    if (!isAuthenticated || !user || !post) return false;
    return post.author?._id === user._id ||
           user.role === 'admin' ||
           user.role === 'moderator';
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

  if (!post) {
    return (
      <Container className="main-content">
        <Card><Card.Body className="text-center">Post not found</Card.Body></Card>
      </Container>
    );
  }

  return (
    <Container className="main-content py-4" style={{ maxWidth: '800px' }}>
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Card>
        <Card.Body>
          <div className="d-flex align-items-center mb-3">
            <img
              src={post.author?.profilePicture || "/default-avatar.png"}
              alt={post.author?.username}
              className="rounded-circle me-2"
              style={{ width: '50px', height: '50px' }}
            />
            <div className="flex-grow-1">
              <Link to={`/profile/${post.author?._id}`} className="text-decoration-none">
                <strong>{post.author?.username}</strong>
              </Link>
              <div className="text-muted small">
                {new Date(post.createdAt).toLocaleString()}
                {post.isEdited && <span className="ms-1">(edited)</span>}
              </div>
            </div>
            {isAuthenticated && (
              <Dropdown align="end">
                <Dropdown.Toggle as={CustomToggle} id="dropdown-post">
                  <FaEllipsisV />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {canModifyPost() ? (
                    <>
                      <Dropdown.Item onClick={handleEditPost}>
                        <FaEdit className="me-2" />
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => setShowDeleteModal(true)} className="text-danger">
                        <FaTrash className="me-2" />
                        Delete
                      </Dropdown.Item>
                    </>
                  ) : (
                    <Dropdown.Item onClick={() => setShowReportModal(true)} className="text-warning">
                      <FaFlag className="me-2" />
                      Report Post
                    </Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>

          <p className="fs-5">{post.content}</p>

          <div className="d-flex gap-3 pt-3 border-top">
            <Button
              variant="link"
              className="text-decoration-none"
              onClick={handleLike}
              disabled={!isAuthenticated}
            >
              <FaHeart className={post.likes?.includes(user?._id) ? 'text-danger' : 'text-muted'} />
              <span className="ms-1">{post.likes?.length || 0} Likes</span>
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Card className="mt-3">
        <Card.Header><strong>Comments ({comments.length})</strong></Card.Header>
        <Card.Body>
          {isAuthenticated ? (
            <Form onSubmit={handleAddComment} className="mb-4">
              <Form.Group>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </Form.Group>
              <Button type="submit" variant="primary" size="sm" className="mt-2">
                Comment
              </Button>
            </Form>
          ) : (
            <p className="text-muted text-center">
              <Link to="/login">Login</Link> to comment
            </p>
          )}

          {comments.length === 0 ? (
            <p className="text-muted text-center">No comments yet. Be the first to comment!</p>
          ) : (
            <ListGroup variant="flush">
              {comments.map((comment) => (
                <ListGroup.Item key={comment._id} className="px-0">
                  <div className="d-flex">
                    <img
                      src={comment.author?.profilePicture || "/default-avatar.png"}
                      alt={comment.author?.username}
                      className="rounded-circle me-2"
                      style={{ width: '32px', height: '32px' }}
                    />
                    <div className="flex-grow-1">
                      <div className="bg-light p-2 rounded">
                        <Link to={`/profile/${comment.author?._id}`} className="text-decoration-none">
                          <strong className="small">{comment.author?.username}</strong>
                        </Link>
                        <p className="mb-0 mt-1">{comment.content}</p>
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
        </Card.Body>
      </Card>

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
          {post && (
            <Card className="bg-light">
              <Card.Body>
                <p className="mb-0 text-muted small">{post.content}</p>
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

      {/* Report Modal */}
      <Modal show={showReportModal} onHide={() => setShowReportModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Report Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <FaFlag className="me-2" />
            <strong>Report this post to moderators</strong>
          </Alert>
          <p>This post will be flagged for review by our moderation team. If it violates our community guidelines, appropriate action will be taken.</p>
          {post && (
            <Card className="bg-light">
              <Card.Body>
                <div className="d-flex align-items-start mb-2">
                  <img
                    src={post.author?.profilePicture || "/default-avatar.png"}
                    alt={post.author?.username}
                    className="rounded-circle me-2"
                    style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                  />
                  <div>
                    <strong className="small">{post.author?.username}</strong>
                    <p className="mb-0 text-muted small mt-1">{post.content}</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
          <p className="text-muted small mt-3 mb-0">
            <strong>Note:</strong> False reports may result in action against your account.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReportModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleReportPost}>
            <FaFlag className="me-1" /> Report Post
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default PostDetails;
