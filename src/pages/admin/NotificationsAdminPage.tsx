import { useCallback, useEffect, useState } from 'react';
import { adminApi, ApiClientError } from '@shared/api';
import type { AdminNotificationDto } from '@shared/api/types';
import styles from './admin.module.css';

export default function NotificationsAdminPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userIdsRaw, setUserIdsRaw] = useState('');
  const [allApproved, setAllApproved] = useState(false);
  const [actionPath, setActionPath] = useState('/notifications');
  const [filterUserId, setFilterUserId] = useState('');
  const [items, setItems] = useState<AdminNotificationDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const pageSize = 25;

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await adminApi.listAdminNotifications({
        userId: filterUserId.trim() || undefined,
        page,
        pageSize,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load notifications');
    }
  }, [filterUserId, page]);

  useEffect(() => {
    void load();
  }, [load]);

  async function send() {
    if (allApproved) {
      const ok = window.confirm(
        'Send this notification to ALL users with an approved Binolla link? This cannot be undone.',
      );
      if (!ok) return;
    }

    setSending(true);
    setError(null);
    setMessage(null);
    try {
      const userIds = userIdsRaw
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await adminApi.sendNotification({
        title: title.trim(),
        description: description.trim(),
        userIds: userIds.length ? userIds : undefined,
        allApprovedUsers: allApproved,
        actionPath: actionPath.trim() || undefined,
        variant: 'admin-message',
      });
      setMessage(`Sent to ${res.sent} user(s)`);
      setTitle('');
      setDescription('');
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Send failed');
    } finally {
      setSending(false);
    }
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <h1 className={styles.pageTitle}>Notifications</h1>
      <p className={styles.pageSub}>Send messages that appear in the bot / dashboard notification inbox.</p>

      {error ? <p className={styles.error}>{error}</p> : null}
      {message ? <p className={styles.muted}>{message}</p> : null}

      <div className={styles.panel}>
        <h3>Send</h3>
        <label className={styles.label}>
          Title
          <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className={styles.label} style={{ marginTop: 8 }}>
          Description
          <textarea className={styles.textarea} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label className={styles.label} style={{ marginTop: 8 }}>
          Recipient user ids (comma/space separated)
          <input
            className={styles.input}
            style={{ width: '100%' }}
            value={userIdsRaw}
            onChange={(e) => setUserIdsRaw(e.target.value)}
            disabled={allApproved}
          />
        </label>
        <label className={styles.label} style={{ marginTop: 8 }}>
          Action path (optional)
          <input className={styles.input} value={actionPath} onChange={(e) => setActionPath(e.target.value)} />
        </label>
        <label className={styles.checkboxRow} style={{ marginTop: 10 }}>
          <input type="checkbox" checked={allApproved} onChange={(e) => setAllApproved(e.target.checked)} />
          Send to all approved Binolla users (requires confirmation)
        </label>
        <button
          type="button"
          className={styles.btn}
          style={{ marginTop: 12 }}
          disabled={sending || !title.trim() || !description.trim()}
          onClick={() => void send()}
        >
          {sending ? 'Sending…' : 'Send notification'}
        </button>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.input}
          placeholder="Filter by user id"
          value={filterUserId}
          onChange={(e) => setFilterUserId(e.target.value)}
        />
        <button
          type="button"
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={() => {
            setPage(1);
            void load();
          }}
        >
          Refresh
        </button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>When</th>
              <th>User</th>
              <th>Title</th>
              <th>Read</th>
            </tr>
          </thead>
          <tbody>
            {items.map((n) => (
              <tr key={n.id}>
                <td>{new Date(n.createdAt).toLocaleString()}</td>
                <td className={styles.muted}>{n.userId.slice(0, 8)}…</td>
                <td>
                  <div>{n.title}</div>
                  <div className={styles.muted}>{n.description}</div>
                </td>
                <td>{n.read ? 'Yes' : 'No'}</td>
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
