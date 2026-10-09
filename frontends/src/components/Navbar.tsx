import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import DualLogos from './DualLogos';

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

  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navbarRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => setMenuOpen(false);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close the menu on Escape or when clicking outside the navbar
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const onMouseDown = (event: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
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

  return (
    <nav className="navbar">
      <div className="container navbar-inner" ref={navbarRef}>
        <Link to="/" className="logo" onClick={closeMenu}>
          <span className="logo-imgs">
            <DualLogos imgClassName="logo-img" puAlt="PU logo" />
          </span>
          <span className="logo-text-block">
            <span className="logo-text">Department of Built Environment</span>
            <span className="logo-subtext">Pentecost University</span>
          </span>
        </Link>
        <button
          type="button"
          className="nav-toggle"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="nav-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
        <div className={`nav-menu${menuOpen ? ' is-open' : ''}`} id="nav-menu">
          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link to={link.path} onClick={closeMenu}>
                  {link.label}
                </Link>
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
      </div>
    </nav>
  );
};

export default Navbar;
