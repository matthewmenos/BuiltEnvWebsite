import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { IGalleryItem } from 'shared/schema';
import { usePublicItem } from '../hooks/usePublicResource';
import { Skeleton } from '../components/Skeleton';

type GalleryRow = IGalleryItem & {
  imageUrl?: string;
  credit?: string;
  featured?: boolean;
};

const GalleryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    item: row,
    loading,
    error,
    notFound,
  } = usePublicItem<GalleryRow>('/api/admin/gallery', id);
  const item: IGalleryItem | null = row
    ? {
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category || row.credit || '',
        image: row.image || row.imageUrl || '',
      }
    : null;

  if (loading) {
    return (
      <div>
        <Skeleton width="40%" height={28} />
        <div style={{ height: 16 }} />
        <Skeleton width="100%" height={320} />
        <div style={{ height: 16 }} />
        <Skeleton width="100%" height={14} />
      </div>
    );
  }

  if (error || notFound || !item) {
    return (
      <div className="error-state">
        <h2>Image not found</h2>
        <Link to="/gallery" className="btn btn-primary">
          Back to gallery
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">{item.title}</h1>
      <p className="page-description">{item.category}</p>

      <div className="gallery-detail">
        <div className="gallery-detail-image">
          <img src={item.image} alt={item.title} />
        </div>
        <div className="gallery-detail-content">
          <p>{item.description}</p>
          <div className="gallery-detail-actions">
            <Link to="/gallery" className="btn btn-outline">
              Back to gallery
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryDetail;
