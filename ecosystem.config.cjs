/**
 * PM2 — Scar Alpha Dashboard (website under /dashboard/)
 *
 * Usage:
 *   chmod +x start-dashboard-pm2.sh
 *   ./start-dashboard-pm2.sh
 */
const path = require('path');

const port = process.env.DASHBOARD_PORT || '4174';

module.exports = {
  apps: [
    {
      name: 'scaralpha-dashboard',
      cwd: __dirname,
      // vite preview respects base: '/dashboard/'
      script: 'npx',
      args: `vite preview --host 0.0.0.0 --port ${port}`,
      interpreter: 'none',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      kill_timeout: 8000,
      kill_retry_time: 100,
      error_file: path.join(__dirname, 'logs', 'pm2-error.log'),
      out_file: path.join(__dirname, 'logs', 'pm2-out.log'),
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: 'production',
        DASHBOARD_PORT: port,
        PATH: process.env.PATH || '',
      },
    },
  ],
};
