import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { news as newsData } from '../data/news';
import { IBreadcrumb, INews } from 'shared/schema';

const breadcrumbs: IBreadcrumb[] = [
  { label: 'Home', href: '/' },
  { label: 'News', href: '/news' },
  { label: 'News Details', href: '/news' },
];

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const article = newsData.find((n: INews) => n.id === id);

  if (!article) {
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
          <img src={article.image} alt={article.title} />
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
