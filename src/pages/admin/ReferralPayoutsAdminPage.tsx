import { useCallback, useEffect, useState } from 'react';
import { adminApi, ApiClientError } from '@shared/api';
import type { AdminReferralPayoutDto } from '@shared/api/types';
import styles from './admin.module.css';

type StatusFilter = 'Pending' | 'Approved' | 'Rejected' | 'Paid' | '';

function formatUsd(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const badgeClass: Record<string, string> = {
  Pending: 'badgeWarn',
  Approved: 'badgeOk',
  Paid: 'badgeOk',
  Rejected: 'badgeBad',
};

export default function ReferralPayoutsAdminPage() {
  const [status, setStatus] = useState<StatusFilter>('Pending');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<AdminReferralPayoutDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listReferralPayouts({ status: status || undefined, page, pageSize });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load payouts');
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    void load();
  }, [load]);

  async function decide(payoutId: string, decision: 'approve' | 'reject' | 'paid') {
    const verb = decision === 'approve' ? 'Approve' : decision === 'reject' ? 'Reject' : 'Mark as paid';
    if (!window.confirm(`${verb} this payout request?`)) return;

    const note = window.prompt('Optional note:') ?? undefined;
    setBusyId(payoutId);
    try {
      const updated = await adminApi.decideReferralPayout(payoutId, { decision, note });
      setItems((prev) => prev.map((x) => (x.id === payoutId ? updated : x)));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Action failed');
    } finally {
      setBusyId(null);
    }
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <h1 className={styles.pageTitle}>Referral payouts</h1>
      <p className={styles.pageSub}>Requests to withdraw accumulated referral commission and gifts.</p>

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
          <option value="Paid">Paid</option>
          <option value="">All</option>
        </select>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}
      {loading ? <p className={styles.muted}>Loading…</p> : null}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Requested</th>
              <th>User</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Destination</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id}>
                <td>{new Date(row.requestedAt).toLocaleString()}</td>
                <td>{row.userDisplayName || row.userId.slice(0, 8)}</td>
                <td>{formatUsd(row.amount)}</td>
                <td>{row.method ?? '—'}</td>
                <td>{row.destination ?? '—'}</td>
                <td>
                  <span className={`${styles.badge} ${styles[badgeClass[row.status] ?? 'badgeWarn']}`}>
                    {row.status}
                  </span>
                </td>
                <td className={styles.rowActions}>
                  <button
                    type="button"
                    className={styles.btn}
                    disabled={busyId === row.id || row.status !== 'Pending'}
                    onClick={() => void decide(row.id, 'approve')}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnDanger}`}
                    disabled={busyId === row.id || row.status !== 'Pending'}
                    onClick={() => void decide(row.id, 'reject')}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    disabled={busyId === row.id || row.status === 'Paid' || row.status === 'Rejected'}
                    onClick={() => void decide(row.id, 'paid')}
                  >
                    Mark paid
                  </button>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.muted}>
                  No payout requests
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
