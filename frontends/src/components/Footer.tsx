import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h4>Department of Built Environment</h4>
            <p>
              Building the future of the built environment through
              innovative education, research, and practice.
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
              <li>
                <a href="mailto:info@builtenv.ac.uk">info@builtenv.ac.uk</a>
              </li>
              <li>
                <a href="tel:+441234567890">+44 (0)123 456 7890</a>
              </li>
              <li>Built Environment Building, University Walk, Bristol, BS8 1TR</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Department of Built Environment. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
