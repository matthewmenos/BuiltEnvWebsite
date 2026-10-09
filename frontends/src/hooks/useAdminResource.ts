import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/ThemeContext';

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface ListResponse<T> {
  items: T[];
  pagination?: Pagination;
}

export interface AdminResource<T> {
  items: T[];
  total: number;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
  remove: (id: string) => Promise<boolean>;
  deletingId: string | null;
}

/**
 * Load a DB-backed admin resource list and expose a working `remove` that calls
 * DELETE with the admin Bearer token. Used by the list pages so their Delete
 * buttons actually delete rows instead of doing nothing.
 */
export function useAdminResource<T extends { id: string }>(
  endpoint: string,
  limit = 100
): AdminResource<T> {
  const { token } = useAuth();
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${endpoint}?limit=${limit}`);
      const data = (await res.json().catch(() => ({}))) as ListResponse<T> & {
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || 'Could not load data');
      setItems(Array.isArray(data.items) ? data.items : []);
      setTotal(typeof data.pagination?.total === 'number' ? data.pagination.total : data.items?.length ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load data');
    } finally {
      setLoading(false);
    }
  }, [endpoint, limit]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      if (!window.confirm('Delete this item? This cannot be undone.')) {
        return false;
      }
      setDeletingId(id);
      setError('');
      try {
        const res = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Delete failed');
        await reload();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Delete failed');
        return false;
      } finally {
        setDeletingId(null);
      }
    },
    [endpoint, token, reload]
  );

  return { items, total, loading, error, reload, remove, deletingId };
}
