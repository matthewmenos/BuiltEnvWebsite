import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { IBreadcrumb, INews } from 'shared/schema';
import { usePublicItem } from '../hooks/usePublicResource';
import { mediaUrl } from '../lib/upload';
import { Skeleton } from '../components/Skeleton';

const breadcrumbs: IBreadcrumb[] = [
  { label: 'Home', href: '/' },
  { label: 'News', href: '/news' },
  { label: 'News Details', href: '/news' },
];

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    item: article,
    loading,
    error,
    notFound,
  } = usePublicItem<INews>('/api/admin/news', id);

  if (loading) {
    return (
      <div>
        <Skeleton width="40%" height={28} />
        <div style={{ height: 16 }} />
        <Skeleton width="100%" height={260} />
        <div style={{ height: 16 }} />
        <Skeleton width="100%" height={14} />
        <div style={{ height: 8 }} />
        <Skeleton width="90%" height={14} />
      </div>
    );
  }

  if (error || notFound || !article) {
    return (
      <div className="error-state">
        <h2>Article not found</h2>
        <Link to="/news" className="btn btn-primary">
          Back to news
        </Link>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
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
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            <span className="news-author">By {article.author}</span>
          </div>
          <h1 className="news-article-title">{article.title}</h1>
        </div>
        <div className="news-article-image">
          <img src={mediaUrl(article.image)} alt={article.title} fetchPriority="high" decoding="async" />
        </div>
        <div className="news-article-body">
          <p>{article.body}</p>
        </div>
        <div className="news-article-footer">
          <Link to="/news" className="btn btn-outline">
            Back to news
          </Link>
        </div>
      </article>
    </div>
  );
};

export default NewsDetail;
