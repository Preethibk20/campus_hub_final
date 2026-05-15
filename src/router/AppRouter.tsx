import React, { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

// Eagerly load core pages to ensure they work
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'

// Lazy load everything else to isolate crashes
const ExplorePage = lazy(() => import('@/pages/ExplorePage'))
const GigDetailPage = lazy(() => import('@/pages/GigDetailPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const VerifyEmailPage = lazy(() => import('@/pages/VerifyEmailPage'))
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const DashboardGigsPage = lazy(() => import('@/pages/dashboard/MyGigsPage'))
const DashboardOrdersPage = lazy(() => import('@/pages/DashboardOrdersPage'))
const DashboardOrderDetailPage = lazy(() => import('@/pages/dashboard/OrderDetailPage'))
const DashboardWalletPage = lazy(() => import('@/pages/dashboard/WalletPage'))
const InboxPage = lazy(() => import('@/pages/dashboard/InboxPage'))
const DashboardNotificationsPage = lazy(() => import('@/pages/dashboard/NotificationsPage'))
const CreateGigPage = lazy(() => import('@/pages/CreateGigPage'))
const EditProfilePage = lazy(() => import('@/pages/dashboard/EditProfilePage'))
const OnboardingPage = lazy(() => import('@/pages/dashboard/OnboardingPage'))
const SettingsPage = lazy(() => import('@/pages/dashboard/SettingsPage'))
const FindPartnersPage = lazy(() => import('@/pages/FindPartnersPage'))
const PostHackathonPage = lazy(() => import('@/pages/PostHackathonPage'))
const MyRequestsPage = lazy(() => import('@/pages/dashboard/MyRequestsPage'))
const MyProfilePage = lazy(() => import('@/pages/MyProfilePage'))
const PublicProfilePage = lazy(() => import('@/pages/PublicProfilePage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// Centralized Layout
const DashboardLayout = lazy(() => import('@/components/layout/DashboardLayout'))

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Router Configuration
const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <Suspense fallback={<Loading />}><RegisterPage /></Suspense>,
  },
  {
    path: '/verify',
    element: <Suspense fallback={<Loading />}><VerifyEmailPage /></Suspense>,
  },
  {
    path: '/explore',
    element: <Suspense fallback={<Loading />}><ExplorePage /></Suspense>,
  },
  {
    path: '/find-partners',
    element: <Suspense fallback={<Loading />}><FindPartnersPage /></Suspense>,
  },
  {
    path: '/post-hackathon',
    element: <Suspense fallback={<Loading />}><PostHackathonPage /></Suspense>,
  },
  {
    path: '/gigs/:id',
    element: <Suspense fallback={<Loading />}><GigDetailPage /></Suspense>,
  },
  {
    path: '/profile/:userId',
    element: <Suspense fallback={<Loading />}><PublicProfilePage /></Suspense>,
  },

  // Protected Routes
  {
    path: '/dashboard/onboarding',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}><OnboardingPage /></Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
            <DashboardLayout>
                <DashboardPage />
            </DashboardLayout>
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/gigs',
    element: (
      <ProtectedRoute requireVerification>
        <Suspense fallback={<Loading />}>
            <DashboardLayout>
                <DashboardGigsPage />
            </DashboardLayout>
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/gigs/:id',
    element: (
      <ProtectedRoute requireVerification>
        <Suspense fallback={<Loading />}>
            <DashboardLayout>
                <GigDetailPage />
            </DashboardLayout>
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/requests',
    element: (
      <ProtectedRoute requireVerification>
        <Suspense fallback={<Loading />}>
            <DashboardLayout>
                <MyRequestsPage />
            </DashboardLayout>
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/orders',
    element: (
      <ProtectedRoute requireVerification>
        <Suspense fallback={<Loading />}>
            <DashboardLayout>
                <DashboardOrdersPage />
            </DashboardLayout>
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/orders/:id',
    element: (
      <ProtectedRoute requireVerification>
        <Suspense fallback={<Loading />}>
            <DashboardLayout>
                <DashboardOrderDetailPage />
            </DashboardLayout>
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/wallet',
    element: (
      <ProtectedRoute requireVerification>
        <Suspense fallback={<Loading />}>
            <DashboardLayout>
                <DashboardWalletPage />
            </DashboardLayout>
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/messages',
    element: (
      <ProtectedRoute requireVerification>
        <Suspense fallback={<Loading />}>
            <DashboardLayout>
                <InboxPage />
            </DashboardLayout>
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/inbox',
    element: (
      <ProtectedRoute requireVerification>
        <Suspense fallback={<Loading />}>
            <DashboardLayout>
                <InboxPage />
            </DashboardLayout>
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/inbox/:conversationId',
    element: (
      <ProtectedRoute requireVerification>
        <Suspense fallback={<Loading />}>
            <DashboardLayout>
                <InboxPage />
            </DashboardLayout>
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/profile/edit',
    element: (
      <ProtectedRoute requireVerification>
        <Suspense fallback={<Loading />}>
            <DashboardLayout>
                <EditProfilePage />
            </DashboardLayout>
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/profile',
    element: (
      <ProtectedRoute requireVerification>
        <Suspense fallback={<Loading />}>
            <DashboardLayout>
                <MyProfilePage />
            </DashboardLayout>
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/settings',
    element: (
      <ProtectedRoute requireVerification>
        <Suspense fallback={<Loading />}>
            <DashboardLayout>
                <SettingsPage />
            </DashboardLayout>
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/notifications',
    element: (
      <ProtectedRoute requireVerification>
        <Suspense fallback={<Loading />}>
            <DashboardLayout>
                <DashboardNotificationsPage />
            </DashboardLayout>
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/gigs/new',
    element: (
      <ProtectedRoute requireVerification>
        <Suspense fallback={<Loading />}><CreateGigPage /></Suspense>
      </ProtectedRoute>
    ),
  },

  // 404 Route
  {
    path: '*',
    element: <Suspense fallback={<Loading />}><NotFoundPage /></Suspense>,
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
})

// App Router Component
const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />
}

export default AppRouter
