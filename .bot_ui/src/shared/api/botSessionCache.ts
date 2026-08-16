import { accountApi } from './endpoints';
import type { AccountStatusResponse } from './types';

/** Cross-page cache — navigating Home↔Trading must not re-trigger restore storms. */
const STATUS_TTL_MS = 15_000;

let statusCache: { at: number; value: AccountStatusResponse } | null = null;
let statusInFlight: Promise<AccountStatusResponse> | null = null;

export function invalidateBotSessionCache(): void {
  statusCache = null;
  statusInFlight = null;
}

export async function getAccountStatusCached(
  force = false,
): Promise<AccountStatusResponse> {
  if (!force && statusCache && Date.now() - statusCache.at < STATUS_TTL_MS) {
    return statusCache.value;
  }

  if (!force && statusInFlight) {
    return statusInFlight;
  }

  statusInFlight = accountApi
    .status()
    .then((value) => {
      statusCache = { at: Date.now(), value };
      return value;
    })
    .finally(() => {
      statusInFlight = null;
    });

  return statusInFlight;
}
