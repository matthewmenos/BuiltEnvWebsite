import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/ThemeContext';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';
import SearchInput from '../components/SearchInput';
import { TableSkeleton } from '../components/Skeleton';

interface ResearchRow {
  id: string;
  title: string;
  description: string;
  icon: string;
  sortOrder: number;
  active: boolean;
}

const AdminResearch: React.FC = () => {
  const { token } = useAuth();
  const { confirm } = useConfirm();
  const toast = useToast();
  const [items, setItems] = useState<ResearchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/research?limit=100');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not load research areas');
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load research areas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Sort by the same order the public page uses so admins see what visitors see.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...items].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );
    if (!q) return sorted;
    return sorted.filter((item) =>
      [item.title, item.description, item.icon]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [items, query]);

  const handleDelete = async (item: ResearchRow) => {
    const ok = await confirm({
      message: `Delete "${item.title ?? item.id}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    setError('');
    setRemovingId(item.id);
    try {
      const res = await fetch(`/api/admin/research?id=${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      await load();
      toast.success('Research area deleted');
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
      <h1 className="page-title">Research Areas</h1>
      <p className="page-description">Manage the research areas shown on the public Research page.</p>
      <div className="admin-section-header">
        <h2>All Research Areas</h2>
        <Link to="/admin/research/new" className="btn btn-primary">
          <Plus size={15} aria-hidden="true" /> Add New Research Area
        </Link>
      </div>
      {error && <div className="login-error">{error}</div>}
      {loading ? (
        <TableSkeleton rows={4} columns={5} />
      ) : items.length === 0 ? (
        <div className="empty-state">No research areas yet.</div>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search by title or description"
              resultCount={filtered.length}
            />
          </div>
          {filtered.length === 0 ? (
            <div className="empty-state">No research areas match your search.</div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead><tr><th>Title</th><th>Description</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>
                        {item.description.length > 80
                          ? `${item.description.slice(0, 80)}…`
                          : item.description}
                      </td>
                      <td>{item.sortOrder ?? 0}</td>
                      <td><span className="badge badge-primary">{item.active !== false ? 'Active' : 'Hidden'}</span></td>
                      <td>
                        <div className="table-actions">
                          <Link to={`/admin/research/${item.id}/edit`} className="btn btn-sm btn-outline">
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

export default AdminResearch;
