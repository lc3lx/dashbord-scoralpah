import { ApiClientError, authApi } from '@shared/api';
import { tokenStore } from '@shared/auth/tokenStore';
import { t } from '@shared/i18n';
import { getTelegramInitData, hasTelegramInitData } from '@shared/telegram/telegramWebApp';
import type {
  ActivationPayload,
  AuthSession,
  AuthServiceError,
  LoginCredentials,
  SignupPayload,
} from '../types';

function toAuthError(error: unknown): AuthServiceError {
  if (error instanceof ApiClientError) {
    return { message: error.message };
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return { message: String((error as { message: unknown }).message) };
  }
  return { message: t('auth.authFailed') };
}

function storeSession(result: { accessToken: string; userId: string }): AuthSession {
  tokenStore.setSession(result.accessToken, result.userId);
  return {
    accessToken: result.accessToken,
    userId: result.userId,
  };
}

/**
 * Authenticates via Telegram Mini App initData → backend JWT.
 */
export async function loginWithTelegram(): Promise<AuthSession> {
  const initData = getTelegramInitData();
  if (!initData) {
    throw {
      message: t('auth.openFromTelegram'),
    } satisfies AuthServiceError;
  }

  try {
    const result = await authApi.telegram(initData);
    return storeSession(result);
  } catch (error) {
    throw toAuthError(error);
  }
}

/**
 * Bind current JWT user to Telegram Mini App identity (email/demo → bot reopen via initData).
 */
export async function linkTelegramIfAvailable(): Promise<AuthSession | null> {
  if (!hasTelegramInitData()) return null;
  const initData = getTelegramInitData();
  if (!initData) return null;
  try {
    const result = await authApi.linkTelegram(initData);
    return storeSession(result);
  } catch {
    // Non-fatal: email session remains; admin can attach Telegram id manually.
    return null;
  }
}

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  try {
    const result = await authApi.login({
      email: credentials.email.trim(),
      password: credentials.password,
    });
    const session = storeSession(result);
    await linkTelegramIfAvailable();
    return session;
  } catch (error) {
    throw toAuthError(error);
  }
}

/** Marketing demo accounts only — separate URL from normal /login. */
export async function loginDemo(credentials: LoginCredentials): Promise<AuthSession> {
  try {
    const result = await authApi.demoLogin({
      email: credentials.email.trim(),
      password: credentials.password,
    });
    const session = storeSession(result);
    await linkTelegramIfAvailable();
    return session;
  } catch (error) {
    throw toAuthError(error);
  }
}

export async function signup(payload: SignupPayload): Promise<AuthSession> {
  try {
    const result = await authApi.register({
      email: payload.email.trim(),
      password: payload.password,
      fullName: payload.fullName.trim(),
      country: payload.country.trim(),
      username: payload.telegramId.trim() || undefined,
    });
    const session = storeSession(result);
    await linkTelegramIfAvailable();
    return session;
  } catch (error) {
    throw toAuthError(error);
  }
}

/** @deprecated Activation keys are obsolete. */
export async function activate(_payload: ActivationPayload): Promise<AuthSession> {
  throw { message: t('auth.activationObsolete') } satisfies AuthServiceError;
}

export const authService = {
  loginWithTelegram,
  linkTelegramIfAvailable,
  login,
  loginDemo,
  signup,
  activate,
};
