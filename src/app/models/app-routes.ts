export const homeRoute = 'home';
export const paymentsRoute = 'payments';
export const resultsRoute = 'results';
export const notificationsRoute = 'notifications';
export const settingsRoute = 'settings';
export const projectsRoute = 'project';
export const lessonRoute = 'lesson';
export const loginRoute = 'login';

export enum PageRoute{
  Home,
  Result,
  Payments,
  Classes,
  Notifications,
  Settings,
  Login,
  None,
}

export interface IAppPages {
  title?: string;
  url?: string;
  icon?: string;
  pageRoute?: PageRoute;
  handler?: () => void;
}

export const authRoutes = [loginRoute];

export const nonAuthRoutes = [homeRoute, paymentsRoute, resultsRoute, lessonRoute, projectsRoute, notificationsRoute, settingsRoute];