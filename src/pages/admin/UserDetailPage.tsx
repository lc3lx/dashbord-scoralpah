import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminApi, ApiClientError } from '@shared/api';
import type {
  AdminAuditEventDto,
  AdminBotRuntimeDto,
  AdminUserDetailDto,
} from '@shared/api/types';
import { ROUTES } from '@constants/routes';
import styles from './admin.module.css';

export default function UserDetailPage() {
  const { userId = '' } = useParams();
  const [user, setUser] = useState<AdminUserDetailDto | null>(null);
  const [audit, setAudit] = useState<AdminAuditEventDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tg, setTg] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [bot, setBot] = useState<AdminBotRuntimeDto | null>(null);
  const [botStrategy, setBotStrategy] = useState('');
  const [botProfit, setBotProfit] = useState('');
  const [botLoss, setBotLoss] = useState('');
  const [botBusy, setBotBusy] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setError(null);
    try {
      const [detail, auditRes] = await Promise.all([
        adminApi.getUser(userId),
        adminApi.listAudit({ userId, page: 1, pageSize: 20 }),
      ]);
      // #region agent log
      const ba = detail.binollaAccount as Record<string, unknown> | null;
      fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '281dcf' },
        body: JSON.stringify({
          sessionId: '281dcf',
          runId: 'pre-fix',
          hypothesisId: 'C',
          location: 'UserDetailPage.tsx:load',
          message: 'admin_user_detail_credentials',
          data: {
            userId,
            hasBinollaAccount: Boolean(ba),
            binollaKeys: ba ? Object.keys(ba) : [],
            hasBinollaLoginEmail: Boolean(ba && 'binollaLoginEmail' in ba),
            hasBinollaLoginPassword: Boolean(ba && 'binollaLoginPassword' in ba),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      setUser(detail);
      setTg(detail.telegramUserId?.toString() ?? '');
      setAudit(auditRes.items);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load user');
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!userId) return;
    void adminApi
      .getBot(userId)
      .then((value) => {
        setBot(value);
        // Seed the editors from the live runtime so an admin edits real numbers.
        setBotStrategy(value.strategyId ?? '');
        setBotProfit(String(value.dailyProfitTarget ?? ''));
        setBotLoss(String(value.dailyLossLimit ?? ''));
      })
      .catch(() => setBot(null));
  }, [userId]);

  async function setDemo(enable: boolean) {
    if (!userId) return;
    try {
      await adminApi.patchUser(userId, { isMarketingDemo: enable });
      setMessage(enable ? 'Marked as marketing demo' : 'Demo flag cleared');
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Update failed');
    }
  }

  /**
   * Unlocks or re-locks this user's Binolla DEMO balance.
   *
   * Everyone trades live by default; demo is only reachable once an admin turns it on
   * here. Separate from the marketing-demo flag above, which only changes what the app
   * displays and never touches which balance is traded.
   */
  async function setDemoAllowed(allow: boolean) {
    if (!userId) return;
    try {
      await adminApi.patchUser(userId, { demoAllowed: allow });
      setMessage(allow ? 'Demo balance unlocked' : 'Demo balance locked — user trades live');
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Update failed');
    }
  }

  /**
   * Runs a bot action on this user's behalf.
   *
   * `apply` edits settings on a bot that is already running; `start` needs at least one
   * pair, so it reuses whatever the user last selected. Strategy and the daily limits are
   * sent on both paths so an admin can correct them without asking the user to.
   */
  async function botAction(action: 'start' | 'pause' | 'stop' | 'apply') {
    if (!userId) return;
    setBotBusy(true);
    setError(null);
    try {
      const next = await adminApi.controlBot(userId, {
        action,
        strategyId: botStrategy || undefined,
        dailyProfitTarget: botProfit.trim() === '' ? undefined : Number(botProfit),
        dailyLossLimit: botLoss.trim() === '' ? undefined : Number(botLoss),
        assets: bot?.assets && bot.assets.length > 0 ? bot.assets : undefined,
      });
      setBot(next);
      setMessage(`Bot ${action} applied`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Bot action failed');
    } finally {
      setBotBusy(false);
    }
  }

  async function saveTelegram() {
    if (!userId) return;
    try {
      const n = Number(tg.trim());
      if (!Number.isFinite(n) || n <= 0) {
        await adminApi.patchUser(userId, { clearTelegramUserId: true });
      } else {
        await adminApi.patchUser(userId, { telegramUserId: n });
      }
      setMessage('Telegram updated');
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Telegram update failed');
    }
  }

  if (!user && !error) return <p className={styles.muted}>Loading…</p>;

  return (
    <div>
      <p>
        <Link className={styles.link} to={ROUTES.adminUsers}>
          ← Users
        </Link>
      </p>
      <h1 className={styles.pageTitle}>{user?.fullName || user?.email || 'User'}</h1>
      <p className={styles.pageSub}>{userId}</p>

      {error ? <p className={styles.error}>{error}</p> : null}
      {message ? <p className={styles.muted}>{message}</p> : null}

      {user ? (
        <>
          <div className={styles.panel}>
            <div className={styles.grid2}>
              <div>
                <div className={styles.muted}>Email</div>
                <div>{user.loginEmail || user.email || '—'}</div>
              </div>
              <div>
                <div className={styles.muted}>Password</div>
                <div>
                  <code style={{ userSelect: 'all' }}>{user.loginPassword || '—'}</code>
                </div>
              </div>
              <div>
                <div className={styles.muted}>Role</div>
                <div>{user.role}</div>
              </div>
              <div>
                <div className={styles.muted}>Marketing demo</div>
                <div>{user.isMarketingDemo ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <div className={styles.muted}>Binolla balance</div>
                <div>{user.demoAllowed ? 'Demo unlocked' : 'Live only'}</div>
              </div>
              <div>
                <div className={styles.muted}>Binolla</div>
                <div>
                  {user.binollaAccount
                    ? `${user.binollaAccount.approvalStatus} · ${user.binollaAccount.binollaAccountIdentifier ?? '—'}`
                    : 'Not linked'}
                </div>
              </div>
              {user.binollaAccount?.loginEmail || user.binollaAccount?.loginPassword ? (
                <div>
                  <div className={styles.muted}>Binolla login</div>
                  <div>
                    {user.binollaAccount.loginEmail || '—'}
                    {' · '}
                    <code style={{ userSelect: 'all' }}>{user.binollaAccount.loginPassword || '—'}</code>
                  </div>
                </div>
              ) : null}
            </div>

            <div className={styles.toolbar} style={{ marginTop: 12 }}>
              <input
                className={styles.input}
                placeholder="Telegram user id"
                value={tg}
                onChange={(e) => setTg(e.target.value)}
              />
              <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => void saveTelegram()}>
                Save Telegram
              </button>
              {!user.isAdmin ? (
                user.isMarketingDemo ? (
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnDanger}`}
                    onClick={() => void setDemo(false)}
                  >
                    Disable demo
                  </button>
                ) : (
                  <button type="button" className={styles.btn} onClick={() => void setDemo(true)}>
                    Make marketing demo
                  </button>
                )
              ) : null}
              {user.demoAllowed ? (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={() => void setDemoAllowed(false)}
                >
                  Lock demo balance
                </button>
              ) : (
                <button type="button" className={styles.btn} onClick={() => void setDemoAllowed(true)}>
                  Unlock demo balance
                </button>
              )}
              {user.binollaAccount ? (
                <Link className={styles.link} to={ROUTES.adminApprovals}>
                  Open approvals
                </Link>
              ) : null}
              {user.isMarketingDemo ? (
                <Link className={styles.link} to={ROUTES.adminMarketing}>
                  Marketing configs
                </Link>
              ) : null}
            </div>

          <h2 className={styles.sectionTitle}>Trading bot</h2>
          <p className={styles.muted}>
            Run this user’s bot on their behalf. Changes here apply to the live server
            immediately — the user sees them on their bot page.
          </p>

          <div className={styles.grid2}>
            <div>
              <div className={styles.muted}>State</div>
              <div>{bot?.state ?? '—'}</div>
            </div>
            <div>
              <div className={styles.muted}>Pairs</div>
              <div>{bot?.assets?.length ? bot.assets.join(', ') : (bot?.asset ?? '—')}</div>
            </div>
          </div>

          <div className={styles.toolbar}>
            <label className={styles.muted} htmlFor="bot-strategy">
              Strategy
            </label>
            <select
              id="bot-strategy"
              className={styles.input}
              value={botStrategy}
              onChange={(e) => setBotStrategy(e.target.value)}
            >
              <option value="">(keep current)</option>
              <option value="rsi">RSI</option>
              <option value="ema">EMA</option>
              <option value="alt5">Alternating (5m)</option>
              <option value="smart">Smart</option>
            </select>

            <label className={styles.muted} htmlFor="bot-profit">
              Daily profit
            </label>
            <input
              id="bot-profit"
              className={styles.input}
              inputMode="decimal"
              value={botProfit}
              onChange={(e) => setBotProfit(e.target.value)}
              placeholder="50"
            />

            <label className={styles.muted} htmlFor="bot-loss">
              Daily loss
            </label>
            <input
              id="bot-loss"
              className={styles.input}
              inputMode="decimal"
              value={botLoss}
              onChange={(e) => setBotLoss(e.target.value)}
              placeholder="30"
            />
          </div>

          <div className={styles.toolbar}>
            <button
              type="button"
              className={styles.btn}
              disabled={botBusy}
              onClick={() => void botAction('start')}
            >
              Start bot
            </button>
            <button
              type="button"
              className={styles.btn}
              disabled={botBusy}
              onClick={() => void botAction('apply')}
              title="Save strategy and limits without changing the run state"
            >
              Save settings
            </button>
            <button
              type="button"
              className={styles.btn}
              disabled={botBusy}
              onClick={() => void botAction('pause')}
            >
              Pause
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnDanger}`}
              disabled={botBusy}
              onClick={() => void botAction('stop')}
            >
              Stop bot
            </button>
          </div>
          </div>

          <h3>Recent audit</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Action</th>
                  <th>From → To</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((e) => (
                  <tr key={e.id}>
                    <td>{new Date(e.createdAt).toLocaleString()}</td>
                    <td>{e.action}</td>
                    <td>
                      {e.previousState ?? '—'} → {e.newState ?? '—'}
                    </td>
                    <td>{e.detail ?? '—'}</td>
                  </tr>
                ))}
                {audit.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={styles.muted}>
                      No events
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
