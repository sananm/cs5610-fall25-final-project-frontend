import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Navbar, Nav, Container, Form, Button, NavDropdown, Badge, Dropdown } from 'react-bootstrap';
import { FaHome, FaSearch, FaUser, FaSignOutAlt, FaFilm, FaMoon, FaSun, FaBell } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationAPI } from '../services/api';

function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('movies');
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const previousUnreadCount = useRef(0);
  const isInitialMount = useRef(true);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (searchType === 'users') {
        navigate(`/users/search?q=${searchQuery}`);
      } else {
        navigate(`/search/${searchQuery}`);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Update search query and type based on current URL
  useEffect(() => {
    if (location.pathname.startsWith('/users/search')) {
      const query = searchParams.get('q') || '';
      setSearchQuery(query);
      setSearchType('users');
    } else if (location.pathname.startsWith('/search/')) {
      const query = location.pathname.split('/search/')[1] || '';
      setSearchQuery(decodeURIComponent(query));
      setSearchType('movies');
    } else {
      setSearchQuery('');
    }
  }, [location, searchParams]);

  // Fetch notifications and unread count
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      fetchNotifications();

      // Poll for new notifications every 3 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 3000);

      return () => {
        clearInterval(interval);
      };
    } else {
      // Reset on logout
      isInitialMount.current = true;
      previousUnreadCount.current = 0;
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      const newCount = response.data.count;

      // Show toast if there are new notifications (but not on initial load)
      if (!isInitialMount.current && newCount > previousUnreadCount.current) {
        // Fetch latest notification to show in toast
        const notifResponse = await notificationAPI.getNotifications(1, 1);
        const latestNotif = notifResponse.data.notifications[0];

        if (latestNotif) {
          toast.info(
            latestNotif.message || 'New notification',
            {
              position: "bottom-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              icon: "🔔",
              style: {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold'
              },
              onClick: () => {
                if (latestNotif.link) navigate(latestNotif.link);
              }
            }
          );
        }

        fetchNotifications(); // Refresh notification list
      }

      // After first fetch, mark as not initial mount
      if (isInitialMount.current) {
        isInitialMount.current = false;
      }

      previousUnreadCount.current = newCount;
      setUnreadCount(newCount);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getNotifications(1, 5);
      setNotifications(response.data.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await notificationAPI.markAsRead(notification._id);
        fetchUnreadCount();
        fetchNotifications();
      }
      if (notification.link) {
        navigate(notification.link);
      }
      setShowNotifications(false);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      fetchUnreadCount();
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  return (
    <Navbar bg={darkMode ? "dark" : "light"} variant={darkMode ? "dark" : "light"} expand="lg" fixed="top" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <FaFilm className="me-2" />
          ReelTalk
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Form className="d-flex mx-auto align-items-center" style={{ width: '450px' }} onSubmit={handleSearch}>
            <Dropdown className="me-2">
              <Dropdown.Toggle
                variant={darkMode ? "outline-light" : "outline-dark"}
                size="sm"
                style={{ minWidth: '90px' }}
              >
                {searchType === 'movies' ? 'Movies' : 'Users'}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setSearchType('movies')}>
                  Movies
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setSearchType('users')}>
                  Users
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Form.Control
              type="search"
              placeholder={searchType === 'movies' ? 'Search movies...' : 'Search users...'}
              className="me-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outline-primary" type="submit">
              <FaSearch />
            </Button>
          </Form>
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/">
              <FaHome className="me-1" /> Home
            </Nav.Link>
            <Button
              variant={darkMode ? "outline-light" : "outline-dark"}
              size="sm"
              onClick={toggleDarkMode}
              className="me-2"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </Button>
            {isAuthenticated ? (
              <>
                <Dropdown show={showNotifications} onToggle={setShowNotifications} className="me-2">
                  <Dropdown.Toggle
                    as={Button}
                    variant={darkMode ? "outline-light" : "outline-dark"}
                    size="sm"
                    className="position-relative"
                  >
                    <FaBell />
                    {unreadCount > 0 && (
                      <Badge
                        bg="danger"
                        pill
                        className="position-absolute top-0 start-100 translate-middle"
                        style={{ fontSize: '0.6rem' }}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Dropdown.Toggle>

                  <Dropdown.Menu align="end" style={{ width: '350px' }}>
                    <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                      <h6 className="mb-0">Notifications</h6>
                      {unreadCount > 0 && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={handleMarkAllAsRead}
                          className="p-0 text-decoration-none"
                        >
                          Mark all as read
                        </Button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="text-center py-4 text-muted">
                        <FaBell size={30} className="mb-2" />
                        <p className="mb-0">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <Dropdown.Item
                          key={notification._id}
                          onClick={() => handleNotificationClick(notification)}
                          className={!notification.read ? 'bg-light' : ''}
                        >
                          <div className="d-flex align-items-start">
                            <img
                              src={notification.sender?.profilePicture || "/default-avatar.png"}
                              alt={notification.sender?.username}
                              className="rounded-circle me-2"
                              style={{ width: '40px', height: '40px' }}
                            />
                            <div className="flex-grow-1">
                              <p className="mb-1 small">{notification.message}</p>
                              <small className="text-muted">
                                {new Date(notification.createdAt).toLocaleString()}
                              </small>
                            </div>
                            {!notification.read && (
                              <Badge bg="primary" pill className="ms-2">
                                New
                              </Badge>
                            )}
                          </div>
                        </Dropdown.Item>
                      ))
                    )}
                  </Dropdown.Menu>
                </Dropdown>

                <NavDropdown
                  title={user?.username || 'User'}
                  id="basic-nav-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    <FaUser className="me-1" /> My Profile
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  {user?.role === 'admin' && (
                    <>
                      <NavDropdown.Item as={Link} to="/admin">
                        Admin Dashboard
                      </NavDropdown.Item>
                      <NavDropdown.Divider />
                    </>
                  )}
                  {(user?.role === 'moderator' || user?.role === 'admin') && (
                    <>
                      <NavDropdown.Item as={Link} to="/moderation">
                        Moderation
                      </NavDropdown.Item>
                      <NavDropdown.Divider />
                    </>
                  )}
                  <NavDropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-1" /> Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Button
                  as={Link}
                  to="/register"
                  variant="primary"
                  size="sm"
                  className="ms-2"
                >
                  Sign Up
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;
