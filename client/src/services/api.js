/**
 * JanSamadhan – Axios API Client (services/api.js)
 * Configured with credentials support for HTTP-only cookie authentication
 * and automatic Bearer token header fallback.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  withCredentials: true, // Send HTTP-only session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Attach localStorage JWT if present (dual-layer cookie + header auth)
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
    // Don't auto-clear on /api/auth/me failure during initial app load
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes('/auth/me') &&
      !error.config?.url?.includes('/auth/login')
    ) {
      localStorage.removeItem('js_token');
    }
    return Promise.reject(error);
  }
);

export default api;
