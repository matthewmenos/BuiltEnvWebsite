import React from "react";
import { Link } from "react-router-dom";
import { galleryItems } from "../data/gallery";

const AdminGallery: React.FC = () => {
  return (
    <div>
      <h1 className="page-title">Gallery</h1>
      <p className="page-description">Manage gallery images and uploads.</p>
      <div className="admin-section-header">
        <h2>All Gallery Items</h2>
        <Link to="/admin/gallery/new" className="btn btn-primary">
          + Add New Image
        </Link>
      </div>
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Upload Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {galleryItems.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.category}</td>
                <td className="text-muted">{item.id}</td>
                <td>
                  <div className="table-actions">
                    <Link to={`/admin/gallery/${item.id}/edit`} className="btn btn-sm btn-outline">
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

export default AdminGallery;
