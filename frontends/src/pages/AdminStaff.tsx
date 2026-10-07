import React from 'react';
import { Link } from 'react-router-dom';
import { staff } from '../data/staff';

const AdminStaff: React.FC = () => {
  return (
    <div>
      <h1 className="page-title">Staff</h1>
      <p className="page-description">Manage department staff profiles.</p>
      <div className="admin-section-header">
        <h2>All Staff Members</h2>
        <Link to="/admin/staff/new" className="btn btn-primary">
          + Add New Staff
        </Link>
      </div>
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id}>
                <td>{member.name}</td>
                <td>{member.position}</td>
                <td>{member.department}</td>
                <td>
                  <div className="table-actions">
                    <Link to={`/admin/staff/${member.id}/edit`} className="btn btn-sm btn-outline">
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

export default AdminStaff;
