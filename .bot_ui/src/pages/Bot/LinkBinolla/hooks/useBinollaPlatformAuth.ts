import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { authService } from '@features/Auth';
import { accountApi, ApiClientError, binollaApi } from '@shared/api';
import { invalidateBotSessionCache } from '@shared/api/botSessionCache';
import { routeForBotAccess } from '@shared/access/botAccess';
import { tokenStore } from '@shared/auth/tokenStore';
import { t } from '@shared/i18n';
import { hasTelegramInitData } from '@shared/telegram/telegramWebApp';

export type BinollaAuthMode = 'login' | 'register';

export function useBinollaPlatformAuth(mode: BinollaAuthMode = 'login') {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const ensureScarAlphaSession = useCallback(async () => {
    if (tokenStore.isAuthenticated()) return;
    if (hasTelegramInitData()) {
      await authService.loginWithTelegram();
      return;
    }
    navigate(ROUTES.login, { replace: true });
    throw { message: t('auth.signInFirst') };
  }, [navigate]);

  const submitCredentials = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError(t('binolla.auth.enterCredentials'));
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      await ensureScarAlphaSession();

      const result =
        mode === 'login'
          ? await binollaApi.login({ email: trimmedEmail, password })
          : await binollaApi.signup({ email: trimmedEmail, password });

      invalidateBotSessionCache();
      setStatus('success');
      setPassword('');
      navigate(routeForBotAccess(result.access), { replace: true });
    } catch (err) {
      setStatus('error');
      if (err instanceof ApiClientError) {
        setError(err.message);
        return;
      }
      if (err && typeof err === 'object' && 'message' in err) {
        setError(String((err as { message: unknown }).message));
        return;
      }
      setError(mode === 'login' ? t('binolla.auth.loginFailed') : t('binolla.auth.signupFailed'));
    }
  }, [email, ensureScarAlphaSession, mode, navigate, password]);

  const enterBotWithTelegram = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      if (!tokenStore.isAuthenticated()) {
        await authService.loginWithTelegram();
      }
      const accountStatus = await accountApi.status();
      setStatus('success');
      navigate(routeForBotAccess(accountStatus.botAccess), {
        replace: true,
      });
    } catch (err) {
      setStatus('error');
      if (err instanceof ApiClientError) {
        setError(err.message);
        return;
      }
      if (err && typeof err === 'object' && 'message' in err) {
        setError(String((err as { message: unknown }).message));
        return;
      }
      setError(t('binolla.auth.openFromTelegram'));
    }
  }, [navigate]);

  return {
    mode,
    email,
    setEmail,
    password,
    setPassword,
    status,
    error,
    submitCredentials,
    enterBotWithTelegram,
    canEnterViaTelegram: hasTelegramInitData(),
  };
}
