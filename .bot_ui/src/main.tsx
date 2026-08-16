import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@styles/global/reset.css';
import '@styles/global/rtl.css';
import { I18nProvider } from '@shared/i18n';
import { bootstrapTelegramWebApp } from '@shared/telegram/telegramWebApp';

bootstrapTelegramWebApp();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
