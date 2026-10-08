import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-brand">
              <img
                src="/assets/logos/pu-logo.jpg"
                alt="Pentecost University logo"
                className="footer-logo"
              />
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
                <a href="mailto:info@pentvars.edu.gh">info@pentvars.edu.gh</a>
              </li>
              <li className="footer-contact-item">
                <Phone size={16} aria-hidden="true" />
                <a href="tel:+233302417064">+233 302 417 064</a>
              </li>
              <li className="footer-contact-item">
                <MapPin size={16} aria-hidden="true" />
                <span>Pentecost University, P.O. Box KN 1739, Accra, Ghana</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Department of Built Environment, Pentecost University. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
