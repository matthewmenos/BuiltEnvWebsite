
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react';
import { useAuth } from '../context/ThemeContext';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';
import SearchInput from '../components/SearchInput';
import { CardGridSkeleton } from '../components/Skeleton';
import { deleteUploadedFile, readFileAsDataUrl, uploadUrl } from '../lib/upload';

interface StoredFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AdminGallery: React.FC = () => {
  const { token } = useAuth();
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [query, setQuery] = useState('');
  const { confirm } = useConfirm();
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/files', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = (await res.json().catch(() => ({}))) as {
        items?: StoredFile[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || 'Could not load uploads');
      setFiles(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load uploads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) =>
      [f.name, f.mimeType]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [files, query]);

  const upload = async (file: File) => {
    setError('');
    setUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const res = await fetch('/api/admin/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          files: [{ name: file.name, mimeType: file.type, dataUrl }],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      await load();
      toast.success(`"${file.name}" uploaded`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleFiles = (list: FileList | null) => {
    Array.from(list ?? []).forEach((f) => {
      if (f.type.startsWith('image/')) void upload(f);
    });
  };

  const handleDelete = async (file: StoredFile) => {
    const ok = await confirm({
      message: `Delete "${file.name}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    setError('');
    try {
      await deleteUploadedFile(file.id, token);
      await load();
      toast.success(`"${file.name}" deleted`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div>
      <h1 className="page-title">Gallery Uploads</h1>
      <p className="page-description">
        Upload image files to the library. Images are stored in Cloudflare R2
        and can be selected when editing gallery items, news, events and
        homepage slides.
      </p>

      {error && <div className="login-error">{error}</div>}

      <div className="admin-section-header">
        <h2>All Uploads</h2>
        <div className="section-actions">
          <label className="btn btn-primary">
            {uploading ? (
              <Loader2 size={15} className="spin" aria-hidden="true" />
            ) : (
              <Upload size={15} aria-hidden="true" />
            )}
            {uploading ? ' Uploading' : ' Upload Image'}
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </div>

      <div
        className={`upload-area${dragOver ? ' dragover' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <div className="upload-icon">
          {uploading ? (
            <Loader2 size={30} className="spin" aria-hidden="true" />
          ) : (
            <ImagePlus size={30} aria-hidden="true" />
          )}
        </div>
        <div className="upload-text">
          {uploading ? 'Uploading' : 'Drag & drop images here'}
        </div>
        <div className="upload-hint">PNG, JPG or WebP up to 3 MB each.</div>
      </div>

      {loading ? (
        <CardGridSkeleton cards={6} />
      ) : files.length === 0 ? (
        <div className="empty-state">
          <ImagePlus size={44} aria-hidden="true" />
          <p>No uploads yet. Add an image to build your library.</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search by file name or type"
              resultCount={filtered.length}
            />
          </div>
          {filtered.length === 0 ? (
            <div className="empty-state">No uploads match your search.</div>
          ) : (
          <div className="gallery-list">
            {filtered.map((file) => (
            <div key={file.id} className="gallery-item-card">
              <div className="gallery-item-img">
                <img src={uploadUrl(file.id)} alt={file.name} loading="lazy" />
              </div>
              <div className="gallery-item-body">
                <div className="gallery-item-title">{file.name}</div>
                <div className="gallery-item-meta">
                  <span>{file.mimeType}</span>
                  <span>{formatBytes(file.size)}</span>
                  <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                </div>
                <div className="gallery-item-actions" style={{ marginTop: 12 }}>
                  <a
                    className="btn btn-sm btn-outline"
                    href={uploadUrl(file.id)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View
                  </a>
                  <button
                    className="btn btn-sm btn-outline btn-delete"
                    onClick={() => handleDelete(file)}
                  >
                    <span className="btn-delete-icon">
                      <Trash2 size={14} aria-hidden="true" />
                    </span>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminGallery;
