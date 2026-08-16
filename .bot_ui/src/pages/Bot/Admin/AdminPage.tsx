import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContent } from '@components/layouts/PageContent';
import { BackgroundGlow } from '@components/organisms/BackgroundGlow';
import { PageHeader } from '@components/organisms/PageHeader';
import { OptionChip } from '@components/molecules/OptionChip';
import { Button } from '@components/atoms/Button';
import { Chip } from '@components/atoms/Chip';
import { Input } from '@components/atoms/Input';
import { Text } from '@components/atoms/Text';
import { ROUTES } from '@constants/routes';
import {
  adminApi,
  ApiClientError,
  meApi,
  type AdminBinollaAccountDto,
  type MarketingDemoConfigDto,
  type MarketingDemoUserDto,
} from '@shared/api';
import { useT } from '@shared/i18n';
import styles from './AdminPage.module.css';

type FilterStatus = 'Pending' | 'Approved' | 'Rejected';
type AdminTab = 'approvals' | 'demos';

type DemoConfigForm = {
  balance: string;
  balanceWobble: string;
  totalProfit: string;
  totalLoss: string;
  winRatePercent: string;
  historyTradeCount: string;
  defaultTradeAmount: string;
  includeRunningTrade: boolean;
  planName: string;
};

const DEFAULT_CONFIG_FORM: DemoConfigForm = {
  balance: '12450',
  balanceWobble: '28',
  totalProfit: '3200',
  totalLoss: '1100',
  winRatePercent: '62',
  historyTradeCount: '40',
  defaultTradeAmount: '25',
  includeRunningTrade: true,
  planName: '',
};

