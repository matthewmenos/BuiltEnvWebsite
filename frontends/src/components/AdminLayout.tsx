import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
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
  { label: 'Programmes', path: '/admin/programmes', icon: GraduationCap },
  { label: 'News', path: '/admin/news', icon: Newspaper },
  { label: 'Events', path: '/admin/events', icon: CalendarDays },
  { label: 'Staff', path: '/admin/staff', icon: Users },
  { label: 'Gallery', path: '/admin/gallery', icon: ImageIcon },
  { label: 'Notices', path: '/admin/notices', icon: Bell },
  { label: 'Contacts', path: '/admin/contacts', icon: MailOpen },
];

const AdminLayout: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div>
      <div className="admin-nav">
        <div className="admin-nav-brand">
          <img
            src="/assets/logos/department-logo.jpg"
            alt="Department of Built Environment logo"
            className="admin-logo-img"
          />
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
          <button className="admin-logout" onClick={logout}>
            <LogOut size={15} aria-hidden="true" />
            <span>Logout</span>
          </button>
        </nav>
      </div>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
