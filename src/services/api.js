import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  completeOnboarding: (data) => api.post('/auth/onboarding', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
};

// User API
export const userAPI = {
  getAllUsers: (page = 1) => api.get(`/users?page=${page}`),
  getUserById: (id) => api.get(`/users/${id}`),
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => api.delete(`/users/${userId}/follow`),
  getFollowers: (userId) => api.get(`/users/${userId}/followers`),
  getFollowing: (userId) => api.get(`/users/${userId}/following`),
  searchUsers: (query) => api.get(`/users/search/${query}`),
  getUserPosts: (userId, page = 1) => api.get(`/users/${userId}/posts?page=${page}`),
};

// Post API
export const postAPI = {
  getAllPosts: (page = 1) => api.get(`/posts?page=${page}`),
  getFeed: (page = 1) => api.get(`/posts/feed?page=${page}`),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (data) => api.post('/posts', data),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
  toggleLike: (id) => api.post(`/posts/${id}/like`),
  reportPost: (id) => api.post(`/posts/${id}/report`),
  getReportedPosts: () => api.get('/posts/reported'),
};

// Comment API
export const commentAPI = {
  getComments: (postId) => api.get(`/comments/posts/${postId}/comments`),
  createComment: (postId, data) => api.post(`/comments/posts/${postId}/comments`, data),
  updateComment: (id, data) => api.put(`/comments/${id}`, data),
  deleteComment: (id) => api.delete(`/comments/${id}`),
  toggleLike: (id) => api.post(`/comments/${id}/like`),
  reportComment: (id) => api.post(`/comments/${id}/report`),
};

// Movie API
export const movieAPI = {
  searchMovies: (query, page = 1) => api.get(`/movies/search/${query}?page=${page}`),
  getMovieFromTMDB: (tmdbId) => api.get(`/movies/tmdb/${tmdbId}`),
  getPopularMovies: (page = 1) => api.get(`/movies/popular?page=${page}`),
  getTrendingMovies: () => api.get('/movies/trending'),
  discoverMovies: (language, genre, page = 1) => api.get(`/movies/discover?language=${language}&genre=${genre}&page=${page}`),
  saveMovie: (data) => api.post('/movies', data),
  getMovie: (id) => api.get(`/movies/${id}`),
  getAllMovies: (page = 1) => api.get(`/movies?page=${page}`),
  unsaveMovie: (id) => api.delete(`/movies/${id}/save`),
  addReview: (id, data) => api.post(`/movies/${id}/reviews`, data),
  getUserMovies: (userId) => api.get(`/users/${userId}/movies`),
};

// Notification API
export const notificationAPI = {
  getNotifications: (page = 1, limit = 20) => api.get(`/notifications?page=${page}&limit=${limit}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

export default api;
