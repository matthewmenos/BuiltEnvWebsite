import React from 'react';
import { Link } from 'react-router-dom';
import { news as newsData } from '../data/news';
import { INews } from 'shared/schema';

const News: React.FC = () => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div>
      <h1 className="page-title">News</h1>
      <p className="page-description">
        Latest news, announcements, and stories from the Department of Built Environment.
      </p>

      <div className="news-grid">
        {newsData.map((article: INews) => (
          <Link to={`/news/${article.id}`} className="card news-card" key={article.id}>
            <div className="news-image">
              <img src={article.image} alt={article.title} />
            </div>
            <div className="news-content">
              <span className="badge badge-primary">{article.category}</span>
              <h3 className="news-title">{article.title}</h3>
              <p className="news-summary">{article.summary}</p>
              <p className="news-meta">
                By {article.author} &middot; <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
              </p>
              <div className="news-actions">
                <span className="btn btn-sm btn-primary">Read More</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default News;
