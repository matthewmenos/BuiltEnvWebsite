import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../context/ThemeContext';
import { programmes as programmeSeed } from '../data/programmes';
import { news as newsSeed } from '../data/news';
import { events as eventSeed } from '../data/events';
import { galleryItems as gallerySeed } from '../data/gallery';
import { Notice as noticeSeed } from '../data/notices';

type ResourceKey = 'programmes' | 'news' | 'events' | 'gallery' | 'notices';

interface Field {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'datetime-local';
  required?: boolean;
  rows?: number;
  placeholder?: string;
}

interface ResourceConfig {
  titleSingular: string;
  listPath: string;
  description: string;
  fields: Field[];
  /** Prefill from the static seed data the list pages render. */
  findStatic: (id: string) => Record<string, string> | undefined;
}

/** '2026-10-15T09:00:00' or ISO-with-Z → 'YYYY-MM-DDTHH:mm' for datetime-local. */
const toInputDateTime = (value: string): string => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

// Field names mirror the API keys used by api/admin/<resource>.ts
// (see `required` / `buildValues` there) so every key is sent on save.
const RESOURCES: Record<ResourceKey, ResourceConfig> = {
  programmes: {
    titleSingular: 'Programme',
    listPath: '/admin/programmes',
    description: 'Programmes are listed on the public Programmes page. Required fields are marked with *.',
    fields: [
      { name: 'title', label: 'Title *', required: true },
      { name: 'shortCode', label: 'Short code *', required: true, placeholder: 'e.g. QS' },
      { name: 'faculty', label: 'Faculty *', required: true },
      { name: 'duration', label: 'Duration *', required: true, placeholder: 'e.g. 12 months (full-time)' },
      { name: 'description', label: 'Description *', type: 'textarea', rows: 5, required: true },
      { name: 'admission', label: 'Admission requirements', type: 'textarea', rows: 3 },
      { name: 'euFees', label: 'EU fees', placeholder: 'e.g. £15,500' },
      { name: 'nonEuFees', label: 'Non-EU fees', placeholder: 'e.g. £26,000' },
      { name: 'accreditation', label: 'Accreditation' },
    ],
    findStatic: (id) => {
      const p = programmeSeed.find((x) => x.id === id);
      if (!p) return undefined;
      return {
        title: p.title,
        shortCode: p.shortCode,
        faculty: p.faculty,
        duration: p.duration,
        description: p.description,
        admission: p.admission,
        euFees: p.euFees,
        nonEuFees: p.nonEuFees,
        accreditation: p.accreditation,
      };
    },
  },
  news: {
    titleSingular: 'News Article',
    listPath: '/admin/news',
    description: 'News articles appear on the public News page and the homepage. Required fields are marked with *.',
    fields: [
      { name: 'title', label: 'Title *', required: true },
      { name: 'author', label: 'Author *', required: true, placeholder: 'e.g. Dr. Sarah Thompson' },
      { name: 'category', label: 'Category *', required: true, placeholder: 'e.g. Research' },
      { name: 'image', label: 'Image URL', placeholder: '/assets/news/…' },
      { name: 'summary', label: 'Summary *', type: 'textarea', rows: 2, required: true },
      { name: 'body', label: 'Body *', type: 'textarea', rows: 8, required: true },
    ],
    findStatic: (id) => {
      const n = newsSeed.find((x) => x.id === id);
      if (!n) return undefined;
      return {
        title: n.title,
        author: n.author,
        category: n.category,
        image: n.image,
        summary: n.summary,
        body: n.body,
      };
    },
  },
  events: {
    titleSingular: 'Event',
    listPath: '/admin/events',
    description: 'Events appear on the public Events page and the homepage. Required fields are marked with *.',
    fields: [
      { name: 'title', label: 'Title *', required: true },
      { name: 'location', label: 'Location *', required: true },
      { name: 'startTime', label: 'Starts *', type: 'datetime-local', required: true },
      { name: 'endTime', label: 'Ends *', type: 'datetime-local', required: true },
      { name: 'category', label: 'Category', placeholder: 'e.g. Conference' },
      { name: 'image', label: 'Image URL', placeholder: '/assets/events/…' },
      { name: 'description', label: 'Description *', type: 'textarea', rows: 5, required: true },
    ],
    findStatic: (id) => {
      const e = eventSeed.find((x) => x.id === id);
      if (!e) return undefined;
      return {
        title: e.title,
        location: e.location,
        startTime: toInputDateTime(e.startTime),
        endTime: toInputDateTime(e.endTime),
        category: e.category,
        image: e.image,
        description: e.description,
      };
    },
  },
  gallery: {
    titleSingular: 'Gallery Image',
    listPath: '/admin/gallery',
    description: 'Gallery images appear in the public Gallery. Paste a direct image URL. Required fields are marked with *.',
    fields: [
      { name: 'title', label: 'Title *', required: true },
      { name: 'imageUrl', label: 'Image URL *', required: true, placeholder: '/assets/gallery/…' },
      { name: 'credit', label: 'Credit', placeholder: 'Photographer / source' },
      { name: 'description', label: 'Description *', type: 'textarea', rows: 4, required: true },
    ],
    findStatic: (id) => {
      const g = gallerySeed.find((x) => x.id === id);
      if (!g) return undefined;
      return { title: g.title, imageUrl: g.image, description: g.description, credit: '' };
    },
  },
  notices: {
    titleSingular: 'Notice',
    listPath: '/admin/notices',
    description: 'Notices are announcements shown to site visitors. Required fields are marked with *.',
    fields: [
      { name: 'title', label: 'Title *', required: true },
      { name: 'author', label: 'Author *', required: true, placeholder: 'e.g. Department Office' },
      { name: 'expiresAt', label: 'Expires (optional)', type: 'datetime-local' },
      { name: 'body', label: 'Body *', type: 'textarea', rows: 6, required: true },
    ],
    findStatic: (id) => {
      const n = noticeSeed.find((x) => x.id === id);
      if (!n) return undefined;
      // Seed notices have `content` + no author; the API uses `body`/`author`.
      return { title: n.title, body: n.content, author: '', expiresAt: '' };
    },
  },
};

const AdminResourceForm: React.FC<{ resource: ResourceKey }> = ({ resource }) => {
  const config = RESOURCES[resource];
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const { token } = useAuth();

  const emptyForm = (): Record<string, string> =>
    Object.fromEntries(config.fields.map((f) => [f.name, '']));

  const [form, setForm] = useState<Record<string, string>>(emptyForm);
  const [status, setStatus] = useState<'idle' | 'saving'>('idle');
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  const apiPath = `/api/admin/${resource}`;

  // API row → form values (field names mirror the API keys).
  const pickRow = (row: Record<string, unknown>): Record<string, string> => {
    const next = emptyForm();
    for (const f of config.fields) {
      const v = row[f.name];
      if (v === undefined || v === null) continue;
      next[f.name] =
        f.type === 'datetime-local' ? toInputDateTime(String(v)) : String(v);
    }
    return next;
  };

  useEffect(() => {
    setForm(emptyForm());
    setNotFound(false);
    if (!id) return;

    // 1) The list page renders seed data, so prefill from the seed first.
    const staticHit = config.findStatic(id);
    if (staticHit) {
      setForm({ ...emptyForm(), ...staticHit });
      return;
    }

    // 2) Otherwise fall back to the database (id exists only in the API).
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${apiPath}?limit=200`);
        if (!res.ok) return;
        const data = await res.json().catch(() => ({}) as { items?: unknown });
        const items = Array.isArray(data.items) ? data.items : [];
        const row = items.find(
          (r: unknown): r is Record<string, unknown> =>
            !!r && typeof r === 'object' && (r as { id?: unknown }).id === id
        );
        if (cancelled) return;
        if (row) setForm(pickRow(row));
        else setNotFound(true);
      } catch {
        if (!cancelled) setNotFound(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('saving');
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const send = (method: string, url: string) =>
        fetch(url, { method, headers, body: JSON.stringify(form) });

      let response = await send(
        isNew ? 'POST' : 'PUT',
        isNew ? apiPath : `${apiPath}/${id}`
      );
      if (!isNew && response.status === 404) {
        // The id isn't in the database (the list shows seed data) —
        // create the record instead of failing the save.
        response = await send('POST', apiPath);
      }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Save failed');
      }
      navigate(config.listPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
      setStatus('idle');
    }
  };

  return (
    <div>
      <Link to={config.listPath} className="btn btn-sm btn-outline">
        <ArrowLeft size={14} aria-hidden="true" /> Back to{' '}
        {config.listPath.split('/').pop()}
      </Link>
      <h1 className="page-title">
        {isNew ? `Add ${config.titleSingular}` : `Edit ${config.titleSingular}`}
      </h1>
      <p className="page-description">{config.description}</p>

      {notFound && (
        <div className="login-error">
          No existing record was found for this id — filling the form and
          saving will create a new entry.
        </div>
      )}
      {error && <div className="login-error">{error}</div>}

      <form className="card admin-form" onSubmit={handleSubmit}>
        {config.fields.map((f) => {
          const fieldId = `field-${f.name}`;
          const value = form[f.name] ?? '';
          if (f.type === 'textarea') {
            return (
              <div className="form-group" key={f.name}>
                <label htmlFor={fieldId}>{f.label}</label>
                <textarea
                  id={fieldId}
                  name={f.name}
                  rows={f.rows ?? 4}
                  value={value}
                  onChange={handleChange}
                  required={f.required}
                  placeholder={f.placeholder}
                />
              </div>
            );
          }
          return (
            <div className="form-group" key={f.name}>
              <label htmlFor={fieldId}>{f.label}</label>
              <input
                id={fieldId}
                name={f.name}
                type={f.type ?? 'text'}
                value={value}
                onChange={handleChange}
                required={f.required}
                placeholder={f.placeholder}
              />
            </div>
          );
        })}
        <div className="admin-form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={status === 'saving'}
          >
            <Save size={15} aria-hidden="true" />
            {status === 'saving' ? ' Saving...' : ' Save'}
          </button>
          <Link to={config.listPath} className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AdminResourceForm;
