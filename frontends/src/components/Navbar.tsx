import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Programmes', path: '/programmes' },
    { label: 'Research', path: '/research' },
    { label: 'News', path: '/news' },
    { label: 'Events', path: '/events' },
    { label: 'Staff', path: '/staff' },
    { label: 'Resources', path: '/resources' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          <img
            src="/assets/logos/department-logo.jpg"
            alt="Department of Built Environment logo"
            className="logo-img"
          />
          <span className="logo-text-block">
            <span className="logo-text">Department of Built Environment</span>
            <span className="logo-subtext">Pentecost University</span>
          </span>
        </Link>
        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link to={link.path}>{link.label}</Link>
            </li>
          ))}
        </ul>
        <div className="navbar-actions">
          <a
            href="https://pentvars.edu.gh"
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm btn-outline"
          >
            Pentecost University
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
