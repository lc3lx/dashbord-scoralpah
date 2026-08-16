export type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export type AuthSession = {
  accessToken: string;
  userId: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type SignupPayload = {
  fullName: string;
  email: string;
  password: string;
  country: string;
  telegramId: string;
  binollaAccount: string;
};

export type ActivationPayload = {
  activationKey: string;
};

export type AuthServiceError = {
  message: string;
  fieldErrors?: FieldErrors<string>;
};

export type LoginFormValues = LoginCredentials;

export type SignupFormValues = SignupPayload;

export type ActivationFormValues = ActivationPayload;
