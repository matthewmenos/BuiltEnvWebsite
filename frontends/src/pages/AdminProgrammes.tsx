import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/ThemeContext';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';
import SearchInput from '../components/SearchInput';
import { TableSkeleton } from '../components/Skeleton';

const AdminProgrammes: React.FC = () => {
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
      const res = await fetch('/api/admin/programmes?limit=100');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not load programmes');
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load programmes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.shortCode, item.title, item.faculty]
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
      const res = await fetch(`/api/admin/programmes/${item.id}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      await load();
      toast.success('Programme deleted');
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
      <h1 className="page-title">Programmes</h1>
      <p className="page-description">Manage the department's academic programmes.</p>
      <div className="admin-section-header">
        <h2>All Programmes</h2>
        <Link to="/admin/programmes/new" className="btn btn-primary">
          <Plus size={15} aria-hidden="true" /> Add New Programme
        </Link>
      </div>
      {error && <div className="login-error">{error}</div>}
      {loading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : items.length === 0 ? (
        <div className="empty-state">No programmes yet.</div>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search by code, title or faculty"
              resultCount={filtered.length}
            />
          </div>
          {filtered.length === 0 ? (
            <div className="empty-state">No programmes match your search.</div>
          ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Code</th><th>Title</th><th>Faculty</th><th>Duration</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((item) => (
                <tr key={item.id}>
                  <td>{item.shortCode}</td>
                  <td>{item.title}</td>
                  <td>{item.faculty}</td>
                  <td>{item.duration}</td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/admin/programmes/${item.id}/edit`} className="btn btn-sm btn-outline">
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

export default AdminProgrammes;
