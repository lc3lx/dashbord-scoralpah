import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, ApiClientError } from '@shared/api';
import type { AdminBinollaAccountDto } from '@shared/api/types';
import { ROUTES } from '@constants/routes';
import styles from './admin.module.css';

type StatusFilter = 'Pending' | 'Approved' | 'Rejected' | '';

export default function ApprovalsPage() {
  const [status, setStatus] = useState<StatusFilter>('Pending');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<AdminBinollaAccountDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminBinollaAccountDto | null>(null);
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listAccounts({
        status: status || undefined,
        q: q.trim() || undefined,
        page,
        pageSize,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, [status, q, page]);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(id: string, kind: 'approve' | 'reject') {
    if (!window.confirm(kind === 'approve' ? 'Approve this Binolla account?' : 'Reject this account?')) {
      return;
    }
    setBusyId(id);
    try {
      const updated = kind === 'approve' ? await adminApi.approve(id) : await adminApi.reject(id);
      setItems((prev) => prev.map((x) => (x.id === id ? updated : x)));
      if (detail?.id === id) setDetail(updated);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Action failed');
    } finally {
      setBusyId(null);
    }
  }

  async function openDetail(id: string) {
    try {
      setDetail(await adminApi.getAccount(id));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load detail');
    }
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <h1 className={styles.pageTitle}>Binolla approvals</h1>
      <p className={styles.pageSub}>Manual gate for real accounts — approve or reject linked Binolla sessions.</p>

      <div className={styles.toolbar}>
        <select
          className={styles.select}
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value as StatusFilter);
          }}
        >
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="">All</option>
        </select>
        <input
          className={styles.input}
          placeholder="Search email / name / telegram / binolla id"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setPage(1);
              void load();
            }
          }}
        />
        <button type="button" className={styles.btn} onClick={() => { setPage(1); void load(); }}>
          Search
        </button>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}
      {loading ? <p className={styles.muted}>Loading…</p> : null}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Telegram</th>
              <th>Binolla</th>
              <th>Status</th>
              <th>Linked</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id}>
                <td>
                  <div>{row.fullName || row.email || '—'}</div>
                  <button type="button" className={styles.link} onClick={() => void openDetail(row.id)}>
                    Details
                  </button>
                  {' · '}
                  <Link className={styles.link} to={ROUTES.adminUserDetail.replace(':userId', row.userId)}>
                    User
                  </Link>
                </td>
                <td>{row.telegramUserId ?? '—'}</td>
                <td>{row.binollaAccountIdentifier ?? '—'}</td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      row.approvalStatus === 'Approved'
                        ? styles.badgeOk
                        : row.approvalStatus === 'Rejected'
                          ? styles.badgeBad
                          : styles.badgeWarn
                    }`}
                  >
                    {row.approvalStatus}
                  </span>
                </td>
                <td>{new Date(row.createdAt).toLocaleString()}</td>
                <td className={styles.rowActions}>
                  <button
                    type="button"
                    className={styles.btn}
                    disabled={busyId === row.id || row.approvalStatus === 'Approved'}
                    onClick={() => void act(row.id, 'approve')}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnDanger}`}
                    disabled={busyId === row.id || row.approvalStatus === 'Rejected'}
                    onClick={() => void act(row.id, 'reject')}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.muted}>
                  No accounts
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

      {detail ? (
        <div className={styles.panel} style={{ marginTop: 16 }}>
          <h3>Account detail</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>{JSON.stringify(detail, null, 2)}</pre>
          <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setDetail(null)}>
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
