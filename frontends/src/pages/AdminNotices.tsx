import React from "react";
import { Link } from "react-router-dom";
import { Notice } from "../data/notices";

const AdminNotices: React.FC = () => {
  return (
    <div>
      <h1 className="page-title">Notices</h1>
      <p className="page-description">Manage department notices and announcements.</p>
      <div className="admin-section-header">
        <h2>All Notices</h2>
        <Link to="/admin/notices/new" className="btn btn-primary">
          + Add New Notice
        </Link>
      </div>
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Notice.map((n: Notice) => (
              <tr key={n.id}>
                <td>{n.title}</td>
                <td>{new Date(n.date).toLocaleDateString("en-GB")}</td>
                <td>
                  <span className="badge badge-primary">{n.status}</span>
                </td>
                <td>
                  <div className="table-actions">
                    <Link to={`/admin/notices/${n.id}/edit`} className="btn btn-sm btn-outline">
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

export default AdminNotices;
