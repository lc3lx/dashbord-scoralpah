import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, ApiClientError } from '@shared/api';
import type { AdminUserListItemDto } from '@shared/api/types';
import { ROUTES } from '@constants/routes';
import styles from './admin.module.css';

export default function UsersPage() {
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [demo, setDemo] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<AdminUserListItemDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pageSize = 25;

  /**
   * Unlocks or re-locks a user's Binolla DEMO balance, straight from the list.
   *
   * Everyone trades live by default; demo is only reachable once an admin turns it on.
   * This lives here rather than only on the detail page so granting it does not require
   * opening each user first.
   */
  const toggleDemoAllowed = useCallback(async (user: AdminUserListItemDto) => {
    setError(null);
    try {
      await adminApi.patchUser(user.id, { demoAllowed: !user.demoAllowed });
      // Reflect it immediately; the row is re-fetched right after.
      setItems((current) =>
        current.map((row) =>
          row.id === user.id ? { ...row, demoAllowed: !user.demoAllowed } : row,
        ),
      );
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Update failed');
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listUsers({
        q: q.trim() || undefined,
        role: role || undefined,
        isMarketingDemo: demo === '' ? undefined : demo === 'true',
        page,
        pageSize,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [q, role, demo, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <h1 className={styles.pageTitle}>Users</h1>
      <p className={styles.pageSub}>Search and open user profiles for Binolla status and marketing flags.</p>

      <div className={styles.toolbar}>
        <input
          className={styles.input}
          placeholder="Search email / name / telegram / id"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setPage(1);
              void load();
            }
          }}
        />
        <select
          className={styles.select}
          value={role}
          onChange={(e) => {
            setPage(1);
            setRole(e.target.value);
          }}
        >
          <option value="">All roles</option>
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </select>
        <select
          className={styles.select}
          value={demo}
          onChange={(e) => {
            setPage(1);
            setDemo(e.target.value);
          }}
        >
          <option value="">Any demo</option>
          <option value="true">Marketing demo</option>
          <option value="false">Not demo</option>
        </select>
        <button
          type="button"
          className={styles.btn}
          onClick={() => {
            setPage(1);
            void load();
          }}
        >
          Search
        </button>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}
      {loading ? <p className={styles.muted}>Loading…</p> : null}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Password</th>
              <th>Telegram</th>
              <th>Role</th>
              <th>Demo</th>
              <th>Demo balance</th>
              <th>Binolla</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id}>
                <td>
                  <Link className={styles.link} to={ROUTES.adminUserDetail.replace(':userId', u.id)}>
                    {u.fullName || u.username || u.id.slice(0, 8)}
                  </Link>
                </td>
                <td>
                  <div>{u.loginEmail || u.email || '—'}</div>
                </td>
                <td>
                  <code style={{ fontSize: '0.8rem', userSelect: 'all' }}>{u.loginPassword || '—'}</code>
                </td>
                <td>{u.telegramUserId ?? '—'}</td>
                <td>{u.role}</td>
                <td>
                  <span className={`${styles.badge} ${u.isMarketingDemo ? styles.badgeOk : ''}`}>
                    {u.isMarketingDemo ? 'Yes' : 'No'}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className={styles.btn}
                    onClick={() => void toggleDemoAllowed(u)}
                    title={
                      u.demoAllowed
                        ? 'Demo balance is unlocked — click to lock it and force live trading'
                        : 'Demo balance is locked — click to allow this user to switch to demo'
                    }
                  >
                    {u.demoAllowed ? 'Unlocked · Lock' : 'Live only · Unlock'}
                  </button>
                </td>
                <td>
                  {u.binollaApprovalStatus ?? '—'}
                  {u.binollaConnected ? ' · connected' : ''}
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={9} className={styles.muted}>
                  No users
                </td>
              </tr>
            ) : null}
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
