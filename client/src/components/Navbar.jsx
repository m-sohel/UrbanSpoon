import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="navbar">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__brand" id="nav-brand">
          <span className="navbar__brand-icon">🍴</span>
          <span className="navbar__brand-text">Urban Spoon</span>
        </NavLink>

        <div className={`navbar__links ${isOpen ? 'navbar__links--open' : ''}`} id="nav-links">
          <NavLink to="/" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`} id="nav-home">
            Home
          </NavLink>
          <NavLink to="/menu" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`} id="nav-menu">
            Menu
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`} id="nav-contact">
            Contact
          </NavLink>

          {/* Admin link - Only visible when an administrator is actively authenticated */}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `navbar__link navbar__link--admin ${isActive ? 'navbar__link--active' : ''}`
              }
              id="nav-admin"
            >
              🛡️ Admin Dashboard
            </NavLink>
          )}


          {/* Auth Action */}
          {isAuthenticated ? (
            <div className="navbar__auth-group">
              <span className="navbar__user-tag" title={`Signed in as ${user?.name}`}>
                👤 {user?.name?.split(' ')[0] || 'User'}
              </span>
              <button
                type="button"
                className="btn btn--outline btn--sm navbar__logout-btn"
                onClick={handleLogout}
                id="nav-logout-btn"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `navbar__link navbar__link--login ${isActive ? 'navbar__link--active' : ''}`
              }
              id="nav-login"
            >
              Sign In
            </NavLink>
          )}

          <NavLink to="/contact" className="btn btn--primary btn--sm navbar__cta hide-mobile" id="nav-reserve">
            Reserve a Table
          </NavLink>
        </div>


        <button
          className={`navbar__toggle ${isOpen ? 'navbar__toggle--open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
          id="nav-toggle"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
