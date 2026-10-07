import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Navbar: React.FC = () => {
  const { theme, toggleTheme, isAuthenticated, logout } = useTheme();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Programmes', path: '/programmes' },
    { label: 'News', path: '/news' },
    { label: 'Events', path: '/events' },
    { label: 'Staff', path: '/staff' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          <span className="logo-icon">🏛️</span>
          <span className="logo-text">Department of Built Environment</span>
        </Link>
        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link to={link.path}>{link.label}</Link>
            </li>
          ))}
        </ul>
        <div className="navbar-actions">
          {isAuthenticated ? (
            <button className="btn btn-sm" onClick={logout}>
              Logout
            </button>
          ) : (
            <Link to="/admin/login" className="btn btn-sm btn-outline">
              Admin Login
            </Link>
          )}
          <button className="btn btn-sm btn-outline" onClick={toggleTheme}>
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
