import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Tab, Tabs, ListGroup, Modal, Form, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, postAPI, movieAPI, authAPI } from '../services/api';
import { FaUserPlus, FaUserMinus, FaEdit, FaStar } from 'react-icons/fa';

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
    profilePicture: '',
    coverPhoto: ''
  });
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

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
                {profileUser.role && (
                  <span className={`badge ${
                    profileUser.role === 'admin' ? 'bg-danger' :
                    profileUser.role === 'moderator' ? 'bg-success' :
                    'bg-secondary'
                  }`}>
                    {profileUser.role}
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
                      <p>{post.content}</p>
                      <div className="text-muted small">
                        {new Date(post.createdAt).toLocaleString()}
                      </div>
                      <Link to={`/posts/${post._id}`} className="btn btn-sm btn-outline-primary mt-2">
                        View Post
                      </Link>
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
    </Container>
  );
}

export default Profile;
