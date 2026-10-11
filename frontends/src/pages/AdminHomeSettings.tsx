import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Play, Save } from 'lucide-react';
import { useAuth } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Skeleton } from '../components/Skeleton';
import { getVideoEmbed } from '../lib/embed';

/**
 * Admin → Homepage Settings.
 *
 * Writes the keyed `site_settings` resource (POST /api/admin/site-settings
 * accepts `{ settings: { key: value, … } }` and upserts each key), so the
 * homepage hero copy and the intro video stop being hardcoded.
 */

/** Editable setting keys → the site_settings row key they map to. */
interface SettingsField {
  key: string;
  label: string;
  type?: 'text' | 'textarea';
  rows?: number;
  placeholder?: string;
  hint?: string;
}
const SETTINGS_FIELDS: SettingsField[] = [
  { key: 'heroEyebrow', label: 'Hero eyebrow', placeholder: 'Pentecost University · Sowutuom, Accra' },
  { key: 'heroTitle', label: 'Hero title', placeholder: 'Building the future of the built environment' },
  { key: 'heroSubtitle', label: 'Hero subtitle', type: 'textarea', rows: 3, placeholder: 'Quantity Surveying, Construction, Architecture and Planning…' },
  { key: 'videoTitle', label: 'Video title', placeholder: 'Welcome to the Department' },
  {
    key: 'videoUrl',
    label: 'Video URL',
    placeholder: 'https://www.youtube.com/watch?v=… or a direct .mp4 link',
    hint: 'Paste a YouTube/Vimeo link, or a direct video file URL (e.g. an R2 .mp4 link).',
  },
];

type SettingsForm = Record<string, string>;

const emptyForm = (): SettingsForm =>
  SETTINGS_FIELDS.reduce<SettingsForm>((acc, f) => {
    acc[f.key] = '';
    return acc;
  }, {});

const AdminHomeSettings: React.FC = () => {
  const { token } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState<SettingsForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/site-settings?limit=100');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not load settings');
      const rows: Array<{ key: string; value: string }> = Array.isArray(data.items)
        ? data.items
        : [];
      const next = emptyForm();
      for (const row of rows) {
        if (row && typeof row.key === 'string' && row.key in next) {
          next[row.key] = row.value ?? '';
        }
      }
      setForm(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // Only send keys that actually have content so empty fields never
      // overwrite good stored values with blanks.
      const settings: SettingsForm = {};
      for (const f of SETTINGS_FIELDS) {
        const value = form[f.key];
        if (value && value.trim() !== '') {
          settings[f.key] = value;
        }
      }
      const res = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Save failed');
      toast.success('Homepage settings saved');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const embed = getVideoEmbed(form.videoUrl || '');

  return (
    <div>
      <a href="/admin/dashboard" className="btn btn-sm btn-outline">
        <ArrowLeft size={14} aria-hidden="true" /> Back to dashboard
      </a>
      <h1 className="page-title">Homepage Settings</h1>
      <p className="page-description">
        Control the homepage hero text and the introductory video. Leave a field
        blank to fall back to the built-in default.
      </p>

      {error && <div className="login-error">{error}</div>}

      <form className="card admin-form" onSubmit={handleSubmit}>
        {loading ? (
          <div style={{ display: 'grid', gap: 18 }}>
            <Skeleton width="40%" height={18} />
            <Skeleton height={40} />
            <Skeleton width="35%" height={18} />
            <Skeleton height={72} />
          </div>
        ) : (
          <>
            {SETTINGS_FIELDS.map((f) => {
              const fieldId = `field-${f.key}`;
              const hint = f.hint;
              const value = form[f.key] ?? '';
              if (f.type === 'textarea') {
                return (
                  <div className="form-group" key={f.key}>
                    <label htmlFor={fieldId}>{f.label}</label>
                    <textarea
                      id={fieldId}
                      name={f.key}
                      rows={f.rows ?? 3}
                      value={value}
                      onChange={handleChange}
                      placeholder={f.placeholder}
                    />
                    {hint && <p className="form-hint">{hint}</p>}
                  </div>
                );
              }
              return (
                <div className="form-group" key={f.key}>
                  <label htmlFor={fieldId}>{f.label}</label>
                  <input
                    id={fieldId}
                    name={f.key}
                    type="text"
                    value={value}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                  />
                  {hint && <p className="form-hint">{hint}</p>}
                </div>
              );
            })}

            {embed && (
              <div className="form-group">
                <label>Video preview</label>
                <div className="video-preview">
                  {embed.kind === 'file' ? (
                    <video src={embed.src} controls preload="metadata" />
                  ) : (
                    <iframe
                      src={embed.src}
                      title="Video preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
                <p className="form-hint">
                  <Play size={13} aria-hidden="true" /> Detected:{' '}
                  {embed.kind === 'file' ? 'direct video file' : embed.kind}
                </p>
              </div>
            )}
          </>
        )}

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving || loading}>
            <Save size={15} aria-hidden="true" /> {saving ? ' Saving…' : ' Save'}
          </button>
          <a href="/admin/dashboard" className="btn btn-outline">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
};

export default AdminHomeSettings;

