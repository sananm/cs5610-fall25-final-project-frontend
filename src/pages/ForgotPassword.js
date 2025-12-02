import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { authAPI } from '../services/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      await authAPI.forgotPassword({ email });
      setSuccess(true);
      setEmail('');
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="main-content py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <FaEnvelope size={50} className="text-primary mb-3" />
                <h2>Forgot Password?</h2>
                <p className="text-muted">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success">
                  <Alert.Heading>Check Your Email</Alert.Heading>
                  <p>
                    If an account with that email exists, we've sent you a password reset link.
                    Please check your email and follow the instructions.
                  </p>
                  <hr />
                  <p className="mb-0 small">
                    Didn't receive the email? Check your spam folder or try again in a few minutes.
                  </p>
                </Alert>
              )}

              {!success && (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      autoFocus
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>

                  <div className="text-center">
                    <Link to="/login" className="text-decoration-none">
                      <FaArrowLeft className="me-1" />
                      Back to Login
                    </Link>
                  </div>
                </Form>
              )}

              {success && (
                <div className="text-center">
                  <Link to="/login" className="btn btn-outline-primary">
                    <FaArrowLeft className="me-1" />
                    Back to Login
                  </Link>
                </div>
              )}
            </Card.Body>
          </Card>

          <div className="text-center mt-3">
            <p className="text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-decoration-none">
                Sign up
              </Link>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default ForgotPassword;
