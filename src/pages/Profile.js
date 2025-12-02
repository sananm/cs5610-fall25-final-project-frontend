import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Tab, Tabs, ListGroup } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, postAPI } from '../services/api';
import { FaUserPlus, FaUserMinus } from 'react-icons/fa';

function Profile() {
  const { userId } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = !userId || (currentUser && userId === currentUser._id);

  useEffect(() => {
    fetchProfile();
  }, [userId, currentUser]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const targetUserId = userId || currentUser?._id;

      if (!targetUserId) {
        setLoading(false);
        return;
      }

      const [userRes, postsRes, followersRes, followingRes] = await Promise.all([
        userAPI.getUserById(targetUserId),
        userAPI.getUserPosts(targetUserId),
        userAPI.getFollowers(targetUserId),
        userAPI.getFollowing(targetUserId)
      ]);

      setProfileUser(userRes.data);
      setPosts(postsRes.data.posts || []);
      setFollowers(followersRes.data || []);
      setFollowing(followingRes.data || []);

      if (currentUser && userRes.data.followers) {
        setIsFollowing(userRes.data.followers.some(f => f._id === currentUser._id));
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
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
        <div className="profile-cover"></div>
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
              {!isOwnProfile && isAuthenticated && (
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
            {profileUser.bio && <p className="mt-3">{profileUser.bio}</p>}
            <div className="d-flex gap-4 mt-3">
              <div>
                <strong>{posts.length}</strong> Posts
              </div>
              <div>
                <strong>{followers.length}</strong> Followers
              </div>
              <div>
                <strong>{following.length}</strong> Following
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
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
}

export default Profile;
