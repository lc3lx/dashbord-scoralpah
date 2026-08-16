/** Prefer liquid Binolla OTC FX majors — avoid first-in-list equity OTC like 0700.HK_otc. */
const PREFERRED_SYMBOLS = [
  'EURUSD_otc',
  'GBPUSD_otc',
  'USDJPY_otc',
  'EURGBP_otc',
  'AUDUSD_otc',
  'USDCAD_otc',
  'USDCHF_otc',
  'EURUSD',
  'GBPUSD',
  'USDJPY',
] as const;

export type MarketAssetLike = {
  symbol: string;
  available?: boolean;
};

export function isPreferredMarketSymbol(symbol: string): boolean {
  const s = symbol.trim();
  return PREFERRED_SYMBOLS.some((p) => p.toLowerCase() === s.toLowerCase());
}

export function pickPreferredMarketAsset<T extends MarketAssetLike>(
  assets: T[],
): T | undefined {
  if (!assets.length) return undefined;

  for (const preferred of PREFERRED_SYMBOLS) {
    const hit = assets.find(
      (a) =>
        a.symbol.toLowerCase() === preferred.toLowerCase() &&
        (a.available === undefined || a.available),
    );
    if (hit) return hit;
  }

  const anyFxOtc = assets.find(
    (a) =>
      (a.available === undefined || a.available) &&
      /^(EUR|GBP|USD|AUD|CAD|CHF|JPY|NZD){2}_otc$/i.test(a.symbol.replace('/', '')),
  );
  if (anyFxOtc) return anyFxOtc;

  return assets.find((a) => a.available) ?? assets[0];
}
