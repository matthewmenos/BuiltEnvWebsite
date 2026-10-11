import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../context/ThemeContext';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import ImageUpload from '../components/ImageUpload';

type ResourceKey =
  | 'programmes'
  | 'news'
  | 'events'
  | 'gallery'
  | 'notices'
  | 'home-slides'
  | 'research';

interface Field {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'datetime-local' | 'select' | 'image' | 'number';
  required?: boolean;
  rows?: number;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

interface ResourceConfig {
  titleSingular: string;
  listPath: string;
  description: string;
  fields: Field[];
}

/** '2026-10-15T09:00:00' or ISO-with-Z -> 'YYYY-MM-DDTHH:mm' for datetime-local. */
const toInputDateTime = (value: string): string => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

/** Date-ish columns rendered in datetime-local inputs. */
const DATE_FIELDS = new Set([
  'date',
  'eventDate',
  'publishedAt',
  'postedAt',
  'expiresAt',
]);
/** Numeric columns (schema uses integer for sortOrder). */
const NUMBER_FIELDS = new Set(['sortOrder']);

/** Convert form strings to ISO dates and numeric fields before sending. */
const formToPayload = (
  form: Record<string, string>,
  fields: Field[]
): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const value = form[f.name] ?? '';
    if (f.type === 'number' || NUMBER_FIELDS.has(f.name)) {
      const n = Number(value);
      out[f.name] = value === '' ? null : Number.isNaN(n) ? 0 : n;
    } else if (f.type === 'datetime-local' || DATE_FIELDS.has(f.name)) {
      out[f.name] = value ? new Date(value).toISOString() : null;
    } else {
      out[f.name] = value;
    }
  }
  return out;
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
      { name: 'euFees', label: 'EU fees', placeholder: 'e.g. 15,500' },
      { name: 'nonEuFees', label: 'Non-EU fees', placeholder: 'e.g. 26,000' },
      { name: 'accreditation', label: 'Accreditation' },
    ],
  },
  news: {
    titleSingular: 'News Article',
    listPath: '/admin/news',
    description: 'News articles appear on the public News page. Required fields are marked with *.',
    fields: [
      { name: 'title', label: 'Title *', required: true },
      { name: 'summary', label: 'Summary *', type: 'textarea', rows: 3, required: true },
      { name: 'body', label: 'Content *', type: 'textarea', rows: 8, required: true },
      { name: 'author', label: 'Author' },
      { name: 'category', label: 'Category' },
      { name: 'image', label: 'Image', type: 'image' },
      { name: 'date', label: 'Published date', type: 'datetime-local' },
    ],
  },
  events: {
    titleSingular: 'Event',
    listPath: '/admin/events',
    description: 'Events appear on the public Events page. Required fields are marked with *.',
    fields: [
      { name: 'title', label: 'Title *', required: true },
      { name: 'description', label: 'Description *', type: 'textarea', rows: 5, required: true },
      { name: 'location', label: 'Location *', required: true },
      { name: 'startTime', label: 'Starts *', type: 'datetime-local', required: true },
      { name: 'endTime', label: 'Ends *', type: 'datetime-local', required: true },
      { name: 'category', label: 'Category', placeholder: 'e.g. Workshop' },
      { name: 'image', label: 'Image', type: 'image' },
    ],
  },
  gallery: {
    titleSingular: 'Gallery Item',
    listPath: '/admin/gallery',
    description: 'Gallery items appear on the public Gallery page. Required fields are marked with *.',
    fields: [
      { name: 'title', label: 'Title *', required: true },
      { name: 'imageUrl', label: 'Image *', type: 'image', required: true },
      { name: 'category', label: 'Category', placeholder: 'e.g. Studio' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4 },
      { name: 'credit', label: 'Credit / photographer' },
    ],
  },
  notices: {
    titleSingular: 'Notice',
    listPath: '/admin/notices',
    description: 'Notices appear in the Latest Notices panel on the public Resources page. Required fields are marked with *.',
    fields: [
      { name: 'title', label: 'Title *', required: true },
      { name: 'body', label: 'Body *', type: 'textarea', rows: 6, required: true },
      { name: 'author', label: 'Author' },
      { name: 'expiresAt', label: 'Expiry date', type: 'datetime-local' },
    ],
  },
  'home-slides': {
    titleSingular: 'Homepage Slide',
    listPath: '/admin/home',
    description: 'Slides rotate as the homepage hero background. Required fields are marked with *.',
    fields: [
      { name: 'imageUrl', label: 'Image *', type: 'image', required: true },
      { name: 'altText', label: 'Alt text', placeholder: 'Describe the image' },
      { name: 'sortOrder', label: 'Sort order', type: 'number', placeholder: 'e.g. 1' },
      { name: 'active', label: 'Active', type: 'select', options: [ { value: 'true', label: 'Yes' }, { value: 'false', label: 'No' } ] },
    ],
  },
  research: {
    titleSingular: 'Research Area',
    listPath: '/admin/research',
    description: 'Research areas appear on the public Research page. Required fields are marked with *.',
    fields: [
      { name: 'title', label: 'Title *', required: true },
      { name: 'description', label: 'Description *', type: 'textarea', rows: 5, required: true },
      { name: 'icon', label: 'Icon', placeholder: 'e.g. microscope (Lucide icon name)' },
      { name: 'sortOrder', label: 'Display order', type: 'number', placeholder: 'e.g. 0' },
      { name: 'active', label: 'Active', type: 'select', options: [ { value: 'true', label: 'Yes' }, { value: 'false', label: 'No' } ] },
    ],
  },
};
const AdminResourceForm: React.FC<{ resource: ResourceKey }> = ({ resource }) => {
  const config = RESOURCES[resource];
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const { token } = useAuth();
  const { confirm } = useConfirm();
  const toast = useToast();

  const emptyForm = (): Record<string, string> =>
    Object.fromEntries(config.fields.map(f => [f.name, f.type === 'select' ? (f.options?.[0]?.value ?? '') : '']));

  const [form, setForm] = useState<Record<string, string>>(emptyForm);
  const [status, setStatus] = useState<'idle' | 'saving'>('idle');
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [dirty, setDirty] = useState(false);

  const { requestLeave } = useUnsavedChanges(dirty);
  const goToList = () => navigate(config.listPath);
  const guardedLeave = () => requestLeave(confirm, goToList);

  const apiPath = `/api/admin/${resource}`;

  const pickRow = (row: Record<string, unknown>): Record<string, string> => {
    const next = emptyForm();
    for (const f of config.fields) {
      const v = row[f.name];
      if (v === undefined || v === null) continue;
      next[f.name] = f.type === 'datetime-local' ? toInputDateTime(String(v)) : String(v);
    }
    return next;
  };

  useEffect(() => {
    setForm(emptyForm());
    setNotFound(false);
    setDirty(false);
    if (isNew || !id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${apiPath}/${id}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (res.status === 404) { if (!cancelled) setNotFound(true); return; }
        if (!res.ok) return;
        const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        const rec = (data.item ?? data) as Record<string, unknown>;
        if (cancelled || !rec || typeof rec !== 'object') return;
        setForm(pickRow(rec));
      } catch {
        // Leave the blank form; saving still works as a create.
      }
    })();
    return () => { cancelled = true; };
  }, [apiPath, id, isNew, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('saving');
    try {
      const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      const send = (method: string, url: string) => fetch(url, { method, headers, body: JSON.stringify(formToPayload(form, config.fields)) });
      let response = await send(isNew ? 'POST' : 'PUT', isNew ? apiPath : `${apiPath}/${id}`);
      if (!isNew && response.status === 404) { response = await send('POST', apiPath); }
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) { throw new Error(data.error || 'Save failed'); }
      setDirty(false);
      toast.success(isNew ? `${config.titleSingular} created` : `${config.titleSingular} updated`);
      navigate(config.listPath);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed';
      setError(message);
      toast.error(message);
      setStatus('idle');
    }
  };

  return (
    <div>
      <button type='button' className='btn btn-sm btn-outline' onClick={guardedLeave}>
        <ArrowLeft size={14} aria-hidden='true' /> Back to {config.listPath.split('/').pop()}
      </button>
      <h1 className='page-title'>{isNew ? `Add ${config.titleSingular}` : `Edit ${config.titleSingular}`}</h1>
      <p className='page-description'>{config.description}</p>

      {notFound && <div className='login-error'>No existing record was found for this id.</div>}
      {error && <div className='login-error'>{error}</div>}

      <form className='card admin-form' onSubmit={handleSubmit}>
        {config.fields.map((f) => {
          const fieldId = `field-${f.name}`;
          const value = form[f.name] ?? '';
          if (f.type === 'textarea') {
            return <div className='form-group' key={f.name}><label htmlFor={fieldId}>{f.label}</label><textarea id={fieldId} name={f.name} rows={f.rows ?? 4} value={value} onChange={handleChange} required={f.required} placeholder={f.placeholder} /></div>;
          }
          if (f.type === 'select') {
            return <div className='form-group' key={f.name}><label htmlFor={fieldId}>{f.label}</label><select id={fieldId} name={f.name} value={value} onChange={handleChange} required={f.required}>{(f.options ?? []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>;
          }
          if (f.type === 'image') {
            return <ImageUpload key={f.name} label={f.label.replace(/\s*\*$/, '')} required={f.required} value={value} token={token} onChange={url => { setForm(prev => ({ ...prev, [f.name]: url })); setDirty(true); }} helpText='Upload an image file (PNG, JPG or WebP up to 200 MB).' />;
          }
          return <div className='form-group' key={f.name}><label htmlFor={fieldId}>{f.label}</label><input id={fieldId} name={f.name} type={f.type ?? 'text'} value={value} onChange={handleChange} required={f.required} placeholder={f.placeholder} /></div>;
        })}
        <div className='admin-form-actions'>
          <button type='submit' className='btn btn-primary' disabled={status === 'saving'}><Save size={15} aria-hidden='true' /> {status === 'saving' ? ' Saving...' : ' Save'}</button>
          <button type='button' className='btn btn-outline' onClick={guardedLeave}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AdminResourceForm;
