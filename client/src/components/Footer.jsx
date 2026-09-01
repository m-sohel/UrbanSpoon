import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer" id="footer">
      <div className="footer__accent-line"></div>
      <div className="container">
        <div className="footer__grid">
          {/* Brand Column */}
          <div className="footer__col footer__col--brand">
            <div className="footer__brand">
              <span className="footer__brand-icon">🍴</span>
              <span className="footer__brand-text">Urban Spoon</span>
            </div>
            <p className="footer__description">
              Where culinary artistry meets warmth. Experience flavors that linger long after the last bite.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer__col">
            <h4 className="footer__heading">Quick Links</h4>
            <ul className="footer__link-list">
              <li><Link to="/" className="footer__link" id="footer-home">Home</Link></li>
              <li><Link to="/menu" className="footer__link" id="footer-menu">Our Menu</Link></li>
              <li><Link to="/contact" className="footer__link" id="footer-contact">Contact</Link></li>
              <li><Link to="/admin" className="footer__link" id="footer-admin">Admin</Link></li>
            </ul>
          </div>

          {/* Address */}
          <div className="footer__col">
            <h4 className="footer__heading">Visit Us</h4>
            <address className="footer__address">
              <p>123 Gourmet Avenue</p>
              <p>Downtown District</p>
              <p>Mumbai, India 400001</p>
            </address>
            <a href="tel:+919876543210" className="footer__link mt-md">+91 98765 43210</a>
          </div>

          {/* Opening Hours */}
          <div className="footer__col">
            <h4 className="footer__heading">Opening Hours</h4>
            <div className="footer__hours">
              <div className="footer__hours-row">
                <span>Mon – Fri</span>
                <span>11:00 AM – 10:00 PM</span>
              </div>
              <div className="footer__hours-row">
                <span>Sat – Sun</span>
                <span>10:00 AM – 11:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copy">
            &copy; {new Date().getFullYear()} Urban Spoon. All rights reserved.
          </p>
          <div className="footer__socials">
            <a href="#" className="footer__social" aria-label="Instagram" id="footer-instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="#" className="footer__social" aria-label="Facebook" id="footer-facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="#" className="footer__social" aria-label="Twitter" id="footer-twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
