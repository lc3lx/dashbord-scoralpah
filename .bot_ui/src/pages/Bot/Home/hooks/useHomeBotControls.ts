import type { UseHomeDataReturn } from './useHomeData';
import type { HomeRuntimeState } from '../types';
import { useState } from 'react';
import { ApiClientError } from '@shared/api';
import { useT } from '@shared/i18n';

type ControlFeedback = {
  tone: 'success' | 'danger' | 'warning';
  message: string;
};

/** Bot execution starts only after the user presses Start. */
export function useHomeBotControls(homeData: UseHomeDataReturn) {
  const t = useT();
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<ControlFeedback | null>(null);
  const setStatus = async (
    botStatus: 'running' | 'paused' | 'stopped',
    partial: Partial<HomeRuntimeState> = {},
  ) => {
    if (isUpdating) return;
    if (
      botStatus === 'running' &&
      !(homeData.data?.runtime.tradingPairIds?.length || homeData.data?.runtime.tradingPairId)
    ) {
      setFeedback({ tone: 'warning', message: t('home.controls.selectPair') });
      return;
    }
    setIsUpdating(true);
    try {
      const previousStopReason = homeData.data?.runtime.stopReason;
      await homeData.updateRuntime({ ...partial, botStatus });
      homeData.refresh();
      setFeedback({
        tone: 'success',
        message:
          botStatus === 'running'
            ? previousStopReason === 'DAILY_PROFIT_TARGET_REACHED' ||
              previousStopReason === 'DAILY_LOSS_LIMIT_REACHED'
              ? t('home.controls.startedAfterLimit')
              : t('home.controls.started')
            : botStatus === 'paused'
              ? t('home.controls.paused')
              : t('home.controls.stopped'),
      });
    } catch (error) {
      setFeedback({
        tone: 'danger',
        message: error instanceof ApiClientError ? error.message : t('common.errorGeneric'),
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    handleStart: (partial: Partial<HomeRuntimeState> = {}) => setStatus('running', partial),
    handlePause: () => setStatus('paused'),
    handleStop: () => setStatus('stopped'),
    handleApply: async (partial: Partial<HomeRuntimeState> = {}) => {
      if (!homeData.data) return;
      if (isUpdating) return;
      setIsUpdating(true);
      try {
        await homeData.updateRuntime({
          ...partial,
          settings: partial.settings ?? homeData.data.runtime.settings,
        });
        homeData.refresh();
        setFeedback({ tone: 'success', message: t('home.controls.saved') });
      } catch (error) {
        setFeedback({
          tone: 'danger',
          message: error instanceof ApiClientError ? error.message : t('common.errorGeneric'),
        });
      } finally {
        setIsUpdating(false);
      }
    },
    isStartPressed: homeData.data?.runtime.botStatus === 'running',
    isUpdating,
    feedback,
  };
}
