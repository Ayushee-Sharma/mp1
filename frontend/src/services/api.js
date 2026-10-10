import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      (!error.response
        ? 'Unable to reach the server. Check your connection and try again.'
        : error.message || 'An unexpected request error occurred');
    const formattedError = new Error(message);
    formattedError.status = error.response?.status;
    formattedError.isNetworkError = !error.response;
    return Promise.reject(formattedError);
  }
);

export default api;
