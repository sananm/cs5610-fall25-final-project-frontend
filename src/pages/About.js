import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { FaGithub, FaExternalLinkAlt, FaUsers, FaCode, FaDatabase } from 'react-icons/fa';

function About() {
  const teamMembers = [
    {
      name: 'Sanan Moinuddin',
      section: 'CS 5610 - Section 01',
      role: 'Full Stack Developer',
      // Add your GitHub profile if you want
      github: 'https://github.com/yourusername'
    },
    // Add more team members here if applicable
    // {
    //   name: 'Team Member 2',
    //   section: 'CS 5610 - Section 01',
    //   role: 'Frontend Developer',
    //   github: 'https://github.com/username2'
    // }
  ];

  const repositories = {
    frontend: 'https://github.com/yourusername/reeltalk-frontend',
    backend: 'https://github.com/yourusername/reeltalk-backend'
  };

  const technologies = {
    frontend: [
      'React.js',
      'React Bootstrap',
      'React Router',
      'Context API',
      'Axios',
      'React Icons',
      'React Toastify'
    ],
    backend: [
      'Node.js',
      'Express.js',
      'MongoDB',
      'Mongoose',
      'JWT Authentication',
      'Bcrypt',
      'TMDB API'
    ]
  };

  return (
    <Container className="main-content py-5">
      {/* Header */}
      <Row className="mb-5">
        <Col>
          <Card className="border-0 bg-primary text-white">
            <Card.Body className="text-center py-5">
              <h1 className="display-4 mb-3">ReelTalk</h1>
              <p className="lead mb-0">
                A Social Movie Network for Film Enthusiasts
              </p>
              <p className="mt-2">
                CS 5610 Web Development - Fall 2024
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Team Members */}
      <Row className="mb-5">
        <Col>
          <Card>
            <Card.Header className="bg-white">
              <h3 className="mb-0">
                <FaUsers className="me-2 text-primary" />
                Team Members
              </h3>
            </Card.Header>
            <Card.Body>
              <Row>
                {teamMembers.map((member, index) => (
                  <Col md={6} lg={4} key={index} className="mb-3">
                    <Card className="h-100 border shadow-sm">
                      <Card.Body>
                        <h5 className="mb-2">{member.name}</h5>
                        <p className="text-muted mb-2">
                          <small>{member.section}</small>
                        </p>
                        <p className="mb-3">
                          <Badge bg="secondary">{member.role}</Badge>
                        </p>
                        {member.github && (
                          <Button
                            variant="outline-dark"
                            size="sm"
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaGithub className="me-2" />
                            GitHub Profile
                          </Button>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* GitHub Repositories */}
      <Row className="mb-5">
        <Col>
          <Card>
            <Card.Header className="bg-white">
              <h3 className="mb-0">
                <FaGithub className="me-2 text-primary" />
                Source Code Repositories
              </h3>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-3 mb-md-0">
                  <Card className="h-100 border-primary">
                    <Card.Body className="text-center">
                      <FaCode size={40} className="text-primary mb-3" />
                      <h5>Frontend Repository</h5>
                      <p className="text-muted">
                        React.js Application
                      </p>
                      <Button
                        variant="primary"
                        href={repositories.frontend}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-100"
                      >
                        <FaGithub className="me-2" />
                        View Frontend Code
                        <FaExternalLinkAlt className="ms-2" size={14} />
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="h-100 border-success">
                    <Card.Body className="text-center">
                      <FaDatabase size={40} className="text-success mb-3" />
                      <h5>Backend Repository</h5>
                      <p className="text-muted">
                        Node.js + Express + MongoDB
                      </p>
                      <Button
                        variant="success"
                        href={repositories.backend}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-100"
                      >
                        <FaGithub className="me-2" />
                        View Backend Code
                        <FaExternalLinkAlt className="ms-2" size={14} />
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Technologies Used */}
      <Row className="mb-5">
        <Col>
          <Card>
            <Card.Header className="bg-white">
              <h3 className="mb-0">Technologies Used</h3>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-4 mb-md-0">
                  <h5 className="text-primary mb-3">Frontend</h5>
                  <ul className="list-unstyled">
                    {technologies.frontend.map((tech, index) => (
                      <li key={index} className="mb-2">
                        <Badge bg="primary" className="me-2">✓</Badge>
                        {tech}
                      </li>
                    ))}
                  </ul>
                </Col>
                <Col md={6}>
                  <h5 className="text-success mb-3">Backend</h5>
                  <ul className="list-unstyled">
                    {technologies.backend.map((tech, index) => (
                      <li key={index} className="mb-2">
                        <Badge bg="success" className="me-2">✓</Badge>
                        {tech}
                      </li>
                    ))}
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Project Description */}
      <Row className="mb-5">
        <Col>
          <Card>
            <Card.Header className="bg-white">
              <h3 className="mb-0">About ReelTalk</h3>
            </Card.Header>
            <Card.Body>
              <p className="lead">
                ReelTalk is a comprehensive social movie network that combines the power of
                The Movie Database (TMDB) API with a rich social networking platform.
              </p>

              <h5 className="mt-4 mb-3">Key Features</h5>
              <Row>
                <Col md={6}>
                  <ul>
                    <li>Search and discover movies from TMDB</li>
                    <li>Save movies to personal collections</li>
                    <li>Write reviews and rate movies</li>
                    <li>Create posts about movies</li>
                    <li>Follow other movie enthusiasts</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <ul>
                    <li>Like and comment on posts</li>
                    <li>Real-time notifications</li>
                    <li>Role-based access control (User, Moderator, Admin)</li>
                    <li>Content moderation features</li>
                    <li>Dark mode support</li>
                  </ul>
                </Col>
              </Row>

              <h5 className="mt-4 mb-3">Requirements Satisfied</h5>
              <Row>
                <Col md={6}>
                  <ul>
                    <li><strong>Database:</strong> MongoDB with Mongoose ODM</li>
                    <li><strong>Authentication:</strong> JWT-based auth system</li>
                    <li><strong>External API:</strong> TMDB API integration</li>
                    <li><strong>User Roles:</strong> 3 distinct user models (Regular, Moderator, Admin)</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <ul>
                    <li><strong>RESTful API:</strong> Express.js backend with full CRUD</li>
                    <li><strong>Data Models:</strong> 4 domain models + 3 user models</li>
                    <li><strong>Relationships:</strong> One-to-many and many-to-many</li>
                    <li><strong>Frontend:</strong> React with responsive design</li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Deployment Info */}
      <Row>
        <Col>
          <Card className="border-info">
            <Card.Body className="text-center">
              <h5 className="mb-3">Deployment</h5>
              <p className="text-muted mb-3">
                Frontend deployed on Vercel/Netlify | Backend deployed on Render/Railway
              </p>
              <p className="mb-0">
                <small className="text-muted">
                  Final Project for CS 5610 Web Development - Northeastern University
                </small>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default About;
