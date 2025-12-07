import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUserPlus, FaUserMinus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

function UserSearch({ initialQuery = '' }) {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followingStatus, setFollowingStatus] = useState({});
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-search when initialQuery is provided
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSearch({ preventDefault: () => {} });
    }
  }, [initialQuery]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setHasSearched(true);
      const response = await userAPI.searchUsers(searchQuery);
      setUsers(response.data || []);

      // Initialize following status by checking if user is in current user's following list
      if (isAuthenticated && currentUser) {
        const status = {};
        try {
          // Fetch current user's following list using the dedicated endpoint
          const followingResponse = await userAPI.getFollowing(currentUser._id);
          const following = followingResponse.data || [];

          // Check each search result user against the following list
          response.data.forEach(user => {
            // The following list contains user objects with _id
            const isFollowing = following.some(f => f._id === user._id);
            status[user._id] = isFollowing;
          });

          setFollowingStatus(status);
        } catch (err) {
          console.error('Error fetching user following status:', err);
          // Fallback: initialize all as not following
          response.data.forEach(user => {
            status[user._id] = false;
          });
          setFollowingStatus(status);
        }
      }
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (userId) => {
    if (!isAuthenticated) {
      alert('Please login to follow users');
      return;
    }

    try {
      const isFollowing = followingStatus[userId];
      if (isFollowing) {
        await userAPI.unfollowUser(userId);
      } else {
        await userAPI.followUser(userId);
      }

      // Update following status
      setFollowingStatus({
        ...followingStatus,
        [userId]: !isFollowing
      });

      // Update the follower count in the users list
      setUsers(users.map(user => {
        if (user._id === userId) {
          return {
            ...user,
            followersCount: isFollowing
              ? (user.followersCount || 1) - 1
              : (user.followersCount || 0) + 1
          };
        }
        return user;
      }));
    } catch (err) {
      console.error('Error toggling follow:', err);
      // Revert the state on error
      setFollowingStatus({
        ...followingStatus,
        [userId]: followingStatus[userId]
      });
    }
  };

  return (
    <div>
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : hasSearched ? (
        users.length > 0 ? (
          <Card>
            <Card.Header>
              <strong>Search Results ({users.length})</strong>
            </Card.Header>
            <ListGroup variant="flush">
              {users.map((user) => (
              <ListGroup.Item key={user._id}>
                <div className="d-flex align-items-center justify-content-between">
                  <Link
                    to={`/profile/${user._id}`}
                    className="text-decoration-none d-flex align-items-center flex-grow-1"
                  >
                    <img
                      src={user.profilePicture || 'https://via.placeholder.com/50'}
                      alt={user.username}
                      className="rounded-circle me-3"
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2">
                        <strong>{user.username}</strong>
                        {user.role === 'admin' && (
                          <Badge bg="danger" className="small">Admin</Badge>
                        )}
                        {user.role === 'moderator' && (
                          <Badge bg="success" className="small">Moderator</Badge>
                        )}
                        {user.isVerified && (
                          <Badge bg="primary" className="small">✓ Verified</Badge>
                        )}
                      </div>
                      {user.firstName && user.lastName && (
                        <div className="text-muted small">
                          {user.firstName} {user.lastName}
                        </div>
                      )}
                      {user.bio && (
                        <div className="text-muted small mt-1">
                          {user.bio.substring(0, 100)}
                          {user.bio.length > 100 && '...'}
                        </div>
                      )}
                      <div className="text-muted small mt-1">
                        {user.followersCount || 0} followers · {user.followingCount || 0} following
                      </div>
                    </div>
                  </Link>

                  {isAuthenticated && currentUser && user._id !== currentUser._id && (
                    <Button
                      variant={followingStatus[user._id] ? 'outline-secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleFollowToggle(user._id)}
                    >
                      {followingStatus[user._id] ? (
                        <>
                          <FaUserMinus className="me-1" /> Unfollow
                        </>
                      ) : (
                        <>
                          <FaUserPlus className="me-1" /> Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        ) : (
          <Card>
            <Card.Body className="text-center py-5">
              <p className="text-muted">No users found for "{searchQuery}"</p>
              <small className="text-muted">Try searching with a different username or name</small>
            </Card.Body>
          </Card>
        )
      ) : null}
    </div>
  );
}

export default UserSearch;
