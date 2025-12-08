# ReelTalk - Social Movie Network

A comprehensive full-stack social movie network that combines the power of The Movie Database (TMDB) API with a rich social networking platform for film enthusiasts.

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-14.x-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.x-brightgreen.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)

## 🎬 Project Overview

ReelTalk is a modern MERN stack application that allows users to discover movies, share reviews, create posts, and connect with other movie enthusiasts. The platform integrates seamlessly with TMDB's extensive movie database while providing a robust social networking experience.

### 🎓 Academic Context
- **Course**: CS 5610 Web Development
- **Institution**: Northeastern University
- **Semester**: Fall 2025
- **Section**: 05

## ✨ Key Features

### 🎥 Movie Discovery & Management
- Search movies from TMDB's extensive database
- Browse trending and popular movies
- Discover movies by genre and language
- View comprehensive movie details (cast, crew, ratings, reviews)
- Save movies to personal collections

### 👥 Social Networking
- Customizable user profiles with cover photos and bios
- Follow system to connect with other movie enthusiasts
- User search by username or name
- View follower/following lists

### 💬 Content Creation & Interaction
- Create posts about movies
- Threaded comment system with nested replies
- Like posts
- Edit and delete your own content
- Report inappropriate content (moderation)
- Share thoughts and opinions with the community

### ⭐ Reviews & Ratings
- Write detailed movie reviews (up to 1000 characters)
- Rate movies on a 1-10 scale
- View community reviews and ratings

### 🔔 Real-time Notifications
- Instant notifications for:
  - New followers
  - Likes on posts
  - Comments and replies
- Notification center with read/unread status
- Toast popup notifications with custom styling
- Mark all as read functionality
- Auto-expire after 30 days

### 👮 User Roles & Moderation
- **Regular Users**: Full access to social features
- **Moderators**:
  - Delete inappropriate posts and comments
  - View reported content
  - Access moderation dashboard
- **Administrators**:
  - All moderator capabilities
  - Manage user roles (promote/demote users)
  - Delete users
  - Access admin dashboard

### 🎨 User Experience
- Full dark/light theme support with smooth transitions
- Responsive design (desktop, tablet, mobile)
- Modern glass-morphism UI with purple gradient theme
- Smooth animations and transitions
- Optimistic UI updates for instant feedback
- First-time user onboarding flow

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (React)                │
│  - React Router                         │
│  - Context API (Auth, Theme)            │
│  - React Bootstrap                      │
│  - Axios HTTP Client                    │
│  Port: 3000                             │
└─────────────────────────────────────────┘
              ↓ REST API
┌─────────────────────────────────────────┐
│      Backend (Node.js/Express)          │
│  - RESTful API                          │
│  - JWT Authentication                   │
│  - Role-based Authorization             │
│  - TMDB API Integration                 │
│  Port: 4000                             │
└─────────────────────────────────────────┘
              ↓ Mongoose ODM
┌─────────────────────────────────────────┐
│         Database (MongoDB)              │
│  - Users (with discriminators)          │
│  - Posts                                │
│  - Movies                               │
│  - Comments                             │
│  - Notifications                        │
└─────────────────────────────────────────┘
              ↓ External API
┌─────────────────────────────────────────┐
│          TMDB API                       │
│  - Movie Search & Details               │
│  - Trending/Popular Movies              │
│  - Credits & Cast Information           │
└─────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **React** (v18) - UI library
- **React Router** (v6) - Client-side routing
- **Context API** - State management
- **React Bootstrap** - UI components
- **Bootstrap** (v5) - CSS framework
- **Axios** - HTTP client
- **React Toastify** - Toast notifications
- **React Icons** - Icon library

### Backend
- **Node.js** (v14+) - Runtime environment
- **Express.js** (v4) - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** (v6) - ODM
- **JWT** - Authentication
- **Bcrypt.js** - Password hashing
- **TMDB API** - Movie data

