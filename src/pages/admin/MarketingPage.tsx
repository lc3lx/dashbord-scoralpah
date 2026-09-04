import { useCallback, useEffect, useState } from 'react';
import { adminApi, ApiClientError } from '@shared/api';
import type {
  MarketingDemoConfigDto,
  MarketingDemoTradeSeedDto,
  MarketingDemoUserDto,
} from '@shared/api/types';
import styles from './admin.module.css';

const EMPTY_CONFIG: MarketingDemoConfigDto = {
  balance: 12450,
  balanceWobble: 28,
  totalProfit: 3200,
  totalLoss: 1100,
  winRatePercent: 76,
  historyTradeCount: 40,
  defaultTradeAmount: 25,
  includeRunningTrade: true,
  planName: 'Pro (marketing demo)',
  sampleTrades: [],
};

const EMPTY_TRADE: MarketingDemoTradeSeedDto = {
  asset: 'EURUSD',
  direction: 'CALL',
  amount: 25,
  status: 'Profit',
  pnl: 20,
  durationSeconds: 60,
  minutesAgo: 5,
};

function configFromUser(user: MarketingDemoUserDto): MarketingDemoConfigDto {
  return {
    ...EMPTY_CONFIG,
    ...user.config,
    sampleTrades: user.config.sampleTrades ? [...user.config.sampleTrades] : [],
  };
}

export default function MarketingPage() {
  const [activeFilter, setActiveFilter] = useState<'true' | 'false' | 'all'>('true');
  const [items, setItems] = useState<MarketingDemoUserDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [telegramUserId, setTelegramUserId] = useState('');
  const [createConfig, setCreateConfig] = useState<MarketingDemoConfigDto>({ ...EMPTY_CONFIG });

  const [editId, setEditId] = useState<string | null>(null);
  const [editConfig, setEditConfig] = useState<MarketingDemoConfigDto>({ ...EMPTY_CONFIG });
  const [linkTg, setLinkTg] = useState('');

  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listDemoUsers({ active: activeFilter, page, pageSize });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load demos');
    } finally {
      setLoading(false);
    }
  }, [activeFilter, page]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createDemo() {
    setError(null);
    setMessage(null);
    try {
      const tg = telegramUserId.trim() ? Number(telegramUserId.trim()) : undefined;
      await adminApi.createDemoUser({
        email: email.trim() || undefined,
        password: password || undefined,
        fullName: fullName.trim() || undefined,
        telegramUserId: tg && Number.isFinite(tg) ? tg : undefined,
        config: createConfig,
      });
      setMessage('Demo account created / promoted');
      setEmail('');
      setPassword('');
      setFullName('');
      setTelegramUserId('');
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Create failed');
    }
  }

  async function saveConfig() {
    if (!editId) return;
    setError(null);
    try {
      await adminApi.updateDemoConfig(editId, editConfig);
      setMessage('Config saved');
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Save failed');
    }
  }

  async function toggleDemo(user: MarketingDemoUserDto, enable: boolean) {
    setError(null);
    try {
      await adminApi.setDemoUser(user.id, enable);
      setMessage(enable ? 'Demo re-enabled' : 'Demo disabled');
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Update failed');
    }
  }

  async function linkTelegram(userId: string) {
    const tg = Number(linkTg.trim());
    if (!Number.isFinite(tg) || tg <= 0) {
      setError('Enter a valid Telegram user id');
      return;
    }
    try {
      await adminApi.setDemoUser(userId, true, tg);
      setMessage('Telegram linked');
      setLinkTg('');
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Link failed');
    }
  }

  function renderConfigFields(
    config: MarketingDemoConfigDto,
    setConfig: (c: MarketingDemoConfigDto) => void,
  ) {
    const num = (key: keyof MarketingDemoConfigDto, label: string) => (
      <label className={styles.label} key={String(key)}>
        {label}
        <input
          className={styles.input}
          type="number"
          value={Number(config[key] ?? 0)}
          onChange={(e) => setConfig({ ...config, [key]: Number(e.target.value) })}
        />
      </label>
    );

    const trades = config.sampleTrades ?? [];

    return (
      <>
        <div className={styles.grid2}>
          {num('balance', 'Balance')}
          {num('balanceWobble', 'Balance wobble')}
          {num('totalProfit', 'Total profit')}
          {num('totalLoss', 'Total loss')}
          {num('winRatePercent', 'Win rate %')}
          {num('historyTradeCount', 'History trade count')}
          {num('defaultTradeAmount', 'Default trade amount')}
          <label className={styles.label}>
            Plan name
            <input
              className={styles.input}
              value={config.planName ?? ''}
              onChange={(e) => setConfig({ ...config, planName: e.target.value })}
            />
          </label>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={Boolean(config.includeRunningTrade)}
              onChange={(e) => setConfig({ ...config, includeRunningTrade: e.target.checked })}
            />
            Include running trade
          </label>
        </div>

        <h4 style={{ marginTop: 16 }}>Sample trades (optional — overrides generated history)</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Dir</th>
                <th>Amount</th>
                <th>Status</th>
                <th>PnL</th>
                <th>Dur(s)</th>
                <th>Min ago</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {trades.map((trade, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      className={styles.input}
                      value={trade.asset}
                      onChange={(e) => {
                        const next = [...trades];
                        next[idx] = { ...trade, asset: e.target.value };
                        setConfig({ ...config, sampleTrades: next });
                      }}
                    />
                  </td>
                  <td>
                    <select
                      className={styles.select}
                      value={trade.direction}
                      onChange={(e) => {
                        const next = [...trades];
                        next[idx] = { ...trade, direction: e.target.value };
                        setConfig({ ...config, sampleTrades: next });
                      }}
                    >
                      <option value="CALL">CALL</option>
                      <option value="PUT">PUT</option>
                    </select>
                  </td>
                  <td>
                    <input
                      className={styles.input}
                      type="number"
                      value={trade.amount}
                      onChange={(e) => {
                        const next = [...trades];
                        next[idx] = { ...trade, amount: Number(e.target.value) };
                        setConfig({ ...config, sampleTrades: next });
                      }}
                    />
                  </td>
                  <td>
                    <select
                      className={styles.select}
                      value={trade.status}
                      onChange={(e) => {
                        const next = [...trades];
                        next[idx] = { ...trade, status: e.target.value };
                        setConfig({ ...config, sampleTrades: next });
                      }}
                    >
                      {['Profit', 'Loss', 'Tie', 'Running', 'Pending'].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      className={styles.input}
                      type="number"
                      value={trade.pnl ?? 0}
                      onChange={(e) => {
                        const next = [...trades];
                        next[idx] = { ...trade, pnl: Number(e.target.value) };
                        setConfig({ ...config, sampleTrades: next });
                      }}
                    />
                  </td>
                  <td>
                    <input
                      className={styles.input}
                      type="number"
                      value={trade.durationSeconds ?? 60}
                      onChange={(e) => {
                        const next = [...trades];
                        next[idx] = { ...trade, durationSeconds: Number(e.target.value) };
                        setConfig({ ...config, sampleTrades: next });
                      }}
                    />
                  </td>
                  <td>
                    <input
                      className={styles.input}
                      type="number"
                      value={trade.minutesAgo ?? 0}
                      onChange={(e) => {
                        const next = [...trades];
                        next[idx] = { ...trade, minutesAgo: Number(e.target.value) };
                        setConfig({ ...config, sampleTrades: next });
                      }}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnDanger}`}
                      onClick={() => {
                        const next = trades.filter((_, i) => i !== idx);
                        setConfig({ ...config, sampleTrades: next });
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnSecondary}`}
          style={{ marginTop: 8 }}
          onClick={() =>
            setConfig({ ...config, sampleTrades: [...trades, { ...EMPTY_TRADE }] })
          }
        >
          Add sample trade
        </button>
      </>
    );
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <h1 className={styles.pageTitle}>Marketing demos</h1>
      <p className={styles.pageSub}>
        Fake live accounts for the Telegram bot — no Binolla. Admin sets profits, losses, and sample trades.
      </p>

      {error ? <p className={styles.error}>{error}</p> : null}
      {message ? <p className={styles.muted}>{message}</p> : null}

      <div className={styles.panel}>
        <h3>Create / promote demo</h3>
        <div className={styles.grid2}>
          <label className={styles.label}>
            Telegram user id (recommended for bot)
            <input className={styles.input} value={telegramUserId} onChange={(e) => setTelegramUserId(e.target.value)} />
          </label>
          <label className={styles.label}>
            Email (optional)
            <input className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className={styles.label}>
            Password (≥8 if email)
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <label className={styles.label}>
            Full name
            <input className={styles.input} value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>
        </div>
        {renderConfigFields(createConfig, setCreateConfig)}
        <button type="button" className={styles.btn} style={{ marginTop: 12 }} onClick={() => void createDemo()}>
          Create demo
        </button>
      </div>

      <div className={styles.toolbar}>
        <select
          className={styles.select}
          value={activeFilter}
          onChange={(e) => {
            setPage(1);
            setActiveFilter(e.target.value as 'true' | 'false' | 'all');
          }}
        >
          <option value="true">Active</option>
          <option value="false">Disabled</option>
          <option value="all">All</option>
        </select>
        <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => void load()}>
          Refresh
        </button>
      </div>

      {loading ? <p className={styles.muted}>Loading…</p> : null}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Telegram</th>
              <th>Balance</th>
              <th>P/L</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((user) => (
              <tr key={user.id}>
                <td>
                  <div>{user.fullName || user.email || user.id.slice(0, 8)}</div>
                  <div className={styles.muted}>{user.email}</div>
                </td>
                <td>{user.telegramUserId ?? '—'}</td>
                <td>{user.config.balance}</td>
                <td>
                  +{user.config.totalProfit} / -{user.config.totalLoss}
                </td>
                <td>
                  <span className={`${styles.badge} ${user.isMarketingDemo ? styles.badgeOk : styles.badgeBad}`}>
                    {user.isMarketingDemo ? 'Active' : 'Off'}
                  </span>
                </td>
                <td className={styles.rowActions}>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={() => {
                      setEditId(user.id);
                      setEditConfig(configFromUser(user));
                      setLinkTg(user.telegramUserId?.toString() ?? '');
                    }}
                  >
                    Edit
                  </button>
                  {user.isMarketingDemo ? (
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnDanger}`}
                      onClick={() => void toggleDemo(user, false)}
                    >
                      Disable
                    </button>
                  ) : (
                    <button type="button" className={styles.btn} onClick={() => void toggleDemo(user, true)}>
                      Enable
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pager}>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnSecondary}`}
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>
        <span className={styles.muted}>
          Page {page} / {pages} · {total} total
        </span>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnSecondary}`}
          disabled={page >= pages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {editId ? (
        <div className={styles.panel} style={{ marginTop: 16 }}>
          <h3>Edit demo config · {editId.slice(0, 8)}…</h3>
          <div className={styles.toolbar}>
            <input
              className={styles.input}
              placeholder="Telegram user id"
              value={linkTg}
              onChange={(e) => setLinkTg(e.target.value)}
            />
            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => void linkTelegram(editId)}>
              Link Telegram
            </button>
          </div>
          {renderConfigFields(editConfig, setEditConfig)}
          <div className={styles.toolbar} style={{ marginTop: 12 }}>
            <button type="button" className={styles.btn} onClick={() => void saveConfig()}>
              Save values
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setEditId(null)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
