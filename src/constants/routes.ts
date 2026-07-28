export const ROUTES = {
  HOME: '/',
  ORGANIZATIONS: '/organizations',
  VOLUNTEERS: '/volunteers',
  EMERGENCY: '/emergency',
  BLOOD_DONATION: '/blood-donation',
  EVENTS: '/events',
  ABOUT: '/about',
  DONATE: '/donate',
  AI_NGO_DETECTION: '/ai-ngo-detection',
  AI_REVIEW_DETECTION: '/ai-review-detection',
  AI_CONTENT_GENERATOR: '/ai-content-generator',
  AI_SMART_SEARCH: '/ai-smart-search',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
