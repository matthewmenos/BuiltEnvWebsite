import React from 'react';
import { Link } from 'react-router-dom';
import { events } from '../data/events';

const AdminEvents: React.FC = () => {
  return (
    <div>
      <h1 className="page-title">Events</h1>
      <p className="page-description">Manage the department's events.</p>
      <div className="admin-section-header">
        <h2>All Events</h2>
        <Link to="/admin/events/new" className="btn btn-primary">
          + Add New Event
        </Link>
      </div>
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Category</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{new Date(event.startTime).toLocaleDateString('en-GB')}</td>
                <td>{event.title}</td>
                <td>{event.category}</td>
                <td>{event.location}</td>
                <td>
                  <div className="table-actions">
                    <Link to={`/admin/events/${event.id}/edit`} className="btn btn-sm btn-outline">
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

export default AdminEvents;
