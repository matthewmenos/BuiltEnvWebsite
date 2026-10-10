import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  Menu,
  X,
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
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  const closeMenu = () => setMenuOpen(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close on Escape or when clicking outside the sidebar.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const onMouseDown = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onMouseDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-shell">
      {/* Hide the admin sidebar on the login page — visitors without a
          session should only see the login card. */}
      {isAuthenticated && (
        <aside
          className={`admin-sidebar${menuOpen ? ' is-open' : ''}`}
          ref={sidebarRef}
        >
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
            <button
              className="admin-nav-toggle"
              type="button"
              aria-label={
                menuOpen ? 'Close navigation menu' : 'Open navigation menu'
              }
              aria-expanded={menuOpen}
              aria-controls="admin-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <X size={22} aria-hidden="true" />
              ) : (
                <Menu size={22} aria-hidden="true" />
              )}
            </button>
          </div>
          <nav
            className="admin-nav-links"
            id="admin-menu"
            aria-label="Admin navigation"
          >
            {adminLinks.map((link) => {
              const LinkIcon = link.icon;
              return (
                <NavLink key={link.path} to={link.path} onClick={closeMenu}>
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
