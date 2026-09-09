import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("lovelink_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid and we are not on public route
      if (!window.location.pathname.startsWith("/p/")) {
        localStorage.removeItem("lovelink_token");
        localStorage.removeItem("lovelink_user");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
