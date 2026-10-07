import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  return (
    <div>
      <div className="admin-nav">
        <div className="admin-nav-brand">
          <span className="admin-logo">🏛️</span>
          <span className="admin-logo-text">Admin Panel</span>
        </div>
        <nav className="admin-nav-links">
          <a href="/admin/dashboard">Dashboard</a>
          <a href="/admin/programmes">Programmes</a>
          <a href="/admin/news">News</a>
          <a href="/admin/events">Events</a>
          <a href="/admin/staff">Staff</a>
          <a href="/admin/gallery">Gallery</a>
          <a href="/admin/notices">Notices</a>
          <a href="/admin/contacts">Contacts</a>
        </nav>
      </div>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
