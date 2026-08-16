import { useEffect, useState } from 'react';
import { tradeService } from '@services/trades';
import type { TradeDetailContent } from '@services/trades';

export type TradeDetailStatus = 'loading' | 'ready' | 'missing';

export function useTradeDetail(tradeId: string | undefined) {
  const [detail, setDetail] = useState<TradeDetailContent | null>(null);
  const [status, setStatus] = useState<TradeDetailStatus>('loading');

  useEffect(() => {
    if (!tradeId) {
      setDetail(null);
      setStatus('missing');
      return;
    }

    let active = true;
    setStatus('loading');

    const load = async () => {
      const next = await tradeService.getTradeDetail(tradeId);
      if (!active) return;

      setDetail(next);
      setStatus(next ? 'ready' : 'missing');
    };

    void load();

    const unsubscribe = tradeService.subscribe(() => {
      void load();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [tradeId]);

  return { detail, status };
}
