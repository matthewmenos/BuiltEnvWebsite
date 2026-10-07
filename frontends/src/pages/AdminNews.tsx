import React from 'react';
import { Link } from 'react-router-dom';
import { news as newsData } from '../data/news';
import { INews } from 'shared/schema';

const AdminNews: React.FC = () => {
  return (
    <div>
      <h1 className="page-title">News</h1>
      <p className="page-description">Manage the department's news articles.</p>
      <div className="admin-section-header">
        <h2>All News Articles</h2>
        <Link to="/admin/news/new" className="btn btn-primary">
          + Add New Article
        </Link>
      </div>
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {newsData.map((article: INews) => (
              <tr key={article.id}>
                <td>{new Date(article.publishedAt).toLocaleDateString('en-GB')}</td>
                <td>{article.title}</td>
                <td>{article.author}</td>
                <td>{article.category}</td>
                <td>
                  <div className="table-actions">
                    <Link to={`/admin/news/${article.id}/edit`} className="btn btn-sm btn-outline">
                      Edit
                    </Link>
                    <button className="btn btn-sm btn-outline btn-delete">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminNews;
