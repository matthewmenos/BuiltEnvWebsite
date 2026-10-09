import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react';
import { deleteUploadedFile, idFromUploadUrl, uploadFile } from '../lib/upload';

interface ImageUploadProps {
  /** Current stored value — a `/api/uploads/<id>` URL (or empty). */
  value: string;
  /** Called with the new public URL after a successful upload, or '' on remove. */
  onChange: (url: string) => void;
  token: string | null;
  label?: string;
  required?: boolean;
  helpText?: string;
  name?: string;
}

/**
 * File-based image picker. Selecting a file uploads it to Cloudflare R2 and stores the
 * resulting `/api/uploads/<id>` URL. Shows a live preview and a working remove
 * button (which deletes the file from the server when it is an uploaded one).
 */
const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  token,
  label = 'Image',
  required = false,
  helpText = 'PNG, JPG or WebP up to 3 MB.',
  name,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const { url, id: newId } = await uploadFile(file, token);
      // Remove the previous upload if it was one of ours (avoid orphan files).
      const prevId = idFromUploadUrl(value);
      if (prevId && prevId !== newId) {
        deleteUploadedFile(prevId, token).catch(() => {});
      }
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    const id = idFromUploadUrl(value);
    if (id) {
      deleteUploadedFile(id, token).catch(() => {});
    }
    onChange('');
  };

  return (
    <div className="form-group image-upload">
      <label>
        {label}
        {required ? ' *' : ''}
      </label>

      {value ? (
        <div className="image-upload-preview">
          <img src={value} alt={label} className="image-upload-thumb" />
          <div className="image-upload-preview-actions">
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 size={14} className="spin" aria-hidden="true" />
              ) : (
                <Upload size={14} aria-hidden="true" />
              )}
              {uploading ? ' Uploading…' : ' Replace'}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline btn-delete"
              onClick={handleRemove}
              disabled={uploading}
            >
              <Trash2 size={14} aria-hidden="true" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`upload-area${dragOver ? ' dragover' : ''}`}
          onClick={() => !uploading && inputRef.current?.click()}
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
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
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
            {uploading ? 'Uploading…' : 'Click or drop an image to upload'}
          </div>
          <div className="upload-hint">{helpText}</div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        name={name}
        className="image-upload-input"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
};

export default ImageUpload;
