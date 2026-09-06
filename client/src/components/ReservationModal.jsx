import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/api';
import './ReservationModal.css';

const ReservationModal = ({ table, onClose, onBookingConfirmed }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guests, setGuests] = useState(table.minGuests || 2);
  const [occasion, setOccasion] = useState('Casual Fine Dining');
  const [specialRequests, setSpecialRequests] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill user details if logged in
  useEffect(() => {
    if (user) {
      if (!guestName && user.name) setGuestName(user.name);
      if (!guestEmail && user.email) setGuestEmail(user.email);
    }
  }, [user]);

  if (!table) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      setError('Please sign in to make a table reservation.');
      return;
    }

    setLoading(true);

    try {
      const combinedNotes =
        occasion && occasion !== 'Casual Fine Dining'
          ? `[Occasion: ${occasion}] ${specialRequests}`.trim()
          : specialRequests.trim();

      const payload = {
        tableNumber: table.number,
        date: table.date,
        timeSlot: table.timeSlot,
        guests: Number(guests),
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        guestEmail: guestEmail.trim(),
        specialRequests: combinedNotes,
      };

      const res = await API.post('/api/reservations', payload);
      if (res.data?.success && res.data?.diningPass) {
        onBookingConfirmed(res.data.diningPass);
      } else {
        setError(res.data?.message || 'Failed to complete reservation.');
      }
    } catch (err) {
      console.error('Reservation booking failed:', err);
      if (err.response?.status === 401) {
        setError('Authentication required: Please sign in to book your table.');
      } else {
        const msg =
          err.response?.data?.message ||
          'This table may have just been reserved or the server is momentarily unreachable.';
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reservation-modal-backdrop animate-fade-in" id="reservation-modal-backdrop">
      <div className="reservation-modal-dialog card" id="reservation-modal-dialog">
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <span className="section__label">Instant Table Reservation</span>
            <h2 className="modal-title">Confirm {table.name}</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Selected Table Summary Banner */}
        <div className="modal-table-summary">
          <div className="summary-item">
            <span className="summary-label">Selected Seat</span>
            <span className="summary-value highlight-gold">
              Table {table.number} ({table.zone})
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Date &amp; Dining Slot</span>
            <span className="summary-value">
              📅 {table.date} • ⏰ {table.timeSlot}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Table Ambience</span>
            <span className="summary-value">{table.view}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Capacity Limit</span>
            <span className="summary-value">Up to {table.capacity} Guests</span>
          </div>
        </div>

        {/* Authentication Notice Banner if user is not logged in */}
        {!isAuthenticated ? (
          <div className="modal-auth-prompt card" id="modal-auth-prompt">
            <div className="modal-auth-header">
              <span className="modal-auth-icon">🔒</span>
              <div>
                <h4 className="modal-auth-title">Member Sign In Required</h4>
                <p className="modal-auth-desc text-muted">
                  To guarantee your table reservation and generate your confirmed digital boarding pass, please sign in or register an account.
                </p>
              </div>
            </div>
            <div className="modal-auth-actions">
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => navigate('/login', { state: { from: location } })}
                id="btn-modal-signin"
              >
                🔑 Sign In to Book
              </button>
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => navigate('/login', { state: { from: location, isRegister: true } })}
                id="btn-modal-register"
              >
                ✨ Create Free Account
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-user-ribbon" id="modal-user-ribbon">
            <span className="user-ribbon-icon">👤</span>
            <div className="user-ribbon-info">
              <span className="user-ribbon-name">
                Booking as <strong>{user?.name}</strong>
              </span>
              <span className="user-ribbon-email text-muted">{user?.email}</span>
            </div>
            <span className="badge badge--user-verified">VERIFIED MEMBER</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="modal-error-banner animate-fade-in" id="modal-error-banner">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Booking Form */}
        <form className="modal-form" onSubmit={handleSubmit} id="instant-reservation-form">
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="res-guest-name">
                Full Name *
              </label>
              <input
                type="text"
                id="res-guest-name"
                className="form-input"
                placeholder="e.g. Vikram Singhania"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="res-guest-phone">
                Phone Number *
              </label>
              <input
                type="tel"
                id="res-guest-phone"
                className="form-input"
                placeholder="+91 98765 43210"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="res-guest-email">
                Email Address (For Confirmation Pass) *
              </label>
              <input
                type="email"
                id="res-guest-email"
                className="form-input"
                placeholder="vikram@example.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="res-guests-count">
                Number of Guests *
              </label>
              <select
                id="res-guests-count"
                className="form-input"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                required
              >
                {Array.from({ length: table.capacity }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="res-occasion">
              Dining Occasion
            </label>
            <select
              id="res-occasion"
              className="form-input"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
            >
              <option value="Casual Fine Dining">Casual Fine Dining</option>
              <option value="Romantic Anniversary">Romantic Anniversary</option>
              <option value="Birthday Celebration">Birthday Celebration</option>
              <option value="Business Dinner">Business Dinner</option>
              <option value="Family Gathering">Family Gathering</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="res-special-requests">
              Special Requests or Dietary Notes (Optional)
            </label>
            <input
              type="text"
              id="res-special-requests"
              className="form-input"
              placeholder="e.g. Vegetarian tasting preference, quiet corner, flower arrangement"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn--outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            {!isAuthenticated ? (
              <button
                type="button"
                className="btn btn--primary btn-confirm-submit"
                onClick={() => navigate('/login', { state: { from: location } })}
                id="btn-confirm-submit"
              >
                🔑 Sign In to Complete Reservation
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn--primary btn-confirm-submit"
                disabled={loading}
                id="btn-confirm-submit"
              >
                {loading ? (
                  <span className="spinner" style={{ width: '20px', height: '20px' }}></span>
                ) : (
                  '🎟️ Confirm Guaranteed Table'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationModal;
