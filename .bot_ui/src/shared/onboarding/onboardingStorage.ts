const ONBOARDING_DONE_KEY = 'scaralpha.onboarding.done';

export function isOnboardingDone(): boolean {
  try {
    return window.localStorage.getItem(ONBOARDING_DONE_KEY) === '1';
  } catch {
    return false;
  }
}

export function markOnboardingDone(): void {
  try {
    window.localStorage.setItem(ONBOARDING_DONE_KEY, '1');
  } catch {
    /* ignore quota / private mode */
  }
}

/** Debug/test helper — clears first-launch flag so splash shows onboarding again. */
export function resetOnboardingDone(): void {
  try {
    window.localStorage.removeItem(ONBOARDING_DONE_KEY);
  } catch {
    /* ignore */
  }
}
