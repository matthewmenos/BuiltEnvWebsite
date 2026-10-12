import React from 'react';
import { Link } from 'react-router-dom';
import { IGalleryItem } from 'shared/schema';
import { usePublicList } from '../hooks/usePublicResource';
import { mediaUrl } from '../lib/upload';
import { CardGridSkeleton } from '../components/Skeleton';

/**
 * Gallery rows come back from the API as `galleryImages` (imageUrl, credit,
 * featured, albumId); map them onto the IGalleryItem shape the markup renders.
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

const toItem = (row: GalleryRow): IGalleryItem => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category || row.credit || '',
  image: row.image || row.imageUrl || '',
  albumId: row.albumId ?? null,
});

const Gallery: React.FC = () => {
  const photos = usePublicList<GalleryRow>('/api/admin/gallery', 200);
  const albumsRes = usePublicList<AlbumRow>('/api/admin/gallery-albums', 100);
  const loading = photos.loading || albumsRes.loading;
  const error = photos.error || albumsRes.error;

  // Only active albums are openable; their photos live inside the album.
  const albums = albumsRes.items
    .filter((a) => a.active !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const openAlbumIds = new Set(albums.map((a) => a.id));
  // Photos without an open album (unassigned, or album deleted/hidden) stay in All Photos.
  const ungrouped = photos.items.filter(
    (row) => !row.albumId || !openAlbumIds.has(row.albumId)
  );
  const countFor = (albumId: string) =>
    photos.items.filter((row) => row.albumId === albumId).length;
  const coverFor = (album: AlbumRow): string => {
    if (album.coverImage) return album.coverImage;
    const first = photos.items.find((row) => row.albumId === album.id);
    return first ? first.imageUrl || first.image || '' : '';
  };

  return (
    <div>
      <h1 className="page-title">Gallery</h1>
      <p className="page-description">
        A visual journey through the work, people, and events of the Department
        of Built Environment.
      </p>

      {loading ? (
        <CardGridSkeleton cards={6} />
      ) : error ? (
        <div className="login-error">{error}</div>
      ) : albums.length === 0 && ungrouped.length === 0 ? (
        <div className="empty-state">
          No gallery images have been published yet. Please check back soon.
        </div>
      ) : (
        <>
          {albums.length > 0 && (
            <section aria-label="Photo albums" style={{ marginBottom: 40 }}>
              <div className="section-head">
                <h2 className="section-title">Albums</h2>
              </div>
              <div className="gallery-grid">
                {albums.map((album) => {
                  const count = countFor(album.id);
                  return (
                    <Link
                      to={`/gallery/albums/${album.id}`}
                      className="gallery-item"
                      key={album.id}
                    >
                      <div className="gallery-image">
                        <img
                          src={mediaUrl(coverFor(album))}
                          alt={album.title}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="gallery-overlay">
                        <h3 className="gallery-title">{album.title}</h3>
                        <p className="gallery-category">
                          {count} {count === 1 ? 'photo' : 'photos'}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {(ungrouped.length > 0 || albums.length === 0) && (
            <section aria-label="All photos">
              {albums.length > 0 && (
                <div className="section-head">
                  <h2 className="section-title">All Photos</h2>
                </div>
              )}
              <div className="gallery-grid">
                {ungrouped.map((row) => {
                  const item = toItem(row);
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
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Gallery;
