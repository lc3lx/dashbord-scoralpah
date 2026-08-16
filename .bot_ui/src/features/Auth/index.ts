export type {
  FormStatus,
  AuthSession,
  LoginCredentials,
  SignupPayload,
  ActivationPayload,
  AuthServiceError,
  LoginFormValues,
  SignupFormValues,
  ActivationFormValues,
  FieldErrors,
} from './types';
export { authService, login, signup, activate, loginWithTelegram, linkTelegramIfAvailable } from './services/authService';
export { useAuthForm } from './hooks/useAuthForm';
export type { UseAuthFormOptions, UseAuthFormResult } from './hooks/useAuthForm';
export {
  validateLoginForm,
  validateSignupForm,
  validateActivationForm,
  emailRule,
  passwordRule,
  required,
  telegramRule,
  optionalTelegramRule,
  hasFieldErrors,
} from './validation';
export { AuthShell } from './components/AuthShell';
export { AuthBrand } from './components/AuthBrand';
export { AuthHero } from './components/AuthHero';
export { AuthSubmitButton } from './components/AuthSubmitButton';
export { AuthLegalFooter } from './components/AuthLegalFooter';
export { AuthServerError } from './components/AuthServerError';
