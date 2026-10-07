import React from 'react';
import { Link } from 'react-router-dom';
import { programmes as programmeData } from '../data/programmes';
import { IProgramme } from 'shared/schema';

const AdminProgrammes: React.FC = () => {
  return (
    <div>
      <h1 className="page-title">Programmes</h1>
      <p className="page-description">Manage the department's academic programmes.</p>
      <div className="admin-section-header">
        <h2>All Programmes</h2>
        <Link to="/admin/programmes/new" className="btn btn-primary">
          + Add New Programme
        </Link>
      </div>
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Title</th>
              <th>Faculty</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {programmeData.map((programme: IProgramme) => (
              <tr key={programme.id}>
                <td>{programme.shortCode}</td>
                <td>{programme.title}</td>
                <td>{programme.faculty}</td>
                <td>{programme.duration}</td>
                <td>
                  <div className="table-actions">
                    <Link to={`/admin/programmes/${programme.id}/edit`} className="btn btn-sm btn-outline">
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

export default AdminProgrammes;