function formatWhen(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function configToForm(config?: MarketingDemoConfigDto | null): DemoConfigForm {
  return {
    balance: String(config?.balance ?? 12450),
    balanceWobble: String(config?.balanceWobble ?? 28),
    totalProfit: String(config?.totalProfit ?? 3200),
    totalLoss: String(config?.totalLoss ?? 1100),
    winRatePercent: String(config?.winRatePercent ?? 62),
    historyTradeCount: String(config?.historyTradeCount ?? 40),
    defaultTradeAmount: String(config?.defaultTradeAmount ?? 25),
    includeRunningTrade: config?.includeRunningTrade ?? true,
    planName: config?.planName ?? '',
  };
}

function parsePositiveNumber(raw: string, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function formToConfig(form: DemoConfigForm): MarketingDemoConfigDto {
  return {
    balance: parsePositiveNumber(form.balance, 12450),
    balanceWobble: parsePositiveNumber(form.balanceWobble, 28),
    totalProfit: parsePositiveNumber(form.totalProfit, 3200),
    totalLoss: parsePositiveNumber(form.totalLoss, 1100),
    winRatePercent: parsePositiveNumber(form.winRatePercent, 62),
    historyTradeCount: Math.max(1, Math.round(parsePositiveNumber(form.historyTradeCount, 40))),
    defaultTradeAmount: parsePositiveNumber(form.defaultTradeAmount, 25),
    includeRunningTrade: form.includeRunningTrade,
    planName: form.planName.trim() || null,
  };
}

function DemoConfigFields({
  form,
  onChange,
  idPrefix,
}: {
  form: DemoConfigForm;
  onChange: (next: DemoConfigForm) => void;
  idPrefix: string;
}) {
  const t = useT();
  const set = (patch: Partial<DemoConfigForm>) => onChange({ ...form, ...patch });

  return (
    <div className={styles.configGrid}>
      <Input
        type="number"
        inputMode="decimal"
        autoComplete="off"
        placeholder={t('admin.demo.config.balance')}
        aria-label={t('admin.demo.config.balance')}
        value={form.balance}
        onChange={(event) => set({ balance: event.target.value })}
      />
      <Input
        type="number"
        inputMode="decimal"
        autoComplete="off"
        placeholder={t('admin.demo.config.wobble')}
        aria-label={t('admin.demo.config.wobble')}
        value={form.balanceWobble}
        onChange={(event) => set({ balanceWobble: event.target.value })}
      />
      <Input
        type="number"
        inputMode="decimal"
        autoComplete="off"
        placeholder={t('admin.demo.config.profit')}
        aria-label={t('admin.demo.config.profit')}
        value={form.totalProfit}
        onChange={(event) => set({ totalProfit: event.target.value })}
      />
      <Input
        type="number"
        inputMode="decimal"
        autoComplete="off"
        placeholder={t('admin.demo.config.loss')}
        aria-label={t('admin.demo.config.loss')}
        value={form.totalLoss}
        onChange={(event) => set({ totalLoss: event.target.value })}
      />
      <Input
        type="number"
        inputMode="decimal"
        autoComplete="off"
        placeholder={t('admin.demo.config.winRate')}
        aria-label={t('admin.demo.config.winRate')}
        value={form.winRatePercent}
        onChange={(event) => set({ winRatePercent: event.target.value })}
      />
      <Input
        type="number"
        inputMode="numeric"
        autoComplete="off"
        placeholder={t('admin.demo.config.tradeCount')}
        aria-label={t('admin.demo.config.tradeCount')}
        value={form.historyTradeCount}
        onChange={(event) => set({ historyTradeCount: event.target.value })}
      />
      <Input
        type="number"
        inputMode="decimal"
        autoComplete="off"
        placeholder={t('admin.demo.config.tradeAmount')}
        aria-label={t('admin.demo.config.tradeAmount')}
        value={form.defaultTradeAmount}
        onChange={(event) => set({ defaultTradeAmount: event.target.value })}
      />
      <Input
        type="text"
        autoComplete="off"
        placeholder={t('admin.demo.config.planName')}
        aria-label={t('admin.demo.config.planName')}
        value={form.planName}
        onChange={(event) => set({ planName: event.target.value })}
      />
      <label className={styles.checkRow} htmlFor={`${idPrefix}-running`}>
        <input
          id={`${idPrefix}-running`}
          type="checkbox"
          checked={form.includeRunningTrade}
          onChange={(event) => set({ includeRunningTrade: event.target.checked })}
        />
        <span>{t('admin.demo.config.runningTrade')}</span>
      </label>
    </div>
  );
}

export default function AdminPage() {
  const t = useT();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>('approvals');
  const [filter, setFilter] = useState<FilterStatus>('Pending');
  const [items, setItems] = useState<AdminBinollaAccountDto[]>([]);
  const [demoItems, setDemoItems] = useState<MarketingDemoUserDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoEmail, setDemoEmail] = useState('');
  const [demoPassword, setDemoPassword] = useState('');
  const [demoFullName, setDemoFullName] = useState('');
  const [demoTelegramUserId, setDemoTelegramUserId] = useState('');
  const [createConfig, setCreateConfig] = useState<DemoConfigForm>(DEFAULT_CONFIG_FORM);
  const [editConfigById, setEditConfigById] = useState<Record<string, DemoConfigForm>>({});
  const [linkTelegramById, setLinkTelegramById] = useState<Record<string, string>>({});
  const [creatingDemo, setCreatingDemo] = useState(false);

  const filterLabels: Record<FilterStatus, string> = {
    Pending: t('admin.filter.pending'),
    Approved: t('admin.filter.approved'),
    Rejected: t('admin.filter.rejected'),
  };

  const ensureAdmin = useCallback(async () => {
    const me = await meApi.get();
    if (!me.isAdmin) {
      setError(t('admin.accessRequired'));
      navigate(ROUTES.settings, { replace: true });
      return false;
    }
    return true;
  }, [navigate, t]);

  const loadApprovals = useCallback(
    async (status: FilterStatus) => {
      setLoading(true);
      setError(null);
      try {
        if (!(await ensureAdmin())) {
          setItems([]);
          return;
        }
        const response = await adminApi.listAccounts(status);
        setItems(response.items);
      } catch (err) {
        const message =
          err instanceof ApiClientError ? err.message : t('admin.loadFailed');
        setError(message);
        setItems([]);
        if (err instanceof ApiClientError && (err.status === 403 || err.code === 'FORBIDDEN')) {
          navigate(ROUTES.settings, { replace: true });
        }
      } finally {
        setLoading(false);
      }
    },
    [ensureAdmin, navigate, t],
  );

  const loadDemos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!(await ensureAdmin())) {
        setDemoItems([]);
        return;
      }
      const response = await adminApi.listDemoUsers();
      setDemoItems(response.items);
      setEditConfigById((prev) => {
        const next: Record<string, DemoConfigForm> = {};
        for (const demo of response.items) {
          next[demo.id] = prev[demo.id] ?? configToForm(demo.config);
        }
        return next;
      });
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('admin.demo.loadFailed');
      setError(message);
      setDemoItems([]);
      if (err instanceof ApiClientError && (err.status === 403 || err.code === 'FORBIDDEN')) {
        navigate(ROUTES.settings, { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [ensureAdmin, navigate, t]);

  useEffect(() => {
    if (tab === 'approvals') {
      void loadApprovals(filter);
    } else {
      void loadDemos();
    }
  }, [tab, filter, loadApprovals, loadDemos]);

  const handleApprove = useCallback(
    async (id: string) => {
      setBusyId(id);
      setError(null);
      try {
        await adminApi.approve(id);
        await loadApprovals(filter);
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : t('admin.approveFailed'));
      } finally {
        setBusyId(null);
      }
    },
    [filter, loadApprovals, t],
  );

  const handleReject = useCallback(
    async (id: string) => {
      setBusyId(id);
      setError(null);
      try {
        await adminApi.reject(id);
        await loadApprovals(filter);
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : t('admin.rejectFailed'));
      } finally {
        setBusyId(null);
      }
    },
    [filter, loadApprovals, t],
  );

  const handleCreateDemo = useCallback(async () => {
    setCreatingDemo(true);
    setError(null);
    try {
      const telegramRaw = demoTelegramUserId.trim();
      const telegramUserId = telegramRaw ? Number(telegramRaw) : undefined;
      if (telegramRaw && (!Number.isFinite(telegramUserId) || telegramUserId! <= 0)) {
        setError(t('admin.demo.createFailed'));
        return;
      }
      const email = demoEmail.trim();
      if (!email && !telegramUserId) {
        setError(t('admin.demo.createFailed'));
        return;
      }
      if (email && demoPassword.length < 8) {
        setError(t('admin.demo.createFailed'));
        return;
      }
      await adminApi.createDemoUser({
        ...(email ? { email, password: demoPassword } : {}),
        fullName: demoFullName.trim() || undefined,
        ...(telegramUserId ? { telegramUserId } : {}),
        config: formToConfig(createConfig),
      });
      setDemoEmail('');
      setDemoPassword('');
      setDemoFullName('');
      setDemoTelegramUserId('');
      setCreateConfig(DEFAULT_CONFIG_FORM);
      await loadDemos();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('admin.demo.createFailed'));
    } finally {
      setCreatingDemo(false);
    }
  }, [
    createConfig,
    demoEmail,
    demoFullName,
    demoPassword,
    demoTelegramUserId,
    loadDemos,
    t,
  ]);

  const handleDisableDemo = useCallback(
    async (id: string) => {
      setBusyId(id);
      setError(null);
      try {
        await adminApi.setDemoUser(id, false);
        await loadDemos();
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : t('admin.demo.disableFailed'));
      } finally {
        setBusyId(null);
      }
    },
    [loadDemos, t],
  );

  const handleSaveConfig = useCallback(
    async (id: string) => {
      const form = editConfigById[id];
      if (!form) return;
      setBusyId(id);
      setError(null);
      try {
        await adminApi.updateDemoConfig(id, formToConfig(form));
        await loadDemos();
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : t('admin.demo.config.saveFailed'));
      } finally {
        setBusyId(null);
      }
    },
    [editConfigById, loadDemos, t],
  );

  const handleLinkTelegram = useCallback(
    async (id: string) => {
      const raw = (linkTelegramById[id] ?? '').trim();
      const telegramUserId = Number(raw);
      if (!Number.isFinite(telegramUserId) || telegramUserId <= 0) {
        setError(t('admin.demo.linkTelegramFailed'));
        return;
      }
      setBusyId(id);
      setError(null);
      try {
        await adminApi.setDemoUser(id, true, telegramUserId);
        setLinkTelegramById((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        await loadDemos();
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : t('admin.demo.linkTelegramFailed'));
      } finally {
        setBusyId(null);
      }
    },
    [linkTelegramById, loadDemos, t],
  );

  const formatApprovalStatus = (status: string): string => {
    if (status === 'Pending') return t('admin.filter.pending');
    if (status === 'Approved') return t('admin.filter.approved');
    if (status === 'Rejected') return t('admin.filter.rejected');
    return status;
  };

  return (
    <main className={styles.page} aria-label={t('admin.title')}>
      <div className={styles.scroll}>
        <BackgroundGlow variant="top-right" />
        <PageContent className={styles.content}>
          <PageHeader title={t('admin.title')} onBack={() => navigate(-1)} />

          <div className={styles.filters} role="tablist" aria-label={t('admin.title')}>
            <OptionChip
              label={t('admin.tab.approvals')}
              selected={tab === 'approvals'}
              onSelect={() => setTab('approvals')}
            />
            <OptionChip
              label={t('admin.tab.demos')}
              selected={tab === 'demos'}
              onSelect={() => setTab('demos')}
            />
          </div>

          {tab === 'approvals' ? (
            <>
              <Text variant="caption" tone="caption" className={styles.intro}>
                {t('admin.intro')}
              </Text>

              <div className={styles.filters} role="tablist" aria-label={t('admin.tab.approvals')}>
                {(['Pending', 'Approved', 'Rejected'] as const).map((status) => (
                  <OptionChip
                    key={status}
                    label={filterLabels[status]}
                    selected={filter === status}
                    onSelect={() => setFilter(status)}
                  />
                ))}
              </div>
            </>
          ) : (
            <Text variant="caption" tone="caption" className={styles.intro}>
              {t('admin.demo.intro')}
            </Text>
          )}

          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}

          {tab === 'demos' ? (
            <form
              className={styles.demoForm}
              onSubmit={(event) => {
                event.preventDefault();
                void handleCreateDemo();
              }}
            >
              <Text variant="body" tone="body" className={styles.name}>
                {t('admin.demo.createTitle')}
              </Text>
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder={t('admin.demo.telegramUserId')}
                value={demoTelegramUserId}
                onChange={(event) => setDemoTelegramUserId(event.target.value)}
              />
              <Input
                type="email"
                autoComplete="off"
                placeholder={t('admin.demo.email')}
                value={demoEmail}
                onChange={(event) => setDemoEmail(event.target.value)}
              />
              <Input
                type="password"
                autoComplete="new-password"
                placeholder={t('admin.demo.password')}
                value={demoPassword}
                onChange={(event) => setDemoPassword(event.target.value)}
                minLength={8}
              />
              <Input
                type="text"
                autoComplete="off"
                placeholder={t('admin.demo.fullName')}
                value={demoFullName}
                onChange={(event) => setDemoFullName(event.target.value)}
              />
              <Text variant="caption" tone="caption">
                {t('admin.demo.config.title')}
              </Text>
              <DemoConfigFields
                idPrefix="create"
                form={createConfig}
                onChange={setCreateConfig}
              />
              <Button type="submit" variant="primary" disabled={creatingDemo}>
                {creatingDemo ? t('admin.demo.creating') : t('admin.demo.create')}
              </Button>
            </form>
          ) : null}

          {loading ? (
            <Text variant="caption" tone="caption">
              {t('admin.loading')}
            </Text>
          ) : tab === 'approvals' ? (
            items.length === 0 ? (
              <Text variant="caption" tone="caption" className={styles.empty}>
                {t('admin.empty', { filter: filterLabels[filter] })}
              </Text>
            ) : (
              <ul className={styles.list}>
                {items.map((account) => {
                  const displayName =
                    account.fullName?.trim() ||
                    (account.username ? `@${account.username.replace(/^@/, '')}` : t('common.user'));
                  const telegram = account.email
                    ? account.email
                    : account.username
                      ? `@${account.username.replace(/^@/, '')}`
                      : account.telegramUserId
                        ? String(account.telegramUserId)
                        : '—';

                  return (
                    <li key={account.id} className={styles.card}>
                      <div className={styles.cardHeader}>
                        <div className={styles.cardMeta}>
                          <Text variant="body" tone="body" className={styles.name}>
                            {displayName}
                          </Text>
                          <Text variant="caption-xs" tone="caption">
                            {t('admin.telegram')} {telegram}
                          </Text>
                          <Text variant="caption-xs" tone="caption">
                            {t('admin.binollaId')} {account.binollaAccountIdentifier ?? '—'}
                          </Text>
                          <Text variant="caption-xs" tone="caption">
                            {t('admin.linked')} {formatWhen(account.lastConnectedAt ?? account.createdAt)}
                          </Text>
                          {account.approvedAt ? (
                            <Text variant="caption-xs" tone="caption">
                              {t('admin.decision')} {formatWhen(account.approvedAt)}
                              {account.approvedBy ? ` · ${account.approvedBy}` : ''}
                            </Text>
                          ) : null}
                        </div>
                        <Chip
                          label={formatApprovalStatus(account.approvalStatus)}
                          tone={
                            account.approvalStatus === 'Approved'
                              ? 'success'
                              : account.approvalStatus === 'Rejected'
                                ? 'danger'
                                : 'warning'
                          }
                          style="outlined"
                        />
                      </div>

                      <div className={styles.actions}>
                        {account.approvalStatus !== 'Approved' ? (
                          <Button
                            variant="primary"
                            disabled={busyId === account.id}
                            onClick={() => void handleApprove(account.id)}
                          >
                            {t('admin.approve')}
                          </Button>
                        ) : null}
                        {account.approvalStatus !== 'Rejected' ? (
                          <Button
                            variant="ghost"
                            disabled={busyId === account.id}
                            onClick={() => void handleReject(account.id)}
                          >
                            {t('admin.reject')}
                          </Button>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )
          ) : demoItems.length === 0 ? (
            <Text variant="caption" tone="caption" className={styles.empty}>
              {t('admin.demo.empty')}
            </Text>
          ) : (
            <ul className={styles.list}>
              {demoItems.map((demo) => {
                const displayName =
                  demo.fullName?.trim() ||
                  (demo.username ? `@${demo.username.replace(/^@/, '')}` : t('common.user'));
                const editForm = editConfigById[demo.id] ?? configToForm(demo.config);
                return (
                  <li key={demo.id} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <div className={styles.cardMeta}>
                        <Text variant="body" tone="body" className={styles.name}>
                          {displayName}
                        </Text>
                        <Text variant="caption-xs" tone="caption">
                          {demo.email ?? '—'}
                        </Text>
                        <Text variant="caption-xs" tone="caption">
                          {t('admin.demo.telegram')}{' '}
                          {demo.telegramUserId != null
                            ? String(demo.telegramUserId)
                            : t('admin.demo.missingTelegram')}
                        </Text>
                        <Text variant="caption-xs" tone="caption">
                          {t('admin.demo.created')} {formatWhen(demo.createdAt)}
                        </Text>
                        <Text variant="caption-xs" tone="caption">
                          {t('admin.demo.config.summary', {
                            balance: String(demo.config?.balance ?? '—'),
                            profit: String(demo.config?.totalProfit ?? '—'),
                            loss: String(demo.config?.totalLoss ?? '—'),
                            winRate: String(demo.config?.winRatePercent ?? '—'),
                          })}
                        </Text>
                      </div>
                      <Chip
                        label={t('admin.demo.badge')}
                        tone="success"
                        style="outlined"
                      />
                    </div>
                    {demo.telegramUserId == null ? (
                      <div className={styles.actions}>
                        <Input
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          placeholder={t('admin.demo.linkTelegramPlaceholder')}
                          value={linkTelegramById[demo.id] ?? ''}
                          onChange={(event) =>
                            setLinkTelegramById((prev) => ({
                              ...prev,
                              [demo.id]: event.target.value,
                            }))
                          }
                        />
                        <Button
                          variant="primary"
                          disabled={busyId === demo.id}
                          onClick={() => void handleLinkTelegram(demo.id)}
                        >
                          {t('admin.demo.linkTelegram')}
                        </Button>
                      </div>
                    ) : null}
                    <Text variant="caption" tone="caption">
                      {t('admin.demo.config.editTitle')}
                    </Text>
                    <DemoConfigFields
                      idPrefix={`edit-${demo.id}`}
                      form={editForm}
                      onChange={(next) =>
                        setEditConfigById((prev) => ({ ...prev, [demo.id]: next }))
                      }
                    />
                    <div className={styles.actions}>
                      <Button
                        variant="primary"
                        disabled={busyId === demo.id}
                        onClick={() => void handleSaveConfig(demo.id)}
                      >
                        {t('admin.demo.config.save')}
                      </Button>
                      <Button
                        variant="ghost"
                        disabled={busyId === demo.id}
                        onClick={() => void handleDisableDemo(demo.id)}
                      >
                        {t('admin.demo.disable')}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </PageContent>
      </div>
    </main>
  );
}
