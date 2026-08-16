import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const botSrc = path.resolve(__dirname, '../bot_telegram_webapp/src');
const backendTarget = process.env.VITE_DEV_PROXY_TARGET ?? 'http://localhost:5207';

function redirectRootToDashboard(): Plugin {
  const redirect = (
    req: { url?: string },
    res: { statusCode: number; setHeader: (k: string, v: string) => void; end: () => void },
    next: () => void,
  ) => {
    const url = req.url ?? '';
    if (url === '/' || url === '') {
      res.statusCode = 302;
      res.setHeader('Location', '/dashboard/');
      res.end();
      return;
    }
    next();
  };

  return {
    name: 'redirect-root-to-dashboard',
    configureServer(server) {
      server.middlewares.use(redirect);
    },
    configurePreviewServer(server) {
      server.middlewares.use(redirect);
    },
  };
}

/**
 * Standalone website dashboard.
 * Public URLs are always under /dashboard/* (Vite base + React Router basename).
 * UI source is reused from bot_telegram_webapp for visual parity; entry/routing are independent.
 */
export default defineConfig({
  base: '/dashboard/',
  plugins: [react(), redirectRootToDashboard()],
  resolve: {
    alias: [
      // Dashboard-local route map (home at / → public /dashboard/)
      {
        find: '@constants/routes',
        replacement: path.resolve(__dirname, './src/constants/routes.ts'),
      },
      {
        find: '@layouts',
        replacement: path.resolve(__dirname, './src/layouts'),
      },
      {
        find: '@router',
        replacement: path.resolve(__dirname, './src/router'),
      },
      // Shared bot UI / services (visual + API parity)
      { find: '@', replacement: botSrc },
      { find: '@assets', replacement: path.resolve(botSrc, 'assets') },
      { find: '@components', replacement: path.resolve(botSrc, 'components') },
      { find: '@constants', replacement: path.resolve(botSrc, 'constants') },
      { find: '@hooks', replacement: path.resolve(botSrc, 'hooks') },
      { find: '@pages', replacement: path.resolve(botSrc, 'pages') },
      { find: '@features', replacement: path.resolve(botSrc, 'features') },
      { find: '@services', replacement: path.resolve(botSrc, 'services') },
      { find: '@shared', replacement: path.resolve(botSrc, 'shared') },
      { find: '@styles', replacement: path.resolve(botSrc, 'styles') },
      { find: '@types', replacement: path.resolve(botSrc, 'types') },
      { find: '@utils', replacement: path.resolve(botSrc, 'utils') },
    ],
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
  },
  server: {
    port: 5174,
    strictPort: true,
    open: '/dashboard/',
    // UI/assets are reused from bot_telegram_webapp via aliases.
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        timeout: 120_000,
        proxyTimeout: 120_000,
      },
      '/health': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4174,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        timeout: 120_000,
        proxyTimeout: 120_000,
      },
      '/health': { target: backendTarget, changeOrigin: true },
    },
  },
});
