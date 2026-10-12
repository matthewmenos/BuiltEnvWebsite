import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/ThemeContext';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';
import SearchInput from '../components/SearchInput';
import { TableSkeleton } from '../components/Skeleton';
import { mediaUrl } from '../lib/upload';

interface AlbumRow {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  sortOrder: number;
  active: boolean;
}

const AdminGalleryAlbums: React.FC = () => {
  const { token } = useAuth();
  const { confirm } = useConfirm();
  const toast = useToast();
  const [items, setItems] = useState<AlbumRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/gallery-albums?limit=100', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not load albums');
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load albums');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    if (!q) return sorted;
    return sorted.filter((item) =>
      [item.title, item.description]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [items, query]);

  const handleDelete = async (item: AlbumRow) => {
    const ok = await confirm({
      message: `Delete "${item.title}"? This also deletes all photos assigned to this album. This cannot be undone.`,
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    setError('');
    setRemovingId(item.id);
    try {
      const res = await fetch(`/api/admin/gallery-albums?id=${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      await load();
      toast.success('Album and its photos deleted');
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
      <h1 className="page-title">Gallery Albums</h1>
      <p className="page-description">
        Albums group gallery photos into openable collections on the public Gallery page.
        Assign photos to an album from the Gallery Item form.
      </p>
      <div className="admin-section-header">
        <h2>All Albums</h2>
        <div className="section-actions">
          <Link to="/admin/gallery" className="btn btn-outline">Uploads Library</Link>
          <Link to="/admin/gallery/albums/new" className="btn btn-primary">
            <Plus size={15} aria-hidden="true" /> Add New Album
          </Link>
        </div>
      </div>
      {error && <div className="login-error">{error}</div>}
      {loading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : items.length === 0 ? (
        <div className="empty-state">No albums yet. Add an album to start grouping photos.</div>
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
            <div className="empty-state">No albums match your search.</div>
          ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>Title</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.coverImage ? (
                      <img
                        src={mediaUrl(item.coverImage)}
                        alt=""
                        loading="lazy"
                        style={{ width: 64, height: 44, objectFit: 'cover', borderRadius: 6, display: 'block' }}
                      />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{item.title}</td>
                  <td>{item.sortOrder ?? 0}</td>
                  <td>
                    <span className="badge badge-primary">
                      {item.active === false ? 'Hidden' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/admin/gallery/albums/${item.id}/edit`} className="btn btn-sm btn-outline">
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

export default AdminGalleryAlbums;
