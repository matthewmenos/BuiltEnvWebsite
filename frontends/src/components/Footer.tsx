import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import DualLogos from './DualLogos';
import { FALLBACK_SETTINGS, publicApi, type SiteSettings } from '../lib/publicApi';

const Footer: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(FALLBACK_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    publicApi
      .getSettings()
      .then((s) => {
        if (!cancelled) setSettings(s);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-brand">
              <span className="footer-logos">
                <DualLogos imgClassName="footer-logo" puAlt="PU logo" departmentAlt="Department logo" />
              </span>
              <h4>Department of Built Environment</h4>
            </div>
            <p>
              A department of Pentecost University, Sowutuom – Accra, Ghana.
              Building the future of the built environment through
              innovative education, research, and practice.
            </p>
            <p className="footer-parent">
              <a href="https://pentvars.edu.gh" target="_blank" rel="noreferrer">
                pentvars.edu.gh
              </a>
            </p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/programmes">Programmes</Link></li>
              <li><Link to="/news">News</Link></li>
              <li><Link to="/events">Events</Link></li>
              <li><Link to="/staff">Staff</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li className="footer-contact-item">
                <Mail size={16} aria-hidden="true" />
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </li>
              <li className="footer-contact-item">
                <Phone size={16} aria-hidden="true" />
                <a href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}>{settings.phone}</a>
              </li>
              <li className="footer-contact-item">
                <MapPin size={16} aria-hidden="true" />
                <span>{settings.address}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Department of Built Environment, Pentecost University. All rights reserved.</p>
          <br />
          <a href="https://menositconsult.com" target="_blank" rel="noopener noreferrer">Powered By: Menos iT Consult</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
