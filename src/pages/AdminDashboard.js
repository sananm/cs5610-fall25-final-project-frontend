import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, Modal, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaUsers, FaShieldAlt, FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { toast } from 'react-toastify';

function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    regular: 0,
    moderators: 0,
    admins: 0
  });

  useEffect(() => {
    // Redirect if not authenticated or not an admin
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'admin') {
      navigate('/');
      toast.error('Access denied. Admin privileges required.');
      return;
    }

    fetchUsers();
  }, [isAuthenticated, user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsersAdmin();
      const allUsers = response.data.users || [];
      setUsers(allUsers);

      // Calculate stats
      const stats = {
        total: allUsers.length,
        regular: allUsers.filter(u => u.role === 'regular').length,
        moderators: allUsers.filter(u => u.role === 'moderator').length,
        admins: allUsers.filter(u => u.role === 'admin').length
      };
      setStats(stats);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleClick = (userToEdit) => {
    if (userToEdit._id === user._id) {
      toast.error('You cannot change your own role');
      return;
    }
    setSelectedUser(userToEdit);
    setNewRole(userToEdit.role);
    setShowRoleModal(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      await userAPI.updateUserRole(selectedUser._id, newRole);
      toast.success(`${selectedUser.username}'s role updated to ${newRole}`);

      // Update local state
      setUsers(users.map(u =>
        u._id === selectedUser._id ? { ...u, role: newRole } : u
      ));

      setShowRoleModal(false);
      setSelectedUser(null);
      fetchUsers(); // Refresh to update stats
    } catch (err) {
      console.error('Error updating role:', err);
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteClick = (userToDelete) => {
    if (userToDelete._id === user._id) {
      toast.error('You cannot delete your own account');
      return;
    }
    setSelectedUser(userToDelete);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await userAPI.deleteUser(selectedUser._id);
      toast.success(`User ${selectedUser.username} deleted successfully`);

      // Remove from local state
      setUsers(users.filter(u => u._id !== selectedUser._id));

      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers(); // Refresh to update stats
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge bg="danger">Admin</Badge>;
      case 'moderator':
        return <Badge bg="success">Moderator</Badge>;
      default:
        return <Badge bg="secondary">Regular</Badge>;
    }
  };

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
        <Card.Header>
          <div className="d-flex align-items-center">
            <FaShieldAlt className="text-danger me-2" />
            <h4 className="mb-0">Admin Dashboard</h4>
          </div>
        </Card.Header>
        <Card.Body>
          <Alert variant="warning">
            <strong>Admin Role:</strong> Manage user roles and accounts. Use these privileges responsibly.
          </Alert>
        </Card.Body>
      </Card>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaUsers size={30} className="text-primary mb-2" />
              <h3>{stats.total}</h3>
              <p className="text-muted mb-0">Total Users</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaUser size={30} className="text-secondary mb-2" />
              <h3>{stats.regular}</h3>
              <p className="text-muted mb-0">Regular Users</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaShieldAlt size={30} className="text-success mb-2" />
              <h3>{stats.moderators}</h3>
              <p className="text-muted mb-0">Moderators</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaShieldAlt size={30} className="text-danger mb-2" />
              <h3>{stats.admins}</h3>
              <p className="text-muted mb-0">Admins</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Users Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">User Management</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Followers</th>
                  <th>Following</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => (
                  <tr key={userItem._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={userItem.profilePicture || "/default-avatar.png"}
                          alt={userItem.username}
                          className="rounded-circle me-2"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                        <div>
                          <Link
                            to={`/profile/${userItem._id}`}
                            className="text-decoration-none fw-bold"
                          >
                            {userItem.username}
                          </Link>
                          {userItem._id === user._id && (
                            <Badge bg="info" className="ms-2 small">You</Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="align-middle">
                      <small className="text-muted">{userItem.email || 'N/A'}</small>
                    </td>
                    <td className="align-middle">
                      {getRoleBadge(userItem.role)}
                    </td>
                    <td className="align-middle">
                      <small className="text-muted">
                        {new Date(userItem.createdAt).toLocaleDateString()}
                      </small>
                    </td>
                    <td className="align-middle">
                      {userItem.followersCount || 0}
                    </td>
                    <td className="align-middle">
                      {userItem.followingCount || 0}
                    </td>
                    <td className="align-middle">
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleRoleClick(userItem)}
                          disabled={userItem._id === user._id}
                          title="Change role"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteClick(userItem)}
                          disabled={userItem._id === user._id}
                          title="Delete user"
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Change Role Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change User Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <p>
                Change role for <strong>{selectedUser.username}</strong>:
              </p>
              <Form.Group>
                <Form.Label>Select New Role</Form.Label>
                <Form.Select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="regular">Regular User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  {newRole === 'admin' && 'Admins can manage all users and access the admin dashboard.'}
                  {newRole === 'moderator' && 'Moderators can delete any posts and access the moderation dashboard.'}
                  {newRole === 'regular' && 'Regular users have standard privileges.'}
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateRole}>
            <FaCheck className="me-1" /> Update Role
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete User Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm User Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <strong>Warning:</strong> This action cannot be undone. All user data, posts, and content will be permanently deleted.
          </Alert>
          {selectedUser && (
            <p>
              Are you sure you want to delete user <strong>{selectedUser.username}</strong>?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            <FaTimes className="me-1" /> Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            <FaTrash className="me-1" /> Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default AdminDashboard;
