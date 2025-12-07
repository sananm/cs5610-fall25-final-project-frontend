import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Tab, Tabs, ListGroup, Modal, Form, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, postAPI, movieAPI, authAPI, commentAPI } from '../services/api';
import { FaUserPlus, FaUserMinus, FaEdit, FaStar, FaHeart, FaComment, FaFlag, FaEllipsisV, FaTrash } from 'react-icons/fa';

function Profile() {
  const { userId } = useParams();
  const { user: currentUser, isAuthenticated, updateUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [savedMovies, setSavedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Edit profile states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    website: '',
    phone: '',
    profilePicture: '',
    coverPhoto: ''
  });
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Post interaction states
  const [expandedComments, setExpandedComments] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [selectedPostLikes, setSelectedPostLikes] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingPost, setReportingPost] = useState(null);

  const isOwnProfile = !userId || (currentUser && userId === currentUser._id);
  const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const targetUserId = userId || currentUser?._id;

      if (!targetUserId) {
        setLoading(false);
        return;
      }

      const [userRes, postsRes, followersRes, followingRes, savedMoviesRes] = await Promise.all([
        userAPI.getUserById(targetUserId),
        userAPI.getUserPosts(targetUserId),
        userAPI.getFollowers(targetUserId),
        userAPI.getFollowing(targetUserId),
        movieAPI.getUserMovies(targetUserId).catch(() => ({ data: [] }))
      ]);

      setProfileUser(userRes.data);
      setPosts(postsRes.data.posts || []);
      setFollowers(followersRes.data || []);
      setFollowing(followingRes.data || []);
      setSavedMovies(savedMoviesRes.data || []);

      // Initialize edit form with current user data
      if (isOwnProfile && userRes.data) {
        setEditForm({
          firstName: userRes.data.firstName || '',
          lastName: userRes.data.lastName || '',
          bio: userRes.data.bio || '',
          location: userRes.data.location || '',
          website: userRes.data.website || '',
          phone: userRes.data.phone || '',
          profilePicture: userRes.data.profilePicture || '',
          coverPhoto: userRes.data.coverPhoto || ''
        });
      }

      if (currentUser && userRes.data.followers) {
        setIsFollowing(userRes.data.followers.some(f => f._id === currentUser._id));
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
    setEditError('');
    setEditSuccess('');
  };

  const handleEditFormChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();

    try {
      setEditError('');
      setEditSuccess('');

      const response = await authAPI.updateProfile(editForm);

      if (response.data) {
        // Update local state without triggering re-fetch
        setProfileUser(response.data);

        // Also update the edit form with new values
        setEditForm({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          bio: response.data.bio || '',
          location: response.data.location || '',
          website: response.data.website || '',
          phone: response.data.phone || '',
          profilePicture: response.data.profilePicture || '',
          coverPhoto: response.data.coverPhoto || ''
        });

        // Update context for navbar/other components
        updateUser(response.data);

        // Show success message
        setEditSuccess('Profile updated successfully!');

        // Close modal after brief delay to show success message
        setTimeout(() => {
          setShowEditModal(false);
          setEditSuccess('');
        }, 1500);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setEditError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) return;

    try {
      if (isFollowing) {
        await userAPI.unfollowUser(profileUser._id);
      } else {
        await userAPI.followUser(profileUser._id);
      }
      setIsFollowing(!isFollowing);
      fetchProfile();
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  const handleLike = async (postId) => {
    if (!isAuthenticated) return;

    try {
      await postAPI.toggleLike(postId);
      // Update local state
      setPosts(posts.map(post => {
        if (post._id === postId) {
          const isLiked = post.likes?.includes(currentUser._id);
          return {
            ...post,
            likes: isLiked
              ? post.likes.filter(id => id !== currentUser._id)
              : [...(post.likes || []), currentUser._id]
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const toggleComments = async (postId) => {
    if (!expandedComments[postId]) {
      // Load comments if not loaded
      try {
        setLoadingComments({ ...loadingComments, [postId]: true });
        const response = await commentAPI.getComments(postId);
        setComments({ ...comments, [postId]: response.data || [] });
        setLoadingComments({ ...loadingComments, [postId]: false });
      } catch (err) {
        console.error('Error loading comments:', err);
        setLoadingComments({ ...loadingComments, [postId]: false });
      }
    }
    setExpandedComments({
      ...expandedComments,
      [postId]: !expandedComments[postId]
    });
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    if (!isAuthenticated || !newComment[postId]?.trim()) return;

    try {
      const response = await commentAPI.createComment(postId, {
        content: newComment[postId]
      });
      setComments({
        ...comments,
        [postId]: [...(comments[postId] || []), response.data]
      });
      setNewComment({ ...newComment, [postId]: '' });
      // Update comment count
      setPosts(posts.map(post =>
        post._id === postId
          ? { ...post, comments: [...(post.comments || []), response.data._id] }
          : post
      ));
    } catch (err) {
      console.error('Error adding comment:', err);
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
    }
  };

  const handleReportClick = (post) => {
    setReportingPost(post);
    setShowReportModal(true);
  };

  const handleReportPost = async () => {
    if (!reportingPost) return;

    try {
      await postAPI.reportPost(reportingPost._id);
      setShowReportModal(false);
      setReportingPost(null);
      alert('Post reported successfully. Our moderation team will review it.');
    } catch (err) {
      console.error('Error reporting post:', err);
      alert('Failed to report post');
    }
  };

  const canModifyPost = (post) => {
    if (!isAuthenticated || !currentUser) return false;
    return post.author?._id === currentUser._id ||
           currentUser.role === 'admin' ||
           currentUser.role === 'moderator';
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

  if (!profileUser) {
    return (
      <Container className="main-content">
        <Card>
          <Card.Body className="text-center">
            <p>User not found</p>
            <Button as={Link} to="/" variant="primary">Go Home</Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="main-content py-4">
      <div className="profile-header">
        <div
          className="profile-cover"
          style={profileUser.coverPhoto && !profileUser.coverPhoto.includes('placeholder') ? {
            backgroundImage: `url(${profileUser.coverPhoto})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}}
        ></div>
        <div className="profile-info">
          <img
            src={profileUser.profilePicture || 'https://via.placeholder.com/150'}
            alt={profileUser.username}
            className="profile-picture"
          />
          <div className="profile-details">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h2>{profileUser.firstName && profileUser.lastName ?
                  `${profileUser.firstName} ${profileUser.lastName}` :
                  profileUser.username}
                </h2>
                <p className="text-muted">@{profileUser.username}</p>
                {profileUser.role && profileUser.role !== 'regular' && (
                  <span className={`badge ${
                    profileUser.role === 'admin' ? 'bg-danger' :
                    profileUser.role === 'moderator' ? 'bg-success' :
                    'bg-secondary'
                  }`}>
                    {profileUser.role.toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                {isOwnProfile ? (
                  <Button variant="primary" onClick={handleEditProfile}>
                    <FaEdit className="me-1" /> Edit Profile
                  </Button>
                ) : isAuthenticated && (
                  <Button
                    variant={isFollowing ? 'outline-secondary' : 'primary'}
                    onClick={handleFollowToggle}
                  >
                    {isFollowing ? (
                      <><FaUserMinus className="me-1" /> Unfollow</>
                    ) : (
                      <><FaUserPlus className="me-1" /> Follow</>
                    )}
                  </Button>
                )}
              </div>
            </div>
            {profileUser.bio && <p className="mt-3">{profileUser.bio}</p>}
            <div className="d-flex gap-4 mt-3">
              <div>
                <strong className="text-end d-inline-block" style={{ minWidth: '30px' }}>{posts.length}</strong> Posts
              </div>
              <div>
                <strong className="text-end d-inline-block" style={{ minWidth: '30px' }}>{followers.length}</strong> Followers
              </div>
              <div>
                <strong className="text-end d-inline-block" style={{ minWidth: '30px' }}>{following.length}</strong> Following
              </div>
            </div>
          </div>
        </div>
      </div>

      <Row className="mt-4">
        <Col lg={8}>
          <Card>
            <Card.Header>
              <strong>Posts</strong>
            </Card.Header>
            <Card.Body>
              {posts.length === 0 ? (
                <p className="text-center text-muted py-4">No posts yet</p>
              ) : (
                posts.map((post) => (
                  <Card key={post._id} className="mb-3">
                    <Card.Body>
                      <div className="d-flex align-items-center mb-2">
                        <img
                          src={post.author?.profilePicture || 'https://via.placeholder.com/40'}
                          alt={post.author?.username}
                          className="rounded-circle me-2"
                          style={{ width: '40px', height: '40px' }}
                        />
                        <div className="flex-grow-1">
                          <strong>{post.author?.username}</strong>
                          <div className="text-muted small">
                            {new Date(post.createdAt).toLocaleString()}
                            {post.isEdited && <span className="ms-1">(edited)</span>}
                          </div>
                        </div>
                        {isAuthenticated && currentUser && post.author?._id !== currentUser._id && (
                          <Button
                            variant="link"
                            className="text-muted p-0"
                            onClick={() => handleReportClick(post)}
                            title="Report Post"
                          >
                            <FaFlag />
                          </Button>
                        )}
                      </div>

                      <p className="mb-2">{post.content}</p>

                      {post.images && post.images.length > 0 && (
                        <div className="mb-2">
                          {post.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt="Post"
                              className="img-fluid rounded mb-2"
                              style={{ maxHeight: '400px' }}
                            />
                          ))}
                        </div>
                      )}

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
                                  <p className="text-muted small mb-0">
                                    {post.movie.overview?.substring(0, 100)}...
                                  </p>
                                </div>
                              </div>
                            </Link>
                          </Card.Body>
                        </Card>
                      )}

                      <div className="d-flex gap-3 pt-2 border-top">
                        <div className="d-flex align-items-center gap-2">
                          <Button
                            variant="link"
                            className="text-decoration-none p-0"
                            onClick={() => handleLike(post._id)}
                            disabled={!isAuthenticated}
                            title={post.likes?.includes(currentUser?._id) ? "Unlike" : "Like"}
                          >
                            <FaHeart className={post.likes?.includes(currentUser?._id) ? 'text-danger' : 'text-muted'} />
                          </Button>
                          {post.likes?.length > 0 && (
                            <Button
                              variant="link"
                              className="text-decoration-none p-0 ps-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                showPostLikes(post);
                              }}
                              title="View who liked this post"
                              style={{
                                fontSize: '0.95rem',
                                minWidth: '30px'
                              }}
                            >
                              <span className="text-muted hover-underline">
                                {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
                              </span>
                            </Button>
                          )}
                          {!post.likes?.length && (
                            <span className="text-muted" style={{ fontSize: '0.95rem' }}>
                              0 likes
                            </span>
                          )}
                        </div>
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
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Tabs defaultActiveKey="followers" className="mb-3">
            <Tab eventKey="followers" title={`Followers (${followers.length})`}>
              <Card>
                <ListGroup variant="flush">
                  {followers.length === 0 ? (
                    <ListGroup.Item className="text-center text-muted">
                      No followers yet
                    </ListGroup.Item>
                  ) : (
                    followers.map((follower) => (
                      <ListGroup.Item key={follower._id} as={Link} to={`/profile/${follower._id}`}>
                        <div className="d-flex align-items-center">
                          <img
                            src={follower.profilePicture || 'https://via.placeholder.com/40'}
                            alt={follower.username}
                            className="rounded-circle me-2"
                            style={{ width: '40px', height: '40px' }}
                          />
                          <div>
                            <strong>{follower.username}</strong>
                            {follower.bio && (
                              <div className="text-muted small">{follower.bio.substring(0, 50)}...</div>
                            )}
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))
                  )}
                </ListGroup>
              </Card>
            </Tab>

            <Tab eventKey="following" title={`Following (${following.length})`}>
              <Card>
                <ListGroup variant="flush">
                  {following.length === 0 ? (
                    <ListGroup.Item className="text-center text-muted">
                      Not following anyone yet
                    </ListGroup.Item>
                  ) : (
                    following.map((followedUser) => (
                      <ListGroup.Item key={followedUser._id} as={Link} to={`/profile/${followedUser._id}`}>
                        <div className="d-flex align-items-center">
                          <img
                            src={followedUser.profilePicture || 'https://via.placeholder.com/40'}
                            alt={followedUser.username}
                            className="rounded-circle me-2"
                            style={{ width: '40px', height: '40px' }}
                          />
                          <div>
                            <strong>{followedUser.username}</strong>
                            {followedUser.bio && (
                              <div className="text-muted small">{followedUser.bio.substring(0, 50)}...</div>
                            )}
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))
                  )}
                </ListGroup>
              </Card>
            </Tab>

            <Tab eventKey="savedMovies" title={`Saved Movies (${savedMovies.length})`}>
              <Card>
                <ListGroup variant="flush">
                  {savedMovies.length === 0 ? (
                    <ListGroup.Item className="text-center text-muted py-4">
                      No saved movies yet
                    </ListGroup.Item>
                  ) : (
                    savedMovies.map((movie) => (
                      <ListGroup.Item key={movie._id} as={Link} to={`/details/${movie.tmdbId}`} className="p-0">
                        <div className="d-flex p-2">
                          <img
                            src={movie.posterPath ? `${IMAGE_BASE}${movie.posterPath}` : 'https://via.placeholder.com/60x90'}
                            alt={movie.title}
                            style={{ width: '60px', height: '90px', objectFit: 'cover' }}
                            className="rounded me-2"
                          />
                          <div className="flex-grow-1">
                            <strong className="d-block">{movie.title}</strong>
                            <div className="text-muted small">
                              <FaStar className="text-warning" /> {movie.voteAverage?.toFixed(1) || 'N/A'}
                            </div>
                            {movie.releaseDate && (
                              <div className="text-muted small">
                                {new Date(movie.releaseDate).getFullYear()}
                              </div>
                            )}
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))
                  )}
                </ListGroup>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editError && <Alert variant="danger">{editError}</Alert>}
          {editSuccess && <Alert variant="success">{editSuccess}</Alert>}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={profileUser?.username || ''}
                disabled
                readOnly
              />
              <Form.Text className="text-muted">
                Username cannot be changed
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={profileUser?.email || ''}
                disabled
                readOnly
              />
              <Form.Text className="text-muted">
                Contact support to change your email
              </Form.Text>
            </Form.Group>

            <hr className="my-4" />

            <Form.Group className="mb-3">
              <Form.Label>Profile Picture URL</Form.Label>
              <Form.Control
                type="url"
                name="profilePicture"
                value={editForm.profilePicture}
                onChange={handleEditFormChange}
                placeholder="https://example.com/your-profile-picture.jpg"
              />
              <Form.Text className="text-muted">
                Enter a URL to an image for your profile picture
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Cover Photo URL</Form.Label>
              <Form.Control
                type="url"
                name="coverPhoto"
                value={editForm.coverPhoto}
                onChange={handleEditFormChange}
                placeholder="https://example.com/your-cover-photo.jpg"
              />
              <Form.Text className="text-muted">
                Enter a URL to an image for your profile banner
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={editForm.firstName}
                onChange={handleEditFormChange}
                placeholder="Enter your first name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={editForm.lastName}
                onChange={handleEditFormChange}
                placeholder="Enter your last name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Bio</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="bio"
                value={editForm.bio}
                onChange={handleEditFormChange}
                placeholder="Tell us about yourself..."
                maxLength={500}
              />
              <Form.Text className="text-muted">
                {editForm.bio.length}/500 characters
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={editForm.location}
                onChange={handleEditFormChange}
                placeholder="City, Country"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Website</Form.Label>
              <Form.Control
                type="url"
                name="website"
                value={editForm.website}
                onChange={handleEditFormChange}
                placeholder="https://your-website.com"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={editForm.phone}
                onChange={handleEditFormChange}
                placeholder="+1 (555) 123-4567"
              />
              <Form.Text className="text-muted">
                Optional - Your phone number will remain private
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveProfile}
            disabled={!!editSuccess}
          >
            {editSuccess ? 'Saved!' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Likes Modal */}
      <Modal show={showLikesModal} onHide={() => setShowLikesModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Liked by</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPostLikes.length === 0 ? (
            <p className="text-center text-muted">No likes yet</p>
          ) : (
            <ListGroup variant="flush">
              {selectedPostLikes.map((user) => (
                <ListGroup.Item
                  key={user._id}
                  as={Link}
                  to={`/profile/${user._id}`}
                  onClick={() => setShowLikesModal(false)}
                  action
                >
                  <div className="d-flex align-items-center">
                    <img
                      src={user.profilePicture || 'https://via.placeholder.com/40'}
                      alt={user.username}
                      className="rounded-circle me-2"
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                    <strong>{user.username}</strong>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
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
          {reportingPost && (
            <Card className="bg-light">
              <Card.Body>
                <div className="d-flex align-items-start mb-2">
                  <img
                    src={reportingPost.author?.profilePicture || 'https://via.placeholder.com/40'}
                    alt={reportingPost.author?.username}
                    className="rounded-circle me-2"
                    style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                  />
                  <div>
                    <strong className="small">{reportingPost.author?.username}</strong>
                    <p className="mb-0 text-muted small mt-1">{reportingPost.content}</p>
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

export default Profile;
