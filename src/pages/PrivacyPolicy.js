import React from 'react';
import { Container, Card } from 'react-bootstrap';

function PrivacyPolicy() {
  return (
    <Container className="main-content py-4">
      <Card>
        <Card.Body className="p-5">
          <h1 className="mb-4">Privacy Policy</h1>
          <p className="text-muted">
            <small>Last Updated: December 5, 2025</small>
          </p>

          <section className="mb-4">
            <h2 className="h4 mb-3">1. Introduction</h2>
            <p>
              Welcome to ReelTalk ("we", "our", or "us"). We are committed to protecting your
              privacy and ensuring the security of your personal information. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you use
              our social network and movie discovery platform.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="h4 mb-3">2. Information We Collect</h2>
            <h3 className="h5 mb-2">2.1 Personal Information</h3>
            <p>We collect information that you provide directly to us, including:</p>
            <ul>
              <li>Account information (username, email address, password)</li>
              <li>Profile information (first name, last name, bio, profile picture, cover photo)</li>
              <li>Optional information (location, website, date of birth)</li>
              <li>Movie preferences (favorite movies, preferred genres, languages)</li>
            </ul>

            <h3 className="h5 mb-2 mt-3">2.2 Content and Activity</h3>
            <ul>
              <li>Posts, comments, and reviews you create</li>
              <li>Movies you save or rate</li>
              <li>Users you follow and who follow you</li>
              <li>Posts and comments you like</li>
            </ul>

            <h3 className="h5 mb-2 mt-3">2.3 Automatically Collected Information</h3>
            <ul>
              <li>Login activity and timestamps</li>
              <li>Device and browser information</li>
              <li>Usage patterns and interactions with the platform</li>
            </ul>
          </section>

          <section className="mb-4">
            <h2 className="h4 mb-3">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Create and manage your account</li>
              <li>Personalize your experience and content recommendations</li>
              <li>Enable social features (following, commenting, liking)</li>
              <li>Send notifications about activity on your account</li>
              <li>Respond to your requests and provide customer support</li>
              <li>Ensure security and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-4">
            <h2 className="h4 mb-3">4. Information Sharing and Disclosure</h2>
            <h3 className="h5 mb-2">4.1 Public Information</h3>
            <p>
              The following information is publicly visible to all users (including those not
              logged in):
            </p>
            <ul>
              <li>Username, profile picture, and bio</li>
              <li>Public posts and comments</li>
              <li>Follower and following counts</li>
              <li>Movie reviews and ratings</li>
            </ul>

            <h3 className="h5 mb-2 mt-3">4.2 Private Information</h3>
            <p>The following information is kept private and only visible to you:</p>
            <ul>
              <li>Email address</li>
              <li>Date of birth</li>
              <li>Password (encrypted and never visible)</li>
              <li>Saved movies (unless you choose to share)</li>
            </ul>

            <h3 className="h5 mb-2 mt-3">4.3 Third-Party Services</h3>
            <p>
              We use The Movie Database (TMDB) API to provide movie information. When you search
              for movies, your search queries are sent to TMDB. We recommend reviewing{' '}
              <a
                href="https://www.themoviedb.org/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                TMDB's Privacy Policy
              </a>
              .
            </p>
          </section>

          <section className="mb-4">
            <h2 className="h4 mb-3">5. Data Security</h2>
            <p>We implement security measures to protect your information, including:</p>
            <ul>
              <li>Password encryption using industry-standard bcrypt hashing</li>
              <li>Secure HTTPS connections</li>
              <li>JWT token-based authentication</li>
              <li>Regular security updates and monitoring</li>
            </ul>
            <p>
              However, no method of transmission over the Internet is 100% secure. While we strive
              to protect your personal information, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="h4 mb-3">6. Your Rights and Choices</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access and update your personal information in your profile settings</li>
              <li>Delete your posts, comments, and reviews</li>
              <li>Control who can see your content through visibility settings</li>
              <li>Unfollow users or remove followers</li>
              <li>Request account deletion by contacting us</li>
            </ul>
          </section>

          <section className="mb-4">
            <h2 className="h4 mb-3">7. Cookies and Tracking</h2>
            <p>
              We use browser localStorage to store your authentication token and maintain your
              login session. This helps us keep you logged in between visits and provide a better
              user experience.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="h4 mb-3">8. Children's Privacy</h2>
            <p>
              ReelTalk is not intended for users under the age of 13. We do not knowingly collect
              personal information from children under 13. If you believe we have collected
              information from a child under 13, please contact us.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="h4 mb-3">9. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new Privacy Policy on this page and updating the "Last
              Updated" date.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="h4 mb-3">10. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at:</p>
            <ul className="list-unstyled">
              <li>
                <strong>Email:</strong> privacy@reeltalk.com
              </li>
              <li>
                <strong>Project:</strong> ReelTalk - Northeastern University Web Development Course
              </li>
            </ul>
          </section>

          <section className="mb-4">
            <h2 className="h4 mb-3">11. Role-Based Access</h2>
            <p>
              ReelTalk has different user roles with varying levels of access:
            </p>
            <ul>
              <li>
                <strong>Regular Users:</strong> Can create posts, follow users, like content, and
                interact with the community
              </li>
              <li>
                <strong>Moderators:</strong> Have additional access to view and manage reported
                content to maintain community standards
              </li>
              <li>
                <strong>Admins:</strong> Have full system access for platform management and user
                administration
              </li>
            </ul>
            <p>
              All roles are subject to this Privacy Policy, and sensitive user information remains
              protected regardless of role.
            </p>
          </section>

          <hr className="my-4" />

          <p className="text-muted small">
            This is a student project created for educational purposes as part of a Web Development
            course at Northeastern University. This privacy policy demonstrates understanding of
            privacy requirements for web applications.
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default PrivacyPolicy;