### Development Tools
- **Create React App** - Frontend build tool
- **Nodemon** - Backend dev server
- **ESLint** - Code linting
- **Git** - Version control

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14.0.0 or higher)
- **MongoDB** (v5.0 or higher) - Local or Atlas
- **npm** (v6.0.0 or higher)
- **TMDB API Key** - [Get it here](https://www.themoviedb.org/settings/api)

### 📦 Installation

#### 1. Clone Both Repositories

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

#### 3. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB
brew install mongodb-community@5.0  # macOS
# or follow official docs for Windows/Linux

# Start MongoDB
brew services start mongodb-community@5.0
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in backend `.env`

#### 4. Get TMDB API Key
1. Create account at [themoviedb.org](https://www.themoviedb.org/)
2. Go to Settings → API
3. Request API key (free)
4. Add to backend `.env`

#### 5. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Backend runs on http://localhost:4000

# Terminal 2 - Frontend
cd frontend
npm start
# Frontend runs on http://localhost:3000
```

## 📁 Project Structure

### Frontend Structure
```
frontend/
├── public/
├── src/
│   ├── components/         # Reusable components
│   │   ├── Navigation.jsx
│   │   ├── Footer.jsx
│   │   ├── UserSearch.jsx
│   │   └── OnboardingModal.jsx
│   ├── pages/             # Route components
│   │   ├── Home.jsx
│   │   ├── Profile.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── MovieDetails.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── Moderation.jsx
│   ├── context/           # React Context
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── services/          # API calls
│   │   └── api.js
│   ├── styles/
│   │   └── App.css
│   ├── App.jsx
│   └── index.jsx
├── package.json
└── .env
```

### Backend Structure
```
backend/
├── controllers/           # Route handlers
│   ├── authController.js
│   ├── userController.js
│   ├── postController.js
│   ├── movieController.js
│   ├── commentController.js
│   └── notificationController.js
├── models/               # Mongoose models
│   ├── User.js          # Discriminator base
│   ├── Post.js
│   ├── Movie.js
│   ├── Comment.js
│   └── Notification.js
├── middleware/          # Express middleware
│   └── auth.js          # Authentication & role checks
├── routes/             # API routes
│   ├── auth.js
│   ├── users.js
│   ├── posts.js
│   ├── movies.js
│   ├── comments.js
│   └── notifications.js
├── server.js           # Entry point
├── package.json
└── .env
```

## 📊 Database Schema

### Collections

**Users** (with discriminators: `regular`, `moderator`, `admin`)
- User profiles with social connections
- Role-based attributes via Mongoose discriminators
- Followers/following relationships
- Saved movies and liked posts

**Posts**
- User-generated content about movies
- Like and comment tracking

**Comments**
- Threaded comment system
- Parent-child relationships for replies
- Edit and moderation flags

**Movies**
- TMDB data cached locally
- User-generated reviews (embedded)
- Saved by tracking
- Related posts

**Notifications**
- Real-time activity alerts
- Auto-expire after 30 days (TTL index)
- Read/unread status

## 🔌 API Endpoints

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

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: Bcrypt with salt rounds
- **Protected Routes**: Middleware-based route protection
- **Role-based Access**: Discriminator-based permissions
- **Input Validation**: Mongoose schema validation
- **CORS**: Configured for cross-origin requests
- **Environment Variables**: Sensitive data protection

## 🚢 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to platform
3. Set environment variables
4. Deploy automatically on push

Set environment variables in Vercel dashboard:
- `REACT_APP_API_URL` → Your backend URL

### Backend (Render/Railway)
1. Push code to GitHub
2. Connect repository to platform
3. Set environment variables
4. Deploy automatically on push

### Environment Variables for Production
- Update `MONGODB_URI` to production database
- Use strong `JWT_SECRET`
- Set `NODE_ENV=production`

## 📱 Responsive Design

- **Mobile**: < 768px (collapsible nav, touch optimized)
- **Tablet**: 768px - 1199px (optimized layouts)
- **Desktop**: 1200px+ (full features, multi-column)

## 🎨 Theme System

**Light Mode**
- Clean white backgrounds
- Purple accent colors
- High contrast text

**Dark Mode**
- Slate gray backgrounds (#0f172a)
- Purple/pink gradients
- Reduced eye strain

Theme persisted in `localStorage` via `ThemeContext`.


## 📚 Documentation

- **Frontend Docs**: See `frontend/src/` for component documentation
- **Backend Docs**: See `backend/controllers/` for API logic
- **Database Schema**: Refer to `backend/models/`
- **GitHub Wiki**: [Project Wiki](https://github.com/sananm/cs5610-fall25-final-project-frontend/wiki)


## 👨‍💻 Author

**Mohammed Sanan Moinuddin**
- **GitHub**: [@sananm](https://github.com/sananm)
- **Course**: CS 5610 Web Development - Section 05
- **University**: Northeastern University
- **Semester**: Fall 2025

**Nishit Agarwal**
- **GitHub**: [@N91489](https://github.com/N91489)
- **Course**: CS 5610 Web Development - Section 05
- **University**: Northeastern University
- **Semester**: Fall 2025

**Pranav Gupta**
- **GitHub**: [@Pranavgupta26](https://github.com/PranavGupta26)
- **Course**: CS 5610 Web Development - Section 05
- **University**: Northeastern University
- **Semester**: Fall 2025

## 📦 Repositories

- **Frontend**: [cs5610-fall25-final-project-frontend](https://github.com/sananm/cs5610-fall25-final-project-frontend)
- **Backend**: [cs5610-fall25-final-project-backend](https://github.com/sananm/cs5610-fall25-final-project-backend)

## 📄 License

This project is created for educational purposes as part of CS 5610 Web Development course at Northeastern University. All rights reserved.

## 🙏 Acknowledgments

- **TMDB** - Movie database and API
- **Northeastern University** - CS 5610 Web Development
- **React Team** - Amazing UI library
- **MongoDB** - Flexible NoSQL database
- **Express.js** - Fast, unopinionated web framework

## 📖 Resources

- [React Documentation](https://reactjs.org/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [TMDB API Docs](https://developers.themoviedb.org/3)
- [Mongoose Docs](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)

---

