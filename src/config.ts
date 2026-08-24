// ─── Application Configuration ────────────────────────────────────────────────

export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.shebabd.org/api/v1'  // Production API
  : 'http://localhost:8001/api/v1';   // Development API

export const APP_NAME = 'ShebaBD';
export const APP_VERSION = '1.0.0';

// Feature flags
export const FEATURES = {
  BLOOD_DONATION: true,
  COMMUNITY: true,
  AI_CHAT: true,
  VOLUNTEER_MATCHING: true,
  EMERGENCY_REQUESTS: true,
} as const;

// API endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  BLOOD: {
    STATS: '/blood/stats',
    DONORS: '/blood/donors',
    REQUESTS: '/blood/requests',
    REGISTER_DONOR: '/blood/register-donor',
    CREATE_REQUEST: '/blood/request',
  },
  CHAT: {
    SEND: '/chat',
    HISTORY: '/chat/history',
  },
  COMMUNITY: {
    POSTS: '/community/posts',
    FORUMS: '/community/forums',
    STORIES: '/community/stories',
  },
} as const;