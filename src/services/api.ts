import axios from 'axios';

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

// ── Request interceptor: attach JWT from localStorage ─────────────────────────
api.interceptors.request.use(config => {
  const token = localStorage.getItem('shebabd_token');
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: clear token on 401 ─────────────────────────────────
api.interceptors.response.use(
  res => res,
  err => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('shebabd_token');
      localStorage.removeItem('shebabd_user');
    }
    return Promise.reject(err);
  },
);
