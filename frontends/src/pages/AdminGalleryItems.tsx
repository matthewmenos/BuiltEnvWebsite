import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/ThemeContext';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';
import SearchInput from '../components/SearchInput';
import { TableSkeleton } from '../components/Skeleton';
import { mediaUrl } from '../lib/upload';

interface PhotoRow {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  credit: string;
  albumId: string | null;
  updatedAt: string;
}

interface AlbumRow {
  id: string;
  title: string;
}

const AdminGalleryItems: React.FC = () => {
  const { token } = useAuth();
  const { confirm } = useConfirm();
  const toast = useToast();
  const [items, setItems] = useState<PhotoRow[]>([]);
  const [albums, setAlbums] = useState<AlbumRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      const [photosRes, albumsRes] = await Promise.all([
        fetch('/api/admin/gallery?limit=200', { headers }),
        fetch('/api/admin/gallery-albums?limit=100', { headers }),
      ]);
      const photosData = await photosRes.json().catch(() => ({}));
      if (!photosRes.ok) throw new Error(photosData.error || 'Could not load gallery items');
      const albumsData = await albumsRes.json().catch(() => ({}));
      setItems(Array.isArray(photosData.items) ? photosData.items : []);
      setAlbums(Array.isArray(albumsData.items) ? albumsData.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load gallery items');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const albumName = useMemo(() => {
    const map = new Map<string, string>();
    albums.forEach((a) => map.set(a.id, a.title));
    return map;
  }, [albums]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.title, item.description, item.credit, albumName.get(item.albumId ?? '') ?? '']
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [items, query, albumName]);

  const handleDelete = async (item: PhotoRow) => {
    const ok = await confirm({
      message: `Delete "${item.title ?? item.id}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    setError('');
    setRemovingId(item.id);
    try {
      const res = await fetch(`/api/admin/gallery?id=${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      await load();
      toast.success('Gallery item deleted');
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
      <h1 className="page-title">Gallery Items</h1>
      <p className="page-description">
        Photos shown on the public Gallery page. Assign each photo to an album so it appears
        inside an openable album collection.
      </p>
      <div className="admin-section-header">
        <h2>All Photos</h2>
        <div className="section-actions">
          <Link to="/admin/gallery" className="btn btn-outline">Uploads Library</Link>
          <Link to="/admin/gallery/albums" className="btn btn-outline">Manage Albums</Link>
          <Link to="/admin/gallery/new" className="btn btn-primary">
            <Plus size={15} aria-hidden="true" /> Add New Photo
          </Link>
        </div>
      </div>
      {error && <div className="login-error">{error}</div>}
      {loading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : items.length === 0 ? (
        <div className="empty-state">No gallery photos yet. Add a photo to get started.</div>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search by title, credit or album"
              resultCount={filtered.length}
            />
          </div>
          {filtered.length === 0 ? (
            <div className="empty-state">No gallery items match your search.</div>
          ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Album</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <img
                      src={mediaUrl(item.imageUrl)}
                      alt=""
                      loading="lazy"
                      style={{ width: 64, height: 44, objectFit: 'cover', borderRadius: 6, display: 'block' }}
                    />
                  </td>
                  <td>{item.title}</td>
                  <td>{item.albumId ? (albumName.get(item.albumId) ?? '-') : <em>Unassigned</em>}</td>
                  <td>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-GB') : '-'}</td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/admin/gallery/${item.id}/edit`} className="btn btn-sm btn-outline">
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

export default AdminGalleryItems;
