import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { IGalleryItem } from 'shared/schema';
import { usePublicItem, usePublicList } from '../hooks/usePublicResource';
import { mediaUrl } from '../lib/upload';
import { CardGridSkeleton } from '../components/Skeleton';

/**
 * Photo rows as returned by /api/admin/gallery (imageUrl, credit, albumId);
 * mapped onto the IGalleryItem shape the gallery markup renders.
 */
type GalleryRow = IGalleryItem & {
  imageUrl?: string;
  credit?: string;
  featured?: boolean;
  albumId?: string | null;
};

interface AlbumRow {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  sortOrder: number;
  active: boolean;
}

/** Public detail page for one gallery album: /gallery/albums/:id */
const GalleryAlbum: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    item: album,
    loading,
    error,
    notFound,
  } = usePublicItem<AlbumRow>('/api/admin/gallery-albums', id);
  const photos = usePublicList<GalleryRow>('/api/admin/gallery', 200);

  if (loading) {
    return (
      <div>
        <CardGridSkeleton cards={6} />
      </div>
    );
  }

  if (error || notFound || !album || album.active === false) {
    return (
      <div className="error-state">
        <h2>Album not found</h2>
        <Link to="/gallery" className="btn btn-primary">
          Back to gallery
        </Link>
      </div>
    );
  }

  const items = photos.items.filter((row) => row.albumId === album.id);

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Link to="/gallery" className="btn btn-sm btn-outline">
          Back to gallery
        </Link>
      </div>
      <h1 className="page-title">{album.title}</h1>
      {album.description && <p className="page-description">{album.description}</p>}

      {photos.loading ? (
        <CardGridSkeleton cards={6} />
      ) : photos.error ? (
        <div className="login-error">{photos.error}</div>
      ) : items.length === 0 ? (
        <div className="empty-state">No photos have been added to this album yet.</div>
      ) : (
        <div className="gallery-grid">
          {items.map((row) => {
            const item: IGalleryItem = {
              id: row.id,
              title: row.title,
              description: row.description,
              category: row.credit || '',
              image: row.imageUrl || row.image || '',
              albumId: row.albumId ?? null,
            };
            return (
              <Link to={`/gallery/${item.id}`} className="gallery-item" key={item.id}>
                <div className="gallery-image">
                  <img
                    src={mediaUrl(item.image)}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="gallery-overlay">
                  <h3 className="gallery-title">{item.title}</h3>
                  <p className="gallery-category">{item.category}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GalleryAlbum;