import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/ThemeContext';

const AdminStaff: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/staff?limit=100');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not load staff');
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load staff');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (item: any) => {
    if (!window.confirm(`Delete "${item.name ?? item.id}"? This cannot be undone.`)) return;
    setError('');
    setRemovingId(item.id);
    try {
      // Query-param id: Vercel file-routing has no /staff/<id> route, and
      // handleResource.getId() reads req.query.id first.
      const res = await fetch(`/api/admin/staff?id=${encodeURIComponent(item.id)}`, {
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
      <h1 className="page-title">Staff</h1>
      <p className="page-description">Manage the department's staff members.</p>
      <div className="admin-section-header">
        <h2>All Staff Members</h2>
        <Link to="/admin/staff/new" className="btn btn-primary">
          <Plus size={15} aria-hidden="true" /> Add New Staff Member
        </Link>
      </div>
      {error && <div className="login-error">{error}</div>}
      {loading ? (
        <p className="text-muted">Loading staff...</p>
      ) : items.length === 0 ? (
        <div className="empty-state">No staff yet.</div>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Position</th><th>Department</th><th>Email</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.position}</td>
                  <td>{item.department}</td>
                  <td>{item.email}</td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/admin/staff/${item.id}/edit`} className="btn btn-sm btn-outline">
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
    </div>
  );
};

export default AdminStaff;
