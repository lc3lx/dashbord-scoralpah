import { useCallback, useMemo, useState } from 'react';
import { PageContent } from '@components/layouts/PageContent';
import { BackgroundGlow } from '@components/organisms/BackgroundGlow';
import { BottomSheet } from '@components/organisms/BottomSheet';
import { useT } from '@shared/i18n';
import { getHomeSheetTitles } from './data/home.mock';
import { resolveChartSheetTitle } from './utils/chartTitle';
import { useHomeBotControls } from './hooks/useHomeBotControls';
import { useHomeData } from './hooks/useHomeData';
import { useHomeSheets } from './hooks/useHomeSheets';
import { BotControlsSection } from './sections/BotControlsSection';
import { BotEngineSection } from './sections/BotEngineSection';
import { DurationSection } from './sections/DurationSection';
import { HomeActionsSection } from './sections/HomeActionsSection';
import { HomeConfigSection } from './sections/HomeConfigSection';
import { HomeDisclaimerSection } from './sections/HomeDisclaimerSection';
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

  const { data, configRows, tradeAmount, duration, updateRuntime } = homeData;

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

    return {
      ...data.sheets.tradingPair,
      selectedId: data.runtime.tradingPairId,
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
    if (!data || !duration || !tradingPairContent) return '';

    const pairLabel =
      tradingPairContent.options.find((option) => option.id === tradingPairContent.selectedId)
        ?.title ?? '';

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
      await updateRuntime({ tradingPairId: optionId });
      setPairSearchQuery('');
      sheets.closeSheet();
    },
    [sheets.closeSheet, updateRuntime],
  );

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

  const handleSettingsSave = useCallback(() => {
    sheets.closeSheet();
  }, [sheets.closeSheet]);

  if (
    !data ||
    !botEngine ||
    !tradeAmount ||
    !duration ||
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
            <HomeHeaderSection content={data.header} />
            <BotEngineSection content={botEngine} />
            <HomeStatsSection stats={data.stats} />
            <BotControlsSection
              controls={data.controls}
              isStartPressed={botControls.isStartPressed}
              onStart={botControls.handleStart}
              onPause={botControls.handlePause}
              onStop={botControls.handleStop}
              onApply={botControls.handleApply}
              isUpdating={botControls.isUpdating}
              comingSoon={false}
            />
            <HomeConfigSection rows={configRows} onRowClick={sheets.openSheet} />
            <TradeAmountSection
              content={tradeAmount}
              onSelect={(optionId) => {
                void updateRuntime({ tradeAmountId: optionId });
              }}
            />
            <DurationSection
              content={duration}
              onSelect={(optionId) => {
                void updateRuntime({ durationId: optionId });
              }}
            />
            <RiskLimitsSection limits={data.riskLimits} />
            <HomeActionsSection actions={data.actions} onAction={sheets.openSheet} />
            <HomeDisclaimerSection text={data.disclaimer} />
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
