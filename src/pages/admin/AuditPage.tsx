import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, ApiClientError } from '@shared/api';
import type { AdminAuditEventDto } from '@shared/api/types';
import { ROUTES } from '@constants/routes';
import styles from './admin.module.css';

export default function AuditPage() {
  const [userId, setUserId] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<AdminAuditEventDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pageSize = 30;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listAudit({
        userId: userId.trim() || undefined,
        action: action.trim() || undefined,
        page,
        pageSize,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load audit');
    } finally {
      setLoading(false);
    }
  }, [userId, action, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <h1 className={styles.pageTitle}>Audit log</h1>
      <p className={styles.pageSub}>Approvals, demo changes, and admin notifications.</p>

      <div className={styles.toolbar}>
        <input
          className={styles.input}
          placeholder="Target user id"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <input
          className={styles.input}
          placeholder="Action (e.g. BinollaAccountApproved)"
          value={action}
          onChange={(e) => setAction(e.target.value)}
        />
        <button
          type="button"
          className={styles.btn}
          onClick={() => {
            setPage(1);
            void load();
          }}
        >
          Filter
        </button>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}
      {loading ? <p className={styles.muted}>Loading…</p> : null}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>When</th>
              <th>Action</th>
              <th>Actor</th>
              <th>Target</th>
              <th>State</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <tr key={e.id}>
                <td>{new Date(e.createdAt).toLocaleString()}</td>
                <td>{e.action}</td>
                <td className={styles.muted}>{e.actorUserId.slice(0, 8)}…</td>
                <td>
                  {e.targetUserId ? (
                    <Link className={styles.link} to={ROUTES.adminUserDetail.replace(':userId', e.targetUserId)}>
                      {e.targetUserId.slice(0, 8)}…
                    </Link>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  {e.previousState ?? '—'} → {e.newState ?? '—'}
                </td>
                <td>{e.detail ?? '—'}</td>
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
