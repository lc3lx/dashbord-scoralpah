import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { AppShell, AuthLayout, BotLayout } from '@layouts/index';
import { FIGMA_NODES, ROUTES } from '@constants/routes';

const SplashPage = lazy(() => import('@pages/Bot/Splash'));
const OnboardingPage = lazy(() => import('@pages/Bot/Onboarding'));
const LoginPage = lazy(() => import('@pages/Bot/Login'));
const SignupPage = lazy(() => import('@pages/Bot/Signup'));
const LinkBinollaPage = lazy(() => import('@pages/Bot/LinkBinolla'));
const DashboardPage = lazy(() => import('@pages/Bot/Dashboard'));
const HomePage = lazy(() => import('@pages/Bot/Home'));
const TradingPage = lazy(() => import('@pages/Bot/Trading'));
const TradeDetailPage = lazy(() =>
  import('@pages/Bot/Trading').then((module) => ({ default: module.TradeDetailPage })),
);
const HistoryPage = lazy(() => import('@pages/Bot/History'));
const NotificationsPage = lazy(() => import('@pages/Bot/Notifications'));
const NotificationDetailPage = lazy(() =>
  import('@pages/Bot/Notifications').then((module) => ({
    default: module.NotificationDetailPage,
  })),
);
const SettingsPage = lazy(() => import('@pages/Bot/Settings'));
const EditProfilePage = lazy(() =>
  import('@pages/Bot/Settings').then((module) => ({ default: module.EditProfilePage })),
);
const ChangePasswordPage = lazy(() =>
  import('@pages/Bot/Settings').then((module) => ({ default: module.ChangePasswordPage })),
);
const SubscriptionPage = lazy(() =>
  import('@pages/Bot/Settings').then((module) => ({ default: module.SubscriptionPage })),
);
const ActivationHistoryPage = lazy(() =>
  import('@pages/Bot/Settings').then((module) => ({ default: module.ActivationHistoryPage })),
);
const AdminPage = lazy(() => import('@pages/Bot/Admin'));

export const appRoutes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: ROUTES.splash,
            element: <SplashPage />,
            handle: { title: 'Splash', figmaNodeId: FIGMA_NODES.splash },
          },
          {
            path: ROUTES.onboarding,
            element: <OnboardingPage />,
            handle: { title: 'Onboarding', figmaNodeId: FIGMA_NODES.onboardingStep1 },
          },
          {
            path: ROUTES.login,
            element: <LoginPage />,
            handle: { title: 'Login', figmaNodeId: FIGMA_NODES.login },
          },
          {
            path: ROUTES.signup,
            element: <SignupPage />,
            handle: { title: 'Signup', figmaNodeId: FIGMA_NODES.signup },
          },
          {
            path: ROUTES.linkBinolla,
            element: <LinkBinollaPage />,
            handle: { title: 'Create Binolla account' },
          },
          {
            // Obsolete activation-key flow — referral + admin approval replaced it.
            path: ROUTES.activation,
            element: <Navigate to={ROUTES.signup} replace />,
          },
        ],
      },
      {
        element: <BotLayout />,
        children: [
          {
            path: ROUTES.home,
            element: <DashboardPage />,
            handle: {
              title: 'Home',
              figmaNodeId: FIGMA_NODES.dashboard,
              requiresAuth: true,
              showBottomNav: true,
            },
          },
          {
            path: ROUTES.bot,
            element: <HomePage />,
            handle: {
              title: 'AI Bot Engine',
              figmaNodeId: FIGMA_NODES.bot,
              requiresAuth: true,
              showBottomNav: true,
            },
          },
          {
            path: ROUTES.trading,
            element: <TradingPage />,
            handle: {
              title: 'Trading',
              figmaNodeId: FIGMA_NODES.trading,
              requiresAuth: true,
              showBottomNav: true,
            },
          },
          {
            path: ROUTES.tradeDetail,
            element: <TradeDetailPage />,
            handle: {
              title: 'Trade Details',
              figmaNodeId: FIGMA_NODES.tradeDetail,
              requiresAuth: true,
              showBottomNav: false,
            },
          },
          {
            path: ROUTES.history,
            element: <HistoryPage />,
            handle: {
              title: 'History',
              figmaNodeId: FIGMA_NODES.history,
              requiresAuth: true,
              showBottomNav: true,
            },
          },
          {
            path: ROUTES.notifications,
            element: <NotificationsPage />,
            handle: {
              title: 'Notifications',
              figmaNodeId: FIGMA_NODES.notifications,
              requiresAuth: true,
            },
          },
          {
            path: ROUTES.notificationDetail,
            element: <NotificationDetailPage />,
            handle: {
              title: 'Notification Detail',
              figmaNodeId: FIGMA_NODES.notificationDetail,
              requiresAuth: true,
            },
          },
          {
            path: ROUTES.settings,
            element: <SettingsPage />,
            handle: {
              title: 'Account',
              figmaNodeId: FIGMA_NODES.settings,
              requiresAuth: true,
              showBottomNav: true,
            },
          },
          {
            path: ROUTES.editProfile,
            element: <EditProfilePage />,
            handle: {
              title: 'Edit Profile',
              figmaNodeId: FIGMA_NODES.editProfile,
              requiresAuth: true,
              showBottomNav: false,
            },
          },
          {
            path: ROUTES.changePassword,
            element: <ChangePasswordPage />,
            handle: {
              title: 'Change Password',
              figmaNodeId: FIGMA_NODES.changePassword,
              requiresAuth: true,
              showBottomNav: false,
            },
          },
          {
            path: ROUTES.subscription,
            element: <SubscriptionPage />,
            handle: {
              title: 'Subscription',
              figmaNodeId: FIGMA_NODES.subscription,
              requiresAuth: true,
              showBottomNav: false,
            },
          },
          {
            path: ROUTES.activationHistory,
            element: <ActivationHistoryPage />,
            handle: {
              title: 'Activation History',
              figmaNodeId: FIGMA_NODES.activationHistory,
              requiresAuth: true,
              showBottomNav: false,
            },
          },
          {
            path: ROUTES.admin,
            element: <AdminPage />,
            handle: {
              title: 'Admin Approvals',
              requiresAuth: true,
              showBottomNav: false,
            },
          },
        ],
      },
    ],
  },
];
