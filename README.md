# ReelTalk - Social Movie Network

A full-stack social movie network that combines The Movie Database (TMDB) API with a social networking platform for film enthusiasts.

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-14.x-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.x-brightgreen.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)

## Project Overview

ReelTalk is a MERN stack application that allows users to discover movies, share reviews, create posts, and connect with other movie enthusiasts.

### Academic Context
- **Course**: CS 5610 Web Development
- **Institution**: Northeastern University
- **Semester**: Fall 2025
- **Section**: 05

## Key Features

### Movie Discovery
- Search movies from TMDB's database
- Browse trending and popular movies
- Discover movies by genre and language
- View movie details (cast, crew, ratings, reviews)
- Save movies to personal collections

### Social Networking
- Customizable user profiles with cover photos and bios
- Follow system to connect with other users
- User search by username or name

### Content Creation
- Create posts about movies
- Threaded comment system with nested replies
- Like posts and write reviews
- Report inappropriate content

### Notifications
- Notifications for new followers, likes, and comments
- Notification center with read/unread status
- Auto-expire after 30 days

### User Roles
- **Regular Users**: Full access to social features
- **Moderators**: Delete inappropriate content, access moderation dashboard
- **Administrators**: Manage user roles, delete users, access admin dashboard

## Technology Stack

### Frontend
- React 18, React Router 6, Context API
- React Bootstrap, Bootstrap 5
- Axios, React Toastify

### Backend
- Node.js, Express.js
- MongoDB, Mongoose
- JWT Authentication, Bcrypt.js
- TMDB API Integration

## Getting Started

### Prerequisites
- Node.js (v14.0.0+)
- MongoDB (v5.0+)
- npm (v6.0.0+)
- [TMDB API Key](https://www.themoviedb.org/settings/api)

### Installation

#### 1. Clone Repositories

```bash
# Frontend
git clone https://github.com/sananm/cs5610-fall25-final-project-frontend.git
cd cs5610-fall25-final-project-frontend
npm install

# Backend (in a separate terminal)
git clone https://github.com/sananm/cs5610-fall25-final-project-backend.git
cd cs5610-fall25-final-project-backend
npm install
```

#### 2. Environment Variables

**Frontend** (`.env` in frontend root):
```env
REACT_APP_API_URL=http://localhost:4000/api
```

**Backend** (`.env` in backend root):
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/reeltalk
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
TMDB_API_KEY=your_tmdb_api_key_here
NODE_ENV=development
```

#### 3. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Runs on http://localhost:4000

# Terminal 2 - Frontend
cd frontend
npm start
# Runs on http://localhost:3000
```

## Database Schema

- **Users**: Profiles with discriminators for roles (regular, moderator, admin), followers/following relationships, saved movies
- **Posts**: User-generated content about movies with likes and comments
- **Comments**: Threaded comment system with parent-child relationships for replies
- **Movies**: TMDB data cached locally with user reviews
- **Notifications**: Activity alerts with TTL index (auto-expire after 30 days)

## API Endpoints

### Authentication
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login
GET    /api/auth/me                # Get current user
PUT    /api/auth/profile           # Update profile
```

### Users
```
GET    /api/users                  # Get all users (paginated)
GET    /api/users/:id              # Get user by ID
GET    /api/users/search/:query    # Search users
POST   /api/users/:id/follow       # Follow user
DELETE /api/users/:id/follow       # Unfollow user
GET    /api/users/:id/followers    # Get followers
GET    /api/users/:id/following    # Get following
```

### Movies
```
GET    /api/movies/search/:query   # Search TMDB
GET    /api/movies/tmdb/:id        # Get TMDB movie details
GET    /api/movies/popular         # Get popular movies
GET    /api/movies/trending        # Get trending movies
POST   /api/movies                 # Save movie
POST   /api/movies/:id/reviews     # Add review
```

### Posts
```
GET    /api/posts                  # Get all posts (feed)
POST   /api/posts                  # Create post
GET    /api/posts/:id              # Get post by ID
PUT    /api/posts/:id              # Update post
DELETE /api/posts/:id              # Delete post
POST   /api/posts/:id/like         # Toggle like on post
POST   /api/posts/:id/report       # Report post
```

### Comments
```
GET    /api/comments/posts/:postId/comments  # Get post comments
POST   /api/comments/posts/:postId/comments  # Create comment
PUT    /api/comments/:id                     # Update comment
DELETE /api/comments/:id                     # Delete comment
POST   /api/comments/:id/report              # Report comment
```

### Notifications
```
GET    /api/notifications              # Get user notifications
GET    /api/notifications/unread-count # Get unread count
PUT    /api/notifications/:id/read     # Mark as read
PUT    /api/notifications/mark-all-read # Mark all as read
```

## Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set `REACT_APP_API_URL` environment variable
4. Deploy

### Backend (Render/Railway)
1. Push code to GitHub
2. Connect repository to platform
3. Set environment variables (`MONGODB_URI`, `JWT_SECRET`, `TMDB_API_KEY`, `NODE_ENV=production`)
4. Deploy

## License

This project is created for educational purposes as part of CS 5610 Web Development course at Northeastern University.
