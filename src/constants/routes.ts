export const ROUTES = {
  HOME: '/',
  ORGANIZATIONS: '/organizations',
  VOLUNTEERS: '/volunteers',
  EMERGENCY: '/emergency',
  BLOOD_DONATION: '/blood-donation',
  EVENTS: '/events',
  ABOUT: '/about',
  DONATE: '/donate',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
