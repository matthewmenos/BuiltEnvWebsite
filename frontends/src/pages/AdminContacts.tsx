import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../context/ThemeContext';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';
import SearchInput from '../components/SearchInput';
import { TableSkeleton } from '../components/Skeleton';

interface ContactRow {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  createdAt?: string;
}

const SUBJECT_LABELS: Record<string, string> = {
  enquiries: 'Programme Enquiries',
  admissions: 'Admissions',
  research: 'Research',
  partnership: 'Industry Partnership',
  media: 'Media',
  other: 'Other',
};

const subjectLabel = (s?: string) =>
  !s ? '—' : SUBJECT_LABELS[s] ?? s;

const AdminContacts: React.FC = () => {
  const { token } = useAuth();
  const { confirm } = useConfirm();
  const toast = useToast();
  const [items, setItems] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/contacts?limit=100');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not load contacts');
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) =>
      [c.name, c.email, c.phone, c.subject]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [items, query]);

  const handleDelete = async (item: ContactRow) => {
    const ok = await confirm({
      message: `Delete message from "${item.name ?? item.email ?? item.id}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    setError('');
    setRemovingId(item.id);
    try {
      const res = await fetch(`/api/admin/contacts?id=${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      await load();
      toast.success('Message deleted');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      setError(message);
      toast.error(message);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div>
      <h1 className="page-title">Contacts</h1>
      <p className="page-description">Manage site contact submissions. Click a row to read the full message.</p>
      {error && <div className="login-error">{error}</div>}
      <div className="admin-section-header">
        <h2>All Submissions</h2>
      </div>
      {items.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search name, email, phone or subject…"
            resultCount={filtered.length}
          />
        </div>
      )}
      {loading ? (
        <p className="text-muted">Loading submissions…</p>
      ) : items.length === 0 ? (
        <div className="empty-state">No contact submissions yet.</div>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            {filtered.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={6} className="empty-state">
                    No submissions match “{query.trim()}”.
                  </td>
                </tr>
              </tbody>
            ) : (
            <tbody>
              {filtered.map((c) => {
                const open = expandedId === c.id;
                return (
                  <React.Fragment key={c.id}>
                    <tr
                      className={`contact-row${open ? ' is-open' : ''}`}
                      onClick={() => setExpandedId(open ? null : c.id)}
                      title={open ? 'Click to collapse' : 'Click to read message'}
                    >
                      <td>{c.name || '—'}</td>
                      <td>{c.email || '—'}</td>
                      <td>{c.phone || '—'}</td>
                      <td>{subjectLabel(c.subject)}</td>
                      <td>
                        {c.createdAt
                          ? new Date(c.createdAt).toLocaleDateString('en-GB')
                          : '—'}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="table-actions">
                          <button
                            className="btn btn-sm btn-outline btn-delete"
                            onClick={() => handleDelete(c)}
                            disabled={removingId === c.id}
                          >
                            <Trash2 size={13} aria-hidden="true" />
                            {removingId === c.id ? ' Deleting...' : ' Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {open && (
                      <tr className="contact-detail-row">
                        <td colSpan={6}>
                          <div className="contact-detail">
                            <div className="contact-detail-meta">
                              <span>
                                <strong>From:</strong> {c.name || '—'} (
                                {c.email || '—'}
                                {c.phone ? ` · ${c.phone}` : ''})
                              </span>
                              <span>
                                <strong>Subject:</strong> {subjectLabel(c.subject)}
                              </span>
                              <span>
                                <strong>Date:</strong>{' '}
                                {c.createdAt
                                  ? new Date(c.createdAt).toLocaleString('en-GB')
                                  : '—'}
                              </span>
                            </div>
                            <p className="contact-detail-message">
                              {c.message || '—'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
            )}
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;

