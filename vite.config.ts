import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendTarget = process.env.VITE_DEV_PROXY_TARGET ?? 'http://localhost:5207';

function resolveBotSrc(): string {
  const candidates = [
    path.resolve(__dirname, '.bot_ui/src'),
    path.resolve(__dirname, '../bot_telegram_webapp/src'),
    process.env.BOT_UI_SRC ? path.resolve(process.env.BOT_UI_SRC) : '',
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  throw new Error(
    'Bot UI source not found. Run `npm run sync:bot-ui` or deploy `.bot_ui/src` / sibling bot_telegram_webapp.',
  );
}

const botSrc = resolveBotSrc();

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
 * Standalone website dashboard under /dashboard/*.
 * Bot UI is resolved from `.bot_ui/src` (vendored) or `../bot_telegram_webapp/src` (monorepo).
 */
export default defineConfig({
  base: '/dashboard/',
  plugins: [react(), redirectRootToDashboard()],
  resolve: {
    alias: [
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
    fs: {
      allow: [path.resolve(__dirname, '..'), path.resolve(__dirname, '.bot_ui')],
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
    host: '0.0.0.0',
    port: 4174,
    // Allow any Host behind nginx reverse proxy (scaralphaai.com, www, …)
    allowedHosts: true,
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
