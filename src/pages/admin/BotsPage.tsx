import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, ApiClientError } from '@shared/api';
import type { AdminBotRuntimeDto, AdminFleetActionResponse } from '@shared/api/types';
import { ROUTES } from '@constants/routes';
import styles from './admin.module.css';

export default function BotsPage() {
  const [state, setState] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<AdminBotRuntimeDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [startAsset, setStartAsset] = useState('EURUSD');
  const [fleet, setFleet_] = useState<AdminFleetActionResponse | null>(null);
  const [fleetBusy, setFleetBusy] = useState(false);
  const pageSize = 25;

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await adminApi.listBots({
        state: state || undefined,
        q: q.trim() || undefined,
        page,
        pageSize,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load bots');
    }
  }, [state, q, page]);

  useEffect(() => {
    // The banner must reflect reality on arrival, not only after an action.
    void adminApi.getBotFleet().then(setFleet_).catch(() => setFleet_(null));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /**
   * Stops or resumes the trading bot for EVERY user at once.
   *
   * Stopping also raises the maintenance flag, so users see the "we'll be right back"
   * notice on their bot page and cannot simply press Start again. Resuming clears it and
   * restarts only the bots this switch stopped.
   */
  async function setFleet(active: boolean) {
    const note = active
      ? window.prompt('Optional message to show users (leave blank for the default):') ?? ''
      : '';
    setError(null);
    setFleetBusy(true);
    try {
      const next = await adminApi.setBotFleet({ active, message: note.trim() || null });
      setFleet_(next);
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Fleet update failed');
    } finally {
      setFleetBusy(false);
    }
  }

  async function control(userId: string, action: string, asset?: string) {
    setBusyId(userId);
    setError(null);
    try {
      await adminApi.controlBot(userId, {
        action,
        asset: asset || startAsset,
        amount: 25,
        durationSeconds: 300,
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Control failed');
    } finally {
      setBusyId(null);
    }
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <h1 className={styles.pageTitle}>Bot runtime</h1>
      <p className={styles.pageSub}>
        Monitor and control any user’s bot (start / pause / stop) across the live server.
      </p>

      <div className={styles.toolbar}>
        <span className={styles.badge + (fleet?.maintenanceActive ? ` ${styles.badgeWarn}` : '')}>
          {fleet?.maintenanceActive
            ? `All bots STOPPED${fleet.since ? ` since ${new Date(fleet.since).toLocaleString()}` : ''}`
            : `Trading active · ${fleet?.botsAffected ?? 0} bot(s) running`}
        </span>

        {fleet?.maintenanceActive ? (
          <button
            type="button"
            className={styles.btn}
            disabled={fleetBusy}
            onClick={() => void setFleet(false)}
            title="Clear the maintenance notice and restart the bots this switch stopped"
          >
            Start bots for everyone
          </button>
        ) : (
          <button
            type="button"
            className={`${styles.btn} ${styles.btnDanger}`}
            disabled={fleetBusy}
            onClick={() => void setFleet(true)}
            title="Stop every user's bot and show them the maintenance notice"
          >
            Stop bots for everyone
          </button>
        )}
      </div>

      <div className={styles.toolbar}>
        <select
          className={styles.select}
          value={state}
          onChange={(e) => {
            setPage(1);
            setState(e.target.value);
          }}
        >
          <option value="">All states</option>
          <option value="Running">Running</option>
          <option value="Paused">Paused</option>
          <option value="Stopped">Stopped</option>
        </select>
        <input
          className={styles.input}
          placeholder="Search user"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setPage(1);
              void load();
            }
          }}
        />
        <input
          className={styles.input}
          placeholder="Default start asset"
          value={startAsset}
          onChange={(e) => setStartAsset(e.target.value)}
        />
        <button type="button" className={styles.btn} onClick={() => void load()}>
          Refresh
        </button>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Access</th>
              <th>State</th>
              <th>Asset</th>
              <th>Amount</th>
              <th>P/L limits</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.userId}>
                <td>
                  <Link className={styles.link} to={ROUTES.adminUserDetail.replace(':userId', row.userId)}>
                    {row.fullName || row.email || row.userId.slice(0, 8)}
                  </Link>
                  <div className={styles.muted}>
                    {row.isMarketingDemo ? 'Demo · ' : ''}
                    TG {row.telegramUserId ?? '—'}
                  </div>
                </td>
                <td>{row.botAccess}</td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      row.state === 'Running'
                        ? styles.badgeOk
                        : row.state === 'Paused'
                          ? styles.badgeWarn
                          : ''
                    }`}
                  >
                    {row.state}
                  </span>
                </td>
                <td>{row.asset ?? '—'}</td>
                <td>{row.amount}</td>
                <td>
                  +{row.dailyProfitTarget} / -{row.dailyLossLimit}
                </td>
                <td>{new Date(row.updatedAt).toLocaleString()}</td>
                <td className={styles.rowActions}>
                  <button
                    type="button"
                    className={styles.btn}
                    disabled={busyId === row.userId}
                    onClick={() => void control(row.userId, 'start', row.asset || startAsset)}
                  >
                    Start
                  </button>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    disabled={busyId === row.userId}
                    onClick={() => void control(row.userId, 'pause')}
                  >
                    Pause
                  </button>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnDanger}`}
                    disabled={busyId === row.userId}
                    onClick={() => void control(row.userId, 'stop')}
                  >
                    Stop
                  </button>
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
    </div>
  );
}
