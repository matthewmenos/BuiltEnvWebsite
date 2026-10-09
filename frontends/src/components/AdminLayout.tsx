import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
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
    <div>
      {/* Hide the admin chrome on the login page — visitors without a
          session should only see the login card. */}
      {isAuthenticated && (
        <div className="admin-nav">
          <div className="admin-nav-brand">
            <div className="admin-nav-logos">
              <img
                src="/assets/logos/pu-logo.jpg"
                alt="PU logo"
                className="admin-logo-img admin-logo-img--pu"
              />
              <img
                src="/assets/logos/department-logo.jpg"
                alt="Department logo"
                className="admin-logo-img admin-logo-img--department"
              />
            </div>
            <span className="admin-logo-text">Admin Panel</span>
          </div>
          <nav className="admin-nav-links">
            {adminLinks.map((link) => {
              const LinkIcon = link.icon;
              return (
                <Link key={link.path} to={link.path}>
                  <LinkIcon size={15} aria-hidden="true" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <button className="admin-logout" onClick={handleLogout}>
              <LogOut size={15} aria-hidden="true" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      )}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
