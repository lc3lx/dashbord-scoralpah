import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { PageContent } from '@components/layouts/PageContent';
import { BackgroundGlow } from '@components/organisms/BackgroundGlow';
import { BottomSheet } from '@components/organisms/BottomSheet';
import { useT } from '@shared/i18n';
import { getHomeSheetTitles } from './data/home.mock';
import { MAX_BOT_PAIRS } from './data/homeService';
import { resolveChartSheetTitle } from './utils/chartTitle';
import { useHomeBotControls } from './hooks/useHomeBotControls';
import { useHomeData } from './hooks/useHomeData';
import { useHomeSheets } from './hooks/useHomeSheets';
import { BotControlsSection } from './sections/BotControlsSection';
import { BotEngineSection } from './sections/BotEngineSection';
import { HomeActionsSection } from './sections/HomeActionsSection';
import { HomeConfigSection } from './sections/HomeConfigSection';
import { HomeHeaderSection } from './sections/HomeHeaderSection';
import { HomeStatsSection } from './sections/HomeStatsSection';
import { RiskLimitsSection } from './sections/RiskLimitsSection';
import { TradeAmountSection } from './sections/TradeAmountSection';
import { BotSettingsSheetContent } from './sheets/BotSettingsSheetContent';
import { ChartSheetContent } from './sheets/ChartSheetContent';
import { MarketTypeSheetContent } from './sheets/MarketTypeSheetContent';
import { StrategySheetContent } from './sheets/StrategySheetContent';
import { TechnicalIndicatorSheetContent } from './sheets/TechnicalIndicatorSheetContent';
import { TradingPairSheetContent } from './sheets/TradingPairSheetContent';
import styles from './HomePage.module.css';

export default function HomePage() {
  const t = useT();
  const homeData = useHomeData();
  const sheets = useHomeSheets();
  const botControls = useHomeBotControls(homeData);
  const [pairSearchQuery, setPairSearchQuery] = useState('');
  const sheetTitles = getHomeSheetTitles();

  const { data, configRows, tradeAmount, updateRuntime } = homeData;
  const [tradeAmountValue, setTradeAmountValue] = useState('');

  const botEngine = data?.botEngine ?? null;

  const settingsContent = data?.runtime.settings ?? data?.sheets.settings;

  const marketTypeContent = useMemo(() => {
    if (!data) return null;

    return {
      ...data.sheets.marketType,
      selectedId: data.runtime.marketTypeId,
    };
  }, [data]);

  const tradingPairContent = useMemo(() => {
    if (!data) return null;

    const selectedIds =
      data.runtime.tradingPairIds?.length > 0
        ? data.runtime.tradingPairIds
        : data.runtime.tradingPairId
          ? [data.runtime.tradingPairId]
          : [];

    return {
      ...data.sheets.tradingPair,
      selectedId: selectedIds[0] ?? '',
      selectedIds,
    };
  }, [data]);

  const technicalIndicatorContent = useMemo(() => {
    if (!data) return null;

    return {
      ...data.sheets.technicalIndicator,
      selectedId: data.runtime.technicalIndicatorId,
    };
  }, [data]);

  const strategyContent = useMemo(() => {
    if (!data) return null;

    return {
      ...data.sheets.strategy,
      selectedId: data.runtime.strategyId,
    };
  }, [data]);

  const filteredPairOptions = useMemo(() => {
    if (!tradingPairContent) return [];

    const query = pairSearchQuery.trim().toLowerCase();
    if (!query) return tradingPairContent.options;

    return tradingPairContent.options.filter(
      (option) =>
        option.title.toLowerCase().includes(query) ||
        option.description?.toLowerCase().includes(query),
    );
  }, [pairSearchQuery, tradingPairContent]);

  const chartTitle = useMemo(() => {
    if (!data || !tradingPairContent) return '';

    const pairIds =
      data.runtime.tradingPairIds?.length > 0
        ? data.runtime.tradingPairIds
        : tradingPairContent.selectedId
          ? [tradingPairContent.selectedId]
          : [];
    const pairLabel =
      pairIds.length === 0
        ? '—'
        : pairIds.length === 1
          ? (tradingPairContent.options.find((option) => option.id === pairIds[0])?.title ??
            pairIds[0])
          : `${tradingPairContent.options.find((option) => option.id === pairIds[0])?.title ?? pairIds[0]} +${pairIds.length - 1}`;

    return resolveChartSheetTitle({
      template: data.sheets.chart.titleTemplate,
      pairLabel: pairLabel || '—',
      durationLabel: t('common.rsi'),
    });
  }, [data, tradingPairContent, t]);

  const handleMarketTypeSelect = useCallback(
    async (optionId: string) => {
      await updateRuntime({ marketTypeId: optionId });
      sheets.closeSheet();
    },
    [sheets.closeSheet, updateRuntime],
  );

  const handleTradingPairSelect = useCallback(
    async (optionId: string) => {
      const current =
        data?.runtime.tradingPairIds?.length
          ? [...data.runtime.tradingPairIds]
          : data?.runtime.tradingPairId
            ? [data.runtime.tradingPairId]
            : [];
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : current.length >= MAX_BOT_PAIRS
          ? current
          : [...current, optionId];
      await updateRuntime({
        tradingPairIds: next,
        tradingPairId: next[0] ?? '',
      });
    },
    [data?.runtime.tradingPairId, data?.runtime.tradingPairIds, updateRuntime],
  );

  const handleTradingPairSelectAll = useCallback(async () => {
    const ids = filteredPairOptions.map((option) => option.id);
    await updateRuntime({
      tradingPairIds: ids,
      tradingPairId: ids[0] ?? '',
    });
  }, [filteredPairOptions, updateRuntime]);

  const handleTradingPairClearAll = useCallback(async () => {
    await updateRuntime({
      tradingPairIds: [],
      tradingPairId: '',
    });
  }, [updateRuntime]);

  const handleTechnicalIndicatorSelect = useCallback(
    async (optionId: string) => {
      await updateRuntime({ technicalIndicatorId: optionId });
      sheets.closeSheet();
    },
    [sheets.closeSheet, updateRuntime],
  );

  const handleStrategySelect = useCallback(
    async (optionId: string) => {
      await updateRuntime({ strategyId: optionId });
      sheets.closeSheet();
    },
    [sheets.closeSheet, updateRuntime],
  );

  const handleSettingsToggle = useCallback(
    async (toggleId: string, enabled: boolean) => {
      if (!settingsContent) return;

      await updateRuntime({
        settings: {
          ...settingsContent,
          toggles: settingsContent.toggles.map((toggle) =>
            toggle.id === toggleId ? { ...toggle, enabled } : toggle,
          ),
        },
      });
    },
    [settingsContent, updateRuntime],
  );

  const handleRiskSelect = useCallback(
    async (riskId: string) => {
      if (!settingsContent) return;

      await updateRuntime({
        settings: {
          ...settingsContent,
          selectedRiskId: riskId,
        },
      });
    },
    [settingsContent, updateRuntime],
  );

  const handleDailyLimitChange = useCallback(
    async (field: 'dailyProfitTarget' | 'dailyLossLimit', value: number) => {
      if (!settingsContent) return;
      await updateRuntime({
        settings: {
          ...settingsContent,
          [field]: value,
        },
      });
    },
    [settingsContent, updateRuntime],
  );

  const handleSettingsSave = useCallback(async () => {
    if (settingsContent) {
      await updateRuntime({ settings: settingsContent });
    }
    sheets.closeSheet();
  }, [settingsContent, sheets.closeSheet, updateRuntime]);

  // Sync from runtime only when the persisted amount id changes — not on every
  // home poll (tradeAmount object identity changes every few seconds).
  useEffect(() => {
    if (!tradeAmount?.selectedId) return;
    setTradeAmountValue(tradeAmount.selectedId.replace('amount-', ''));
  }, [tradeAmount?.selectedId]);

  const parsedTradeAmount = useMemo(() => {
    const n = Number(tradeAmountValue);
    if (!Number.isFinite(n)) return null;
    const rounded = Math.floor(n);
    if (rounded <= 0) return null;
    return rounded;
  }, [tradeAmountValue]);

  const tradeAmountError = useMemo(() => {
    if (!tradeAmountValue.trim()) return t('home.tradeAmount.invalid');
    return parsedTradeAmount == null ? t('home.tradeAmount.invalid') : null;
  }, [parsedTradeAmount, t, tradeAmountValue]);

  const runtimeDraft = useMemo(
    () =>
      parsedTradeAmount == null
        ? null
        : {
            tradeAmountId: `amount-${parsedTradeAmount}`,
            settings: settingsContent,
          },
    [parsedTradeAmount, settingsContent],
  );

  const footerControls = useMemo(() => data?.controls.filter((action) => action === 'pause' || action === 'stop') ?? [], [data?.controls]);

  const handleSave = useCallback(() => {
    if (!runtimeDraft) return;
    void botControls.handleApply(runtimeDraft);
  }, [botControls, runtimeDraft]);

  const handleStart = useCallback(() => {
    if (!runtimeDraft) return;
    void botControls.handleStart(runtimeDraft);
  }, [botControls, runtimeDraft]);

  if (
    !data ||
    !botEngine ||
    !tradeAmount ||
    !marketTypeContent ||
    !tradingPairContent ||
    !technicalIndicatorContent ||
    !strategyContent ||
    !settingsContent
  ) {
    return (
      <main className={styles.page} aria-label={t('home.aria')} aria-busy="true">
        <div className={styles.scroll}>
          <BackgroundGlow variant="top-right" />
          <PageContent className={styles.content}>
            <p className={styles.loading}>{t('home.loading')}</p>
          </PageContent>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className={styles.page} aria-label={t('home.aria')}>
        <div className={styles.scroll}>
          <BackgroundGlow variant="top-right" />
          <PageContent className={styles.content}>
            <div className={styles.heroStack}>
              <HomeHeaderSection content={data.header} />
              <BotEngineSection content={botEngine} />
              <HomeStatsSection stats={data.stats} points={data.performancePoints} />
            </div>

            <section className={styles.surface} aria-label={t('home.layout.setupTitle')}>
              <div className={styles.surfaceHeader}>
                <Text variant="h3" tone="body">
                  {t('home.layout.setupTitle')}
                </Text>
                <Text variant="caption" tone="caption" className={styles.surfaceCopy}>
                  {t('home.layout.setupSubtitle')}
                </Text>
              </div>

              <HomeConfigSection rows={configRows} onRowClick={sheets.openSheet} />

              <TradeAmountSection
                content={tradeAmount}
                value={tradeAmountValue}
                error={tradeAmountError}
                onValueChange={setTradeAmountValue}
              />
            </section>

            <section className={styles.surface} aria-label={t('home.layout.riskTitle')}>
              <div className={styles.surfaceHeader}>
                <Text variant="h3" tone="body">
                  {t('home.layout.riskTitle')}
                </Text>
                <Text variant="caption" tone="caption" className={styles.surfaceCopy}>
                  {t('home.layout.riskSubtitle')}
                </Text>
              </div>
              <RiskLimitsSection
                limits={data.riskLimits}
                profitTarget={settingsContent.dailyProfitTarget}
                lossLimit={settingsContent.dailyLossLimit}
                onLimitChange={handleDailyLimitChange}
              />
              <HomeActionsSection actions={data.actions} onAction={sheets.openSheet} />
            </section>

            <section className={styles.footerPanel} aria-label={t('home.layout.actionsTitle')}>
              <div className={styles.footerHeader}>
                <Text variant="h3" tone="body">
                  {t('home.layout.actionsTitle')}
                </Text>
                <Text variant="caption" tone="caption" className={styles.surfaceCopy}>
                  {t('home.layout.actionsSubtitle')}
                </Text>
              </div>

              <BotControlsSection
                controls={footerControls}
                isStartPressed={botControls.isStartPressed}
                onStart={botControls.handleStart}
                onPause={botControls.handlePause}
                onStop={botControls.handleStop}
                onApply={botControls.handleApply}
                isUpdating={botControls.isUpdating}
                feedback={null}
                comingSoon={false}
              />

              <div className={styles.footerButtons}>
                <Button
                  variant="ghost"
                  fullWidth
                  className={styles.footerButton}
                  disabled={botControls.isUpdating || Boolean(tradeAmountError)}
                  onClick={handleSave}
                >
                  {t('home.settings.save')}
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  className={styles.footerButton}
                  disabled={botControls.isUpdating || Boolean(tradeAmountError)}
                  onClick={handleStart}
                >
                  {t('home.controls.start')}
                </Button>
              </div>

              {botControls.feedback ? (
                <Text
                  variant="caption-xs"
                  tone={botControls.feedback.tone}
                  className={styles.feedback}
                  aria-live="polite"
                >
                  {botControls.feedback.message}
                </Text>
              ) : null}
            </section>
          </PageContent>
        </div>
      </main>

      <BottomSheet
        open={sheets.activeSheet === 'chart'}
        title={chartTitle}
        onClose={sheets.closeSheet}
      >
        <ChartSheetContent content={data.sheets.chart} />
      </BottomSheet>

      <BottomSheet
        open={sheets.activeSheet === 'settings'}
        title={sheetTitles.settings}
        onClose={sheets.closeSheet}
      >
        <BotSettingsSheetContent
          content={settingsContent}
          onToggleChange={handleSettingsToggle}
          onRiskSelect={handleRiskSelect}
          onDailyLimitChange={handleDailyLimitChange}
          onSave={handleSettingsSave}
        />
      </BottomSheet>

      <BottomSheet
        open={sheets.activeSheet === 'marketType'}
        title={sheetTitles.marketType}
        onClose={sheets.closeSheet}
      >
        <MarketTypeSheetContent content={marketTypeContent} onSelect={handleMarketTypeSelect} />
      </BottomSheet>

      <BottomSheet
        open={sheets.activeSheet === 'tradingPair'}
        title={sheetTitles.tradingPair}
        onClose={sheets.closeSheet}
      >
        <TradingPairSheetContent
          content={tradingPairContent}
          searchQuery={pairSearchQuery}
          onSearchChange={setPairSearchQuery}
          filteredOptions={filteredPairOptions}
          onSelect={handleTradingPairSelect}
          onSelectAll={handleTradingPairSelectAll}
          onClearAll={handleTradingPairClearAll}
        />
      </BottomSheet>

      <BottomSheet
        open={sheets.activeSheet === 'technicalIndicator'}
        title={sheetTitles.technicalIndicator}
        onClose={sheets.closeSheet}
      >
        <TechnicalIndicatorSheetContent
          content={technicalIndicatorContent}
          onSelect={handleTechnicalIndicatorSelect}
        />
      </BottomSheet>

      <BottomSheet
        open={sheets.activeSheet === 'strategy'}
        title={sheetTitles.strategy}
        onClose={sheets.closeSheet}
      >
        <StrategySheetContent content={strategyContent} onSelect={handleStrategySelect} />
      </BottomSheet>
    </>
  );
}
