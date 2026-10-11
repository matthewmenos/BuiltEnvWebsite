import React from 'react';
import { Link } from 'react-router-dom';
import { IGalleryItem } from 'shared/schema';
import { usePublicList } from '../hooks/usePublicResource';
import { CardGridSkeleton } from '../components/Skeleton';

/**
 * Gallery rows come back from the API as `galleryImages` (imageUrl, credit,
 * featured); map them onto the IGalleryItem shape the markup renders.
 */
type GalleryRow = IGalleryItem & {
  imageUrl?: string;
  credit?: string;
  featured?: boolean;
};

const toItem = (row: GalleryRow): IGalleryItem => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category || row.credit || '',
  image: row.image || row.imageUrl || '',
});

const Gallery: React.FC = () => {
  const { items, loading, error } = usePublicList<GalleryRow>(
    '/api/admin/gallery',
    100
  );
  const gallery = items.map(toItem);

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
      ) : gallery.length === 0 ? (
        <div className="empty-state">
          No gallery images have been published yet. Please check back soon.
        </div>
      ) : (
      <div className="gallery-grid">
        {gallery.map((item: IGalleryItem) => (
          <Link to={`/gallery/${item.id}`} className="gallery-item" key={item.id}>
            <div className="gallery-image">
              <img src={item.image} alt={item.title} />
            </div>
            <div className="gallery-overlay">
              <h3 className="gallery-title">{item.title}</h3>
              <p className="gallery-category">{item.category}</p>
            </div>
          </Link>
        ))}
      </div>
      )}
    </div>
  );
};

export default Gallery;
