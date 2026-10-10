import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  House,
  GraduationCap,
  Newspaper,
  CalendarDays,
  Users,
  Image as ImageIcon,
  Bell,
  MailOpen,
  LogOut,
} from 'lucide-react';
import DualLogos from './DualLogos';
import { useAuth } from '../context/ThemeContext';

const adminLinks = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Homepage', path: '/admin/home', icon: House },
  { label: 'Programmes', path: '/admin/programmes', icon: GraduationCap },
  { label: 'News', path: '/admin/news', icon: Newspaper },
  { label: 'Events', path: '/admin/events', icon: CalendarDays },
  { label: 'Staff', path: '/admin/staff', icon: Users },
  { label: 'Gallery', path: '/admin/gallery', icon: ImageIcon },
  { label: 'Notices', path: '/admin/notices', icon: Bell },
  { label: 'Contacts', path: '/admin/contacts', icon: MailOpen },
];

const AdminLayout: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-shell">
      {/* Hide the admin sidebar on the login page — visitors without a
          session should only see the login card. */}
      {isAuthenticated && (
        <aside className="admin-sidebar">
          <div className="admin-nav-brand">
            <div className="admin-nav-logos">
              <DualLogos
                imgClassName="admin-logo-img"
                puClassName="admin-logo-img--pu"
                departmentClassName="admin-logo-img--department"
                puAlt="PU logo"
                departmentAlt="Department logo"
              />
            </div>
            <span className="admin-logo-text">Admin Panel</span>
          </div>
          <nav className="admin-nav-links" aria-label="Admin navigation">
            {adminLinks.map((link) => {
              const LinkIcon = link.icon;
              return (
                <NavLink key={link.path} to={link.path}>
                  <LinkIcon size={16} aria-hidden="true" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
            <button
              className="admin-logout"
              type="button"
              onClick={handleLogout}
            >
              <LogOut size={16} aria-hidden="true" />
              <span>Logout</span>
            </button>
          </nav>
        </aside>
      )}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
