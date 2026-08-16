import type { UseHomeDataReturn } from './useHomeData';
import { useState } from 'react';

/** Bot execution starts only after the user presses Start. */
export function useHomeBotControls(homeData: UseHomeDataReturn) {
  const [isUpdating, setIsUpdating] = useState(false);
  const setStatus = async (botStatus: 'running' | 'paused' | 'stopped') => {
    if (isUpdating) return;
    if (botStatus === 'running' && !homeData.data?.runtime.tradingPairId) return;
    setIsUpdating(true);
    try {
      await homeData.updateRuntime({ botStatus });
      homeData.refresh();
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    handleStart: () => setStatus('running'),
    handlePause: () => setStatus('paused'),
    handleStop: () => setStatus('stopped'),
    handleApply: async () => {
      if (!homeData.data) return;
      await homeData.updateRuntime({ settings: homeData.data.runtime.settings });
      homeData.refresh();
    },
    isStartPressed: homeData.data?.runtime.botStatus === 'running',
    isUpdating,
  };
}
