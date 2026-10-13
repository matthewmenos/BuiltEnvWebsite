import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/ThemeContext';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';
import SearchInput from '../components/SearchInput';
import { TableSkeleton } from '../components/Skeleton';

const AdminAwards: React.FC = () => {
  const { token } = useAuth();
  const { confirm } = useConfirm();
  const toast = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/awards?limit=100');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not load awards');
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load awards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.title, item.detail]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [items, query]);

  const handleDelete = async (item: any) => {
    const ok = await confirm({
      message: `Delete "${item.title ?? item.id}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    setError('');
    setRemovingId(item.id);
    try {
      const res = await fetch(`/api/admin/awards?id=${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      await load();
      toast.success('Award deleted');
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
      <h1 className="page-title">Awards</h1>
      <p className="page-description">Awards shown in the scrolling marquee strip below the homepage hero.</p>
      <div className="admin-section-header">
        <h2>All Awards</h2>
        <Link to="/admin/awards/new" className="btn btn-primary">
          <Plus size={15} aria-hidden="true" /> Add New Award
        </Link>
      </div>
      {error && <div className="login-error">{error}</div>}
      {loading ? (
        <TableSkeleton rows={5} columns={4} />
      ) : items.length === 0 ? (
        <div className="empty-state">No awards yet. The marquee stays hidden until you add one.</div>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search by title or detail"
              resultCount={filtered.length}
            />
          </div>
          {filtered.length === 0 ? (
            <div className="empty-state">No awards match your search.</div>
          ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Title</th><th>Detail</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.detail}</td>
                  <td><span className="badge badge-primary">{item.active ? 'Active' : 'Hidden'}</span></td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/admin/awards/${item.id}/edit`} className="btn btn-sm btn-outline">
                        <Pencil size={13} aria-hidden="true" /> Edit
                      </Link>
                      <button
                        className="btn btn-sm btn-outline btn-delete"
                        onClick={() => handleDelete(item)}
                        disabled={removingId === item.id}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                        {removingId === item.id ? ' Deleting...' : ' Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminAwards;
