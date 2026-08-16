import type { AppRoute } from '@constants/routes';

export type RouteHandle = {
  title?: string;
  figmaNodeId?: string;
  requiresAuth?: boolean;
  showBottomNav?: boolean;
};

export type AppRouteConfig = {
  path: AppRoute;
  handle?: RouteHandle;
};
