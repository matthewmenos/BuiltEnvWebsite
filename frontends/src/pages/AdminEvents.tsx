import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/ThemeContext';

interface EventRow {
  id: string;
  title?: string;
  category?: string;
  location?: string;
  startTime?: string;
}

const AdminEvents: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/events?limit=100');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not load events');
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (item: EventRow) => {
    if (!window.confirm(`Delete "${item.title ?? item.id}"? This cannot be undone.`))
      return;
    setError('');
    setRemovingId(item.id);
    try {
      const res = await fetch(`/api/admin/events/${item.id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
      <h1 className="page-title">Events</h1>
      <p className="page-description">Manage the department's events.</p>
      <div className="admin-section-header">
        <h2>All Events</h2>
        <Link to="/admin/events/new" className="btn btn-primary">
          <Plus size={15} aria-hidden="true" /> Add New Event
        </Link>
      </div>
      {error && <div className="login-error">{error}</div>}
      {loading ? (
        <p className="text-muted">Loading events…</p>
      ) : items.length === 0 ? (
        <div className="empty-state">No events yet.</div>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((event) => (
                <tr key={event.id}>
                  <td>
                    {event.startTime
                      ? new Date(event.startTime).toLocaleDateString('en-GB')
                      : '—'}
                  </td>
                  <td>{event.title}</td>
                  <td>{event.category}</td>
                  <td>{event.location}</td>
                  <td>
                    <div className="table-actions">
                      <Link
                        to={`/admin/events/${event.id}/edit`}
                        className="btn btn-sm btn-outline"
                      >
                        <Pencil size={13} aria-hidden="true" /> Edit
                      </Link>
                      <button
                        className="btn btn-sm btn-outline btn-delete"
                        onClick={() => handleDelete(event)}
                        disabled={removingId === event.id}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                        {removingId === event.id ? ' Deleting...' : ' Delete'}
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

export default AdminEvents;
