import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/ThemeContext';

interface NewsRow {
  id: string;
  title?: string;
  author?: string;
  category?: string;
  publishedAt?: string;
}

const AdminNews: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/news?limit=100');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not load news');
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load news');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (item: NewsRow) => {
    if (!window.confirm(`Delete "${item.title ?? item.id}"? This cannot be undone.`))
      return;
    setError('');
    setRemovingId(item.id);
    try {
      const res = await fetch(`/api/admin/news/${item.id}`, {
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
      <h1 className="page-title">News</h1>
      <p className="page-description">Manage the department's news articles.</p>
      <div className="admin-section-header">
        <h2>All News Articles</h2>
        <Link to="/admin/news/new" className="btn btn-primary">
          <Plus size={15} aria-hidden="true" /> Add New Article
        </Link>
      </div>
      {error && <div className="login-error">{error}</div>}
      {loading ? (
        <p className="text-muted">Loading articles…</p>
      ) : items.length === 0 ? (
        <div className="empty-state">No articles yet.</div>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((article) => (
                <tr key={article.id}>
                  <td>
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString('en-GB')
                      : '—'}
                  </td>
                  <td>{article.title}</td>
                  <td>{article.author}</td>
                  <td>{article.category}</td>
                  <td>
                    <div className="table-actions">
                      <Link
                        to={`/admin/news/${article.id}/edit`}
                        className="btn btn-sm btn-outline"
                      >
                        <Pencil size={13} aria-hidden="true" /> Edit
                      </Link>
                      <button
                        className="btn btn-sm btn-outline btn-delete"
                        onClick={() => handleDelete(article)}
                        disabled={removingId === article.id}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                        {removingId === article.id ? ' Deleting...' : ' Delete'}
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

export default AdminNews;
