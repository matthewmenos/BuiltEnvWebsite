import React from 'react';
import { Link } from 'react-router-dom';
import { galleryItems as galleryData } from '../data/gallery';
import { IGalleryItem } from 'shared/schema';

const Gallery: React.FC = () => {
  return (
    <div>
      <h1 className="page-title">Gallery</h1>
      <p className="page-description">
        A visual journey through the work, people, and events of the Department
        of Built Environment.
      </p>

      <div className="gallery-grid">
        {galleryData.map((item: IGalleryItem) => (
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
    </div>
  );
};

export default Gallery;
