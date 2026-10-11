import React, { useRef, useState } from 'react';
import { File as FileIcon, Loader2, Trash2, Upload } from 'lucide-react';
import { deleteUploadedFile, idFromUploadUrl, uploadFile } from '../lib/upload';

interface FileUploadProps {
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
 * Generic file picker (any type — PDF, image, doc, …). Selecting a file
 * uploads it to Cloudflare R2 and stores the resulting `/api/uploads/<id>`
 * URL. Unlike ImageUpload it shows a download link instead of an image
 * preview, so it suits handbooks, timetables, logbooks and forms.
 */
const FileUpload: React.FC<FileUploadProps> = ({
  value,
  onChange,
  token,
  label = 'File',
  required = false,
  helpText = 'Any file type up to 200 MB.',
  name,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const { url, id: newId } = await uploadFile(file, token);
      const prevId = idFromUploadUrl(value);
      if (prevId && prevId !== newId) {
        deleteUploadedFile(prevId, token).catch(() => {});
      }
      setFileName(file.name);
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
    setFileName('');
    onChange('');
  };

  return (
    <div className="form-group image-upload">
      <label>
        {label}
        {required ? ' *' : ''}
      </label>

      {value ? (
        <div className="image-upload-preview file-upload-preview">
          <a
            className="file-upload-link"
            href={value}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileIcon size={16} aria-hidden="true" />
            <span>{fileName || 'View uploaded file'}</span>
          </a>
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
              <Upload size={30} aria-hidden="true" />
            )}
          </div>
          <div className="upload-text">
            {uploading ? 'Uploading…' : 'Click or drop a file to upload'}
          </div>
          <div className="upload-hint">{helpText}</div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        name={name}
        className="image-upload-input"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
};

export default FileUpload;