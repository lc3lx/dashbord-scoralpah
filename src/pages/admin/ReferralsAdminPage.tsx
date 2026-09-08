import { useCallback, useEffect, useState } from 'react';
import { adminApi, ApiClientError } from '@shared/api';
import type { AdminReferralDetailResponse, AdminReferralOverviewDto } from '@shared/api/types';
import styles from './admin.module.css';

function formatUsd(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ReferralsAdminPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<AdminReferralOverviewDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminReferralDetailResponse | null>(null);
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listReferrers({ q: q.trim() || undefined, page, pageSize });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load referrers');
    } finally {
      setLoading(false);
    }
  }, [q, page]);

  useEffect(() => {
    void load();
  }, [load]);

  async function openDetail(referrerUserId: string) {
    try {
      const data = await adminApi.getReferrerDetail(referrerUserId);
      setDetail(data);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load referrer detail');
    }
  }

  async function overrideDeposit(referredUserId: string, met: boolean | null) {
    if (!detail) return;
    const note = window.prompt('Optional note for this deposit decision:') ?? undefined;
    setBusyId(referredUserId);
    try {
      const updatedMember = await adminApi.setReferralDeposit(referredUserId, { met, note });
      setDetail({
        ...detail,
        members: detail.members.map((m) => (m.userId === referredUserId ? updatedMember : m)),
      });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to update deposit status');
    } finally {
      setBusyId(null);
    }
  }

  async function markRewardPaid(rewardId: string) {
    if (!detail) return;
    if (!window.confirm('Mark this reward as paid?')) return;
    setBusyId(rewardId);
    try {
      const updated = await adminApi.markReferralRewardPaid(rewardId);
      setDetail({
        ...detail,
        rewards: detail.rewards.map((r) => (r.id === rewardId ? updated : r)),
      });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to mark reward paid');
    } finally {
      setBusyId(null);
    }
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <h1 className={styles.pageTitle}>Referral program</h1>
      <p className={styles.pageSub}>Referrers, their qualified referrals, tier, and available balance.</p>

      <div className={styles.toolbar}>
        <input
          className={styles.input}
          placeholder="Search referrer email / name / code"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setPage(1);
              void load();
            }
          }}
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
      {loading ? <p className={styles.muted}>Loading…</p> : null}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Referrer</th>
              <th>Qualified / Total</th>
              <th>Tier</th>
              <th>Commission</th>
              <th>Rewards</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.referrerUserId}>
                <td>{row.displayName || row.email || row.referrerUserId.slice(0, 8)}</td>
                <td>
                  {row.qualifiedReferrals} / {row.totalReferrals}
                </td>
                <td>{row.currentTier > 0 ? `Tier ${row.currentTier}` : '—'}</td>
                <td>{formatUsd(row.totalCommissionEarned)}</td>
                <td>{formatUsd(row.totalRewardsEarned)}</td>
                <td>{formatUsd(row.availableBalance)}</td>
                <td className={styles.rowActions}>
                  <button type="button" className={styles.link} onClick={() => void openDetail(row.referrerUserId)}>
                    Details
                  </button>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.muted}>
                  No referrers
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
          <h3>
            {detail.referrer.displayName || detail.referrer.email || detail.referrer.referrerUserId.slice(0, 8)} —
            referral detail
          </h3>

          <h4>Referred members</h4>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Referred on</th>
                  <th>Deposit met</th>
                  <th>Active days</th>
                  <th>Qualified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {detail.members.map((member) => (
                  <tr key={member.userId}>
                    <td>{member.displayName || member.userId.slice(0, 8)}</td>
                    <td>{new Date(member.referredAt).toLocaleDateString()}</td>
                    <td>{member.depositMet ? 'Yes' : 'No'}</td>
                    <td>
                      {member.activeDaysCount}/{member.requiredActiveDays}
                    </td>
                    <td>
                      <span className={`${styles.badge} ${member.qualified ? styles.badgeOk : styles.badgeWarn}`}>
                        {member.qualified ? 'Qualified' : 'Pending'}
                      </span>
                    </td>
                    <td className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.btn}
                        disabled={busyId === member.userId}
                        onClick={() => void overrideDeposit(member.userId, true)}
                      >
                        Force met
                      </button>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnDanger}`}
                        disabled={busyId === member.userId}
                        onClick={() => void overrideDeposit(member.userId, false)}
                      >
                        Force not met
                      </button>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnSecondary}`}
                        disabled={busyId === member.userId}
                        onClick={() => void overrideDeposit(member.userId, null)}
                      >
                        Clear override
                      </button>
                    </td>
                  </tr>
                ))}
                {detail.members.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.muted}>
                      No referred members
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <h4 style={{ marginTop: 16 }}>Rewards</h4>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Kind</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Granted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {detail.rewards.map((reward) => (
                  <tr key={reward.id}>
                    <td>{reward.kind === 'IPhone' ? 'iPhone reward' : `Tier ${reward.tier} gift`}</td>
                    <td>{reward.amount > 0 ? formatUsd(reward.amount) : '—'}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${reward.status === 'Paid' ? styles.badgeOk : styles.badgeWarn}`}
                      >
                        {reward.status}
                      </span>
                    </td>
                    <td>{new Date(reward.grantedAt).toLocaleDateString()}</td>
                    <td className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.btn}
                        disabled={busyId === reward.id || reward.status !== 'Granted'}
                        onClick={() => void markRewardPaid(reward.id)}
                      >
                        Mark paid
                      </button>
                    </td>
                  </tr>
                ))}
                {detail.rewards.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.muted}>
                      No rewards yet
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <h4 style={{ marginTop: 16 }}>Recent commissions</h4>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Referred user</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {detail.recentCommissions.map((c) => (
                  <tr key={c.id}>
                    <td>{new Date(c.createdAt).toLocaleString()}</td>
                    <td>{c.referredDisplayName || c.referredUserId.slice(0, 8)}</td>
                    <td>{c.ratePercent}%</td>
                    <td>{formatUsd(c.amount)}</td>
                  </tr>
                ))}
                {detail.recentCommissions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={styles.muted}>
                      No commissions yet
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            style={{ marginTop: 12 }}
            onClick={() => setDetail(null)}
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
