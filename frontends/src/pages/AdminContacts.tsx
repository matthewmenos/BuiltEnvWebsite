import React, { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../context/ThemeContext';

interface ContactRow {
  id: string;
  name?: string;
  email?: string;
  subject?: string;
  createdAt?: string;
}

const AdminContacts: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  const handleDelete = async (item: ContactRow) => {
    if (
      !window.confirm(
        `Delete message from "${item.name ?? item.email ?? item.id}"? This cannot be undone.`
      )
    )
      return;
    setError('');
    setRemovingId(item.id);
    try {
      const res = await fetch(`/api/admin/contacts/${item.id}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div>
      <h1 className="page-title">Contacts</h1>
      <p className="page-description">Manage site contact submissions.</p>
      {error && <div className="login-error">{error}</div>}
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
                <th>Subject</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.subject}</td>
                  <td>
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString('en-GB')
                      : '—'}
                  </td>
                  <td>
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;

