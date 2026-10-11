import { useCallback, useEffect, useState } from 'react';

interface ListResponse<T> {
  items: T[];
  pagination?: { total: number; page: number; limit: number; pages: number };
}

export interface PublicList<T> {
  items: T[];
  loading: boolean;
  error: string;
  reload: () => void;
}

/**
 * Fetch a public (unauthenticated) admin list endpoint and expose the items.
 * Used by the public pages so all content comes from the database instead of
 * hardcoded seed data. Shows loading / error states; empty DB renders the
 * empty-state so it is obvious the admin needs to add content.
 */
export function usePublicList<T>(endpoint: string, limit = 100): PublicList<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const res = await fetch(`${endpoint}?limit=${limit}`);
        const data = (await res.json().catch(() => ({}))) as ListResponse<T> & {
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error || 'Could not load content');
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load content');
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [endpoint, limit]);

  useEffect(() => {
    const cleanup = reload();
    return cleanup;
  }, [reload]);

  const manualReload = useCallback(() => {
    reload();
  }, [reload]);

  return { items, loading, error, reload: manualReload };
}

export interface PublicItem<T> {
  item: T | null;
  loading: boolean;
  error: string;
  notFound: boolean;
}

/**
 * Fetch a single public item by id. Tries GET /<endpoint>/<id> first;
 * falls back to the list endpoint and finds the id client-side so detail
 * pages work against both shapes.
 */
export function usePublicItem<T extends { id: string }>(
  endpoint: string,
  id: string | undefined
): PublicItem<T> {
  const [item, setItem] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setItem(null);
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    setNotFound(false);
    (async () => {
      try {
        const direct = await fetch(
          `${endpoint}/${encodeURIComponent(id)}?limit=1`
        );
        if (direct.ok) {
          const data = await direct.json().catch(() => ({}));
          if (cancelled) return;
          if (data && typeof data === 'object' && 'item' in data && data.item) {
            setItem(data.item as T);
            return;
          }
        } else if (direct.status !== 404) {
          const data = await direct.json().catch(() => ({}));
          throw new Error(
            (data as { error?: string }).error || 'Could not load content'
          );
        }
        const res = await fetch(`${endpoint}?limit=100`);
        const data = (await res.json().catch(() => ({}))) as ListResponse<T> & {
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error || 'Could not load content');
        const found = (Array.isArray(data.items) ? data.items : []).find(
          (x) => x.id === id
        );
        if (found) {
          setItem(found);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load content');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [endpoint, id]);

  return { item, loading, error, notFound };
}
