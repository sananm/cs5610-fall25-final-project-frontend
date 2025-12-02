import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, ListGroup } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FaHeart, FaReply } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { postAPI, commentAPI } from '../services/api';

function PostDetails() {
  const { postId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

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
      <Card>
        <Card.Body>
          <div className="d-flex align-items-center mb-3">
            <img
              src={post.author?.profilePicture || 'https://via.placeholder.com/50'}
              alt={post.author?.username}
              className="rounded-circle me-2"
              style={{ width: '50px', height: '50px' }}
            />
            <div>
              <Link to={`/profile/${post.author?._id}`} className="text-decoration-none">
                <strong>{post.author?.username}</strong>
              </Link>
              <div className="text-muted small">
                {new Date(post.createdAt).toLocaleString()}
              </div>
            </div>
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
    </Container>
  );
}

export default PostDetails;
