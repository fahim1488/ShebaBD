import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ROUTES } from '@/constants/routes';
import MainLayout from '@/layouts/MainLayout';

// Lazy-loaded pages
const Home = lazy(() => import('@/pages/Home'));
const Organizations = lazy(() => import('@/pages/Organizations'));
const Volunteers = lazy(() => import('@/pages/Volunteers'));
const Emergency = lazy(() => import('@/pages/Emergency'));
const BloodDonation = lazy(() => import('@/pages/BloodDonation'));
const Events = lazy(() => import('@/pages/Events'));
const About = lazy(() => import('@/pages/About'));
const Donate = lazy(() => import('@/pages/Donate'));

// Shared page-level loading fallback
function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ds-primary border-t-transparent" />
        <p className="text-sm text-ds-muted">Loading…</p>
      </div>
    </div>
  );
}

function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: ROUTES.HOME, element: withSuspense(Home) },
      { path: ROUTES.ORGANIZATIONS, element: withSuspense(Organizations) },
      { path: ROUTES.VOLUNTEERS, element: withSuspense(Volunteers) },
      { path: ROUTES.EMERGENCY, element: withSuspense(Emergency) },
      { path: ROUTES.BLOOD_DONATION, element: withSuspense(BloodDonation) },
      { path: ROUTES.EVENTS, element: withSuspense(Events) },
      { path: ROUTES.ABOUT, element: withSuspense(About) },
      { path: ROUTES.DONATE, element: withSuspense(Donate) },
    ],
  },
]);
