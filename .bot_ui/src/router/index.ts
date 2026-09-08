import { createBrowserRouter } from 'react-router-dom';
import { appRoutes } from './routes';

// basename follows Vite's base, so the router and the asset URLs can never disagree.
// Without it every route 404s the moment the app stops living at the domain root.
export const router = createBrowserRouter(appRoutes, {
  basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
});
