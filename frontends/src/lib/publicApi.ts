import type {
  IAward,
  IEvent,
  IGalleryItem,
  INews,
  IProgramme,
  IResearchArea,
  IStaff,
} from 'shared/schema';

export interface SiteSettings {
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapQuery: string;
  [key: string]: string;
}

export const FALLBACK_SETTINGS: SiteSettings = {
  address:
    'Department of Built Environment, Pentecost University, Sowutuom, Accra, Ghana',
  phone: '+233 302 417 064',
  email: 'info@pentvars.edu.gh',
  hours: 'Monday - Friday: 8:00 AM - 5:00 PM',
  mapQuery: 'Pentecost University Sowutuom Accra Ghana',
};

interface ListResponse<T> {
  items: T[];
  pagination?: { total: number };
}

async function fetchList<T>(endpoint: string, limit = 100): Promise<T[]> {
  const res = await fetch(`${endpoint}?limit=${limit}`);
  const data = (await res.json().catch(() => ({}))) as ListResponse<T> & {
    error?: string;
  };
  if (!res.ok) throw new Error(data.error || 'Could not load content');
  return Array.isArray(data.items) ? data.items : [];
}

async function fetchItem<T extends { id: string }>(
  endpoint: string,
  id: string
): Promise<T | null> {
  // Query-param id: Vercel's edge does not route /api/admin/<resource>/<id>
  // to the [...all] catch-all (it 404s at the platform level), but
  // handleResource.getId() reads req.query.id first — so single-segment
  // URLs with ?id= are the only shape that reliably reaches the function.
  try {
    const direct = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`);
    if (direct.ok) {
      const data = await direct.json().catch(() => ({}));
      const item = (data as { item?: T }).item;
      if (item) return item;
    } else if (direct.status !== 404) {
      const data = (await direct.json().catch(() => ({}))) as {
        error?: string;
      };
      throw new Error(data.error || 'Could not load content');
    }
  } catch (err) {
    // A failed direct fetch falls through to the list lookup below so a
    // missing single-item route never breaks the detail pages.
    if (err instanceof Error && err.message !== 'Could not load content') {
      throw err;
    }
  }
  // …otherwise find the id in the list response.
  const items = await fetchList<T>(endpoint);
  return items.find((x) => x.id === id) ?? null;
}

export const publicApi = {
  listProgrammes: () => fetchList<IProgramme>('/api/admin/programmes', 100),
  getProgramme: (id: string) =>
    fetchItem<IProgramme>('/api/admin/programmes', id),
  listNews: () => fetchList<INews>('/api/admin/news', 100),
  getNews: (id: string) => fetchItem<INews>('/api/admin/news', id),
  listEvents: () => fetchList<IEvent>('/api/admin/events', 100),
  getEvent: (id: string) => fetchItem<IEvent>('/api/admin/events', id),
  listStaff: () => fetchList<IStaff>('/api/admin/staff', 100),
  getStaff: (id: string) => fetchItem<IStaff>('/api/admin/staff', id),
  listGallery: () => fetchList<IGalleryItem>('/api/admin/gallery', 100),
  getGalleryItem: (id: string) =>
    fetchItem<IGalleryItem>('/api/admin/gallery', id),
  listResearch: () => fetchList<IResearchArea>('/api/admin/research', 50),
  listActiveResearch: async () => {
    const areas = await fetchList<IResearchArea>('/api/admin/research', 50);
    return areas
      .filter((a) => a.active !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  },
  listActiveAwards: async (): Promise<IAward[]> => {
    const awards = await fetchList<IAward>('/api/admin/awards', 100);
    return awards
      .filter((a) => a.active !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  },
  listActiveNotices: async () => {
    const items = await fetchList<{
      id: string;
      title: string;
      body: string;
      postedAt?: string;
      expiresAt?: string | null;
    }>('/api/admin/notices', 100);
    const now = Date.now();
    return items
      .filter((n) => !n.expiresAt || new Date(n.expiresAt).getTime() > now)
      .sort(
        (a, b) =>
          new Date(b.postedAt ?? 0).getTime() -
          new Date(a.postedAt ?? 0).getTime()
      )
      .slice(0, 6);
  },
  getSettings: async (): Promise<SiteSettings> => {
    try {
      const items = await fetchList<{ key: string; value: string }>(
        '/api/admin/site-settings',
        100
      );
      const merged: SiteSettings = { ...FALLBACK_SETTINGS };
      for (const row of items) {
        if (row && typeof row.key === 'string') merged[row.key] = row.value ?? '';
      }
      return merged;
    } catch {
      return { ...FALLBACK_SETTINGS };
    }
  },
  submitContact: async (input: {
    name: string;
    email: string;
    subject: string;
    message: string;
    phone: string;
  }) => {
    const res = await fetch('/api/admin/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
      throw new Error(
        (data as { error?: string }).error || 'Could not send message'
      );
    return data;
  },
};
