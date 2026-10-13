import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award } from 'lucide-react';
import { IBreadcrumb, type IAward } from 'shared/schema';
import { usePublicItem } from '../hooks/usePublicResource';
import { Skeleton } from '../components/Skeleton';
import { mediaUrl } from '../lib/upload';

const breadcrumbs: IBreadcrumb[] = [
  { label: 'Home', href: '/' },
  { label: 'Award', href: '/' },
];

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
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href || crumb.label}>
              {index > 0 && <li className="breadcrumb-divider">/</li>}
              {crumb.href ? (
                <li className="breadcrumb-item">
                  <a href={crumb.href}>{crumb.label}</a>
                </li>
              ) : (
                <li className="breadcrumb-item" aria-current="page">
                  {crumb.label}
                </li>
              )}
            </React.Fragment>
          ))}
        </ol>
      </nav>

      <article className="card award-article">
        <div className="award-article-media">
          {award.image ? (
            <img src={mediaUrl(award.image)} alt={award.title} />
          ) : (
            <span className="award-article-icon" aria-hidden="true">
              <Award size={72} />
            </span>
          )}
        </div>
        <div className="award-article-body">
          <h1 className="award-article-title">{award.title}</h1>
          {award.detail && <p className="award-article-detail">{award.detail}</p>}
          <div className="award-article-footer">
            <Link to="/" className="btn btn-outline">
              Back to home
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
};

export default AwardDetail;