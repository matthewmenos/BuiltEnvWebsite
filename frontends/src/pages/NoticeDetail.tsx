import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { IBreadcrumb } from 'shared/schema';
import { usePublicItem } from '../hooks/usePublicResource';
import { Skeleton } from '../components/Skeleton';

interface NoticeRow {
  id: string;
  title: string;
  body: string;
  author: string;
  postedAt?: string;
  expiresAt?: string | null;
}

const breadcrumbs: IBreadcrumb[] = [
  { label: 'Home', href: '/' },
  { label: 'Resources', href: '/resources' },
  { label: 'Notice', href: '/resources' },
];

const NoticeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    item: notice,
    loading,
    error,
    notFound,
  } = usePublicItem<NoticeRow>('/api/admin/notices', id);

  if (loading) {
    return (
      <div>
        <Skeleton width="40%" height={28} />
        <div style={{ height: 16 }} />
        <Skeleton width="100%" height={14} />
        <div style={{ height: 8 }} />
        <Skeleton width="95%" height={14} />
        <div style={{ height: 8 }} />
        <Skeleton width="88%" height={14} />
      </div>
    );
  }

  if (error || notFound || !notice) {
    return (
      <div className="error-state">
        <h2>Notice not found</h2>
        <Link to="/resources" className="btn btn-primary">
          Back to resources
        </Link>
      </div>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

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

      <article className="news-article">
        <div className="news-article-header">
          <div className="news-article-meta">
            {notice.postedAt && (
              <time dateTime={notice.postedAt}>{formatDate(notice.postedAt)}</time>
            )}
            {notice.author && (
              <span className="news-author">By {notice.author}</span>
            )}
          </div>
          <h1 className="news-article-title">{notice.title}</h1>
        </div>
        <div className="news-article-body">
          <p>{notice.body}</p>
        </div>
        <div className="news-article-footer">
          <Link to="/resources" className="btn btn-outline">
            Back to resources
          </Link>
        </div>
      </article>
    </div>
  );
};

export default NoticeDetail;