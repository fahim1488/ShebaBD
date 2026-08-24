import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ROUTES } from '@/constants/routes';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Lazy-loaded pages
const Home = lazy(() => import('@/pages/Home'));
const Organizations = lazy(() => import('@/pages/Organizations'));
const Volunteers = lazy(() => import('@/pages/Volunteers'));
const Emergency = lazy(() => import('@/pages/Emergency'));
const BloodDonation = lazy(() => import('@/pages/BloodDonation'));
const Events = lazy(() => import('@/pages/Events'));
const About = lazy(() => import('@/pages/About'));
const Donate = lazy(() => import('@/pages/Donate'));
const AiFakeNgoDetection = lazy(() => import('@/pages/AiFakeNgoDetection'));
const AiFakeReviewDetection = lazy(() => import('@/pages/AiFakeReviewDetection'));
const AiContentGenerator = lazy(() => import('@/pages/AiContentGenerator'));
const AiSmartSearch = lazy(() => import('@/pages/AiSmartSearch'));
const AiDonationAdvisor = lazy(() => import('@/pages/AiDonationAdvisor'));
const AiAnalytics = lazy(() => import('@/pages/AiAnalytics'));
const AiDisasterIntelligence = lazy(() => import('@/pages/AiDisasterIntelligence'));
const Community = lazy(() => import('@/pages/Community'));
const AiVolunteerRecommendation = lazy(() => import('@/pages/AiVolunteerRecommendation'));
const AiOrgRecommendation = lazy(() => import('@/pages/AiOrgRecommendation'));
const AiOrgTrustScore = lazy(() => import('@/pages/AiOrgTrustScore'));
const Profile = lazy(() => import('@/pages/Profile'));
const DonationHistory = lazy(() => import('@/pages/DonationHistory'));
const DonationTracking = lazy(() => import('@/pages/DonationTracking'));
const DonationAnalytics = lazy(() => import('@/pages/DonationAnalytics'));
const DonationSuccess = lazy(() => import('@/pages/DonationSuccess'));
const SignIn = lazy(() => import('@/pages/SignIn'));
const SignUp = lazy(() => import('@/pages/SignUp'));

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

function withProtection(Component: React.ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProtectedRoute>
        <Component />
      </ProtectedRoute>
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
      { path: ROUTES.AI_NGO_DETECTION, element: withSuspense(AiFakeNgoDetection) },
      { path: ROUTES.AI_REVIEW_DETECTION, element: withSuspense(AiFakeReviewDetection) },
      { path: ROUTES.AI_CONTENT_GENERATOR, element: withSuspense(AiContentGenerator) },
      { path: ROUTES.AI_SMART_SEARCH, element: withSuspense(AiSmartSearch) },
      { path: ROUTES.AI_DONATION_ADVISOR, element: withSuspense(AiDonationAdvisor) },
      { path: ROUTES.AI_ANALYTICS, element: withSuspense(AiAnalytics) },
      { path: ROUTES.DISASTER_INTELLIGENCE, element: withSuspense(AiDisasterIntelligence) },
      { path: ROUTES.COMMUNITY, element: withSuspense(Community) },
      { path: ROUTES.AI_VOLUNTEER_RECOMMENDATION, element: withSuspense(AiVolunteerRecommendation) },
      { path: ROUTES.AI_ORG_RECOMMENDATION, element: withSuspense(AiOrgRecommendation) },
      { path: ROUTES.AI_ORG_TRUST_SCORE, element: withSuspense(AiOrgTrustScore) },
      // Protected routes
      { path: ROUTES.PROFILE, element: withProtection(Profile) },
      { path: ROUTES.DONATION_HISTORY, element: withProtection(DonationHistory) },
      { path: ROUTES.DONATION_TRACKING, element: withProtection(DonationTracking) },
      { path: ROUTES.DONATION_ANALYTICS, element: withProtection(DonationAnalytics) },
      { path: '/donation-success', element: withSuspense(DonationSuccess) },
    ],
  },
  // ── Auth routes (no navbar / footer) ──────────────────────────────────────
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.SIGN_IN, element: withSuspense(SignIn) },
      { path: ROUTES.SIGN_UP, element: withSuspense(SignUp) },
    ],
  },
]);
