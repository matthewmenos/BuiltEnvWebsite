import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { galleryItems as galleryData } from '../data/gallery';
import { IGalleryItem } from 'shared/schema';

const GalleryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const item = galleryData.find((g: IGalleryItem) => g.id === id);

  if (!item) {
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
