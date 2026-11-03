/**
 * JanSamadhan – Axios API Client (services/api.js)
 * Central Axios instance used by all service modules.
 * Base URL is read from the Vite env var VITE_API_URL (falls back to /api).
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Attach JWT token when available (Stage 2+)
    const token = localStorage.getItem('js_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired – Stage 2 will handle redirect to login
      localStorage.removeItem('js_token');
    }
    return Promise.reject(error);
  }
);

export default api;
