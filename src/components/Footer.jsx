import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function Footer() {
  const { darkMode } = useTheme();

  return (
    <footer className={`${darkMode ? 'bg-dark' : 'bg-light'} border-top mt-5 py-4`}>
      <Container>
        <div className="row">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <p className={`${darkMode ? 'text-light' : 'text-muted'} mb-0`}>
              &copy; 2025 ReelTalk - Northeastern University Web Development Project
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <Link
              to="/about"
              className={`${darkMode ? 'text-light' : 'text-muted'} text-decoration-none me-3`}
            >
              About & Credits
            </Link>
            <Link
              to="/privacy"
              className={`${darkMode ? 'text-light' : 'text-muted'} text-decoration-none me-3`}
            >
              Privacy Policy
            </Link>
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${darkMode ? 'text-light' : 'text-muted'} text-decoration-none`}
            >
              Powered by TMDB
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
