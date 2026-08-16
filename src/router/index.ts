import { createBrowserRouter } from 'react-router-dom';
import { appRoutes } from './routes';

/** All public URLs are under /dashboard (see Vite base). */
export const router = createBrowserRouter(appRoutes, { basename: '/dashboard' });
