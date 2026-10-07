import React from 'react';
import { Link } from 'react-router-dom';
import { adminDashboardData } from '../data/admin';

const AdminDashboard: React.FC = () => {
  return (
    <div>
      <h1 className="page-title">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-value">4</div>
          <div className="stat-label">Programmes</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">12</div>
          <div className="stat-label">News Articles</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">8</div>
          <div className="stat-label">Upcoming Events</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">35</div>
          <div className="stat-label">Staff Members</div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h2>Recent Activity</h2>
        </div>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Added new programme: MSc Quantity Surveying</td>
                <td>01 Sep 2026</td>
                <td><span className="badge badge-primary">Active</span></td>
              </tr>
              <tr>
                <td>Updated news article: Research Centre</td>
                <td>30 Aug 2026</td>
                <td><span className="badge badge-primary">Active</span></td>
              </tr>
              <tr>
                <td>Added new event: Sustainable Construction Conference</td>
                <td>28 Aug 2026</td>
                <td><span className="badge badge-primary">Active</span></td>
              </tr>
              <tr>
                <td>Updated staff profile: Dr. Sarah Thompson</td>
                <td>25 Aug 2026</td>
                <td><span className="badge badge-primary">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="quick-actions">
          <Link to="/admin/programmes" className="btn btn-primary">
            + Add New Programme
          </Link>
          <Link to="/admin/news" className="btn btn-outline">
            + Add New News Article
          </Link>
          <Link to="/admin/events" className="btn btn-outline">
            + Add New Event
          </Link>
          <Link to="/admin/staff" className="btn btn-outline">
            + Add Staff Member
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
