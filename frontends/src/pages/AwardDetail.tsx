import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Award } from 'lucide-react';
import type { IAward } from 'shared/schema';
import { usePublicItem } from '../hooks/usePublicResource';
import { Skeleton } from '../components/Skeleton';
import { mediaUrl } from '../lib/upload';

/**
 * Public award detail page (/awards/:id) — reached by clicking an award in
 * the homepage marquee. Shows the full-size image, title and detail text.
 */
const AwardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    item: award,
    loading,
    error,
    notFound,
  } = usePublicItem<IAward>('/api/admin/awards', id);

  if (loading) {
    return (
      <div>
        <Skeleton width="35%" height={24} />
        <div style={{ height: 20 }} />
        <Skeleton width="100%" height={300} radius={12} />
      </div>
    );
  }

  if (error || notFound || !award) {
    return (
      <div className="error-state">
        <h2>Award not found</h2>
        <Link to="/" className="btn btn-primary">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="award-page">
      <div className="award-page-top">
        <Link to="/" className="btn btn-sm btn-outline">
          <ArrowLeft size={14} aria-hidden="true" /> Back to home
        </Link>
      </div>
      <article className="award-hero">
        <div className="award-hero-media">
          {award.image ? (
            <img src={mediaUrl(award.image)} alt={award.title} />
          ) : (
            <span className="award-hero-icon" aria-hidden="true">
              <Award size={120} />
            </span>
          )}
        </div>
        <div className="award-hero-body">
          <h1 className="award-hero-title">{award.title}</h1>
          {award.detail && (
            <p className="award-hero-detail">{award.detail}</p>
          )}
        </div>
      </article>
    </div>
  );
};

export default AwardDetail;