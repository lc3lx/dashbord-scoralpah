import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@styles/global/reset.css';
import '@styles/global/rtl.css';
import './styles/dashboard-responsive.css';
import { I18nProvider } from '@shared/i18n';

/**
 * Website dashboard entry — no Telegram WebApp bootstrap.
 * Auth is email/password JWT via /api/auth/login|register.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
