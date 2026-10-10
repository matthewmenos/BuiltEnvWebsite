import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/ThemeContext';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';
import SearchInput from '../components/SearchInput';
import { TableSkeleton } from '../components/Skeleton';

interface HomeSlide {
  id: string;
  imageUrl: string;
  altText: string;
  sortOrder: number;
  active: boolean;
}

const AdminHomeSlides: React.FC = () => {
  const { token } = useAuth();
  const { confirm } = useConfirm();
  const toast = useToast();
  const [slides, setSlides] = useState<HomeSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/home-slides?limit=100');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not load slides');
      const items: HomeSlide[] = Array.isArray(data.items) ? data.items : [];
      items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      setSlides(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load slides');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return slides;
    return slides.filter((s) =>
      [s.altText, s.imageUrl]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [slides, query]);

  const handleDelete = async (slide: HomeSlide) => {
    const ok = await confirm({
      message: 'Delete this slide? This cannot be undone.',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    setError('');
    setRemovingId(slide.id);
    try {
      const res = await fetch(`/api/admin/home-slides/${slide.id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      await load();
      toast.success('Slide deleted');
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
      <h1 className="page-title">Homepage</h1>
      <p className="page-description">
        Background images for the homepage hero carousel. Slides rotate in
        display order; hidden slides are kept but not shown.
      </p>
      <div className="admin-section-header">
        <h2>All Slides</h2>
        <Link to="/admin/home/new" className="btn btn-primary">
          <Plus size={15} aria-hidden="true" /> Add New Slide
        </Link>
      </div>
      {error && <div className="login-error">{error}</div>}
      {loading ? (
        <TableSkeleton rows={4} columns={5} />
      ) : slides.length === 0 ? (
        <div className="empty-state">
          No slides yet &mdash; the homepage shows its gradient hero until you
          add at least one.
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search by alt text"
              resultCount={filtered.length}
            />
          </div>
          {filtered.length === 0 ? (
            <div className="empty-state">No slides match your search.</div>
          ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Alt text</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((slide) => (
                <tr key={slide.id}>
                  <td>
                    <img src={slide.imageUrl} alt="" className="slide-thumb" />
                  </td>
                  <td>{slide.altText || <span className="text-muted">—</span>}</td>
                  <td>{slide.sortOrder ?? 0}</td>
                  <td>
                    {slide.active !== false ? (
                      <span className="badge badge-primary">Visible</span>
                    ) : (
                      <span className="text-muted">Hidden</span>
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link
                        to={`/admin/home/${slide.id}/edit`}
                        className="btn btn-sm btn-outline"
                      >
                        <Pencil size={13} aria-hidden="true" /> Edit
                      </Link>
                      <button
                        className="btn btn-sm btn-outline btn-delete"
                        onClick={() => handleDelete(slide)}
                        disabled={removingId === slide.id}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                        {removingId === slide.id ? ' Deleting...' : ' Delete'}
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

export default AdminHomeSlides;
