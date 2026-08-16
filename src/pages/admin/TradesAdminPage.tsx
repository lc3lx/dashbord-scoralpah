import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, ApiClientError } from '@shared/api';
import type { AdminTradeDto } from '@shared/api/types';
import { ROUTES } from '@constants/routes';
import styles from './admin.module.css';

export default function TradesAdminPage() {
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('');
  const [asset, setAsset] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<AdminTradeDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 30;

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await adminApi.listAdminTrades({
        userId: userId.trim() || undefined,
        status: status || undefined,
        asset: asset.trim() || undefined,
        page,
        pageSize,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load trades');
    }
  }, [userId, status, asset, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <h1 className={styles.pageTitle}>All trades</h1>
      <p className={styles.pageSub}>Cross-user trade browser for bot operations.</p>

      <div className={styles.toolbar}>
        <input
          className={styles.input}
          placeholder="User id"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <select
          className={styles.select}
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Running">Running</option>
          <option value="Profit">Profit</option>
          <option value="Loss">Loss</option>
          <option value="Tie">Tie</option>
          <option value="Failed">Failed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <input
          className={styles.input}
          placeholder="Asset e.g. EURUSD"
          value={asset}
          onChange={(e) => setAsset(e.target.value)}
        />
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

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>When</th>
              <th>User</th>
              <th>Asset</th>
              <th>Dir</th>
              <th>Amount</th>
              <th>Status</th>
              <th>PnL</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id}>
                <td>{new Date(t.createdAt).toLocaleString()}</td>
                <td>
                  <Link className={styles.link} to={ROUTES.adminUserDetail.replace(':userId', t.userId)}>
                    {t.fullName || t.email || t.userId.slice(0, 8)}
                  </Link>
                </td>
                <td>{t.asset}</td>
                <td>{t.direction}</td>
                <td>{t.amount}</td>
                <td>{t.status}</td>
                <td>{t.pnl ?? '—'}</td>
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
