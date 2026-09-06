import './BookingPass.css';

const BookingPass = ({ diningPass, onClose, onBookAnother }) => {
  if (!diningPass) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="booking-pass-backdrop animate-fade-in" id="booking-pass-modal">
      <div className="dining-ticket-card" id="printable-dining-ticket">
        {/* Ticket Top: Restaurant Branding & Status */}
        <div className="ticket-header">
          <div className="ticket-brand">
            <span className="ticket-brand-icon">🍴</span>
            <div>
              <h3 className="ticket-brand-name">Urban Spoon</h3>
              <span className="ticket-brand-sub">Fine Dining & Culinary Lounge</span>
            </div>
          </div>
          <div className="ticket-status-stamp">
            <span>GUARANTEED</span>
            <strong>CONFIRMED</strong>
          </div>
        </div>

        <div className="ticket-divider">
          <span className="ticket-notch ticket-notch--left"></span>
          <span className="ticket-dashed-line"></span>
          <span className="ticket-notch ticket-notch--right"></span>
        </div>

        {/* Ticket Body: Table Showcase */}
        <div className="ticket-body">
          <div className="ticket-table-hero">
            <span className="ticket-table-badge">RESERVED SEAT</span>
            <h1 className="ticket-table-number">TABLE {diningPass.tableNumber}</h1>
            <span className="ticket-zone-tag">{diningPass.zone}</span>
            <p className="ticket-view-desc">✨ {diningPass.view}</p>
          </div>

          <div className="ticket-details-grid">
            <div className="ticket-detail">
              <span className="ticket-label">DATE</span>
              <span className="ticket-value">📅 {diningPass.date}</span>
            </div>
            <div className="ticket-detail">
              <span className="ticket-label">DINING TIME</span>
              <span className="ticket-value">⏰ {diningPass.timeSlot}</span>
            </div>
            <div className="ticket-detail">
              <span className="ticket-label">GUEST NAME</span>
              <span className="ticket-value">👤 {diningPass.guestName}</span>
            </div>
            <div className="ticket-detail">
              <span className="ticket-label">PARTY SIZE</span>
              <span className="ticket-value">👥 {diningPass.guests} Guests</span>
            </div>
          </div>

          {diningPass.specialRequests && (
            <div className="ticket-notes">
              <span className="ticket-label">SPECIAL REQUESTS / OCCASION</span>
              <p className="ticket-notes-text">{diningPass.specialRequests}</p>
            </div>
          )}
        </div>

        <div className="ticket-divider">
          <span className="ticket-notch ticket-notch--left"></span>
          <span className="ticket-dashed-line"></span>
          <span className="ticket-notch ticket-notch--right"></span>
        </div>

        {/* Ticket Stub: Reference Code & Simulated Barcode */}
        <div className="ticket-stub">
          <div className="ticket-ref-group">
            <span className="ticket-label">BOOKING REFERENCE</span>
            <span className="ticket-ref-code">{diningPass.bookingRef}</span>
          </div>

          <div className="simulated-barcode">
            <div className="barcode-bars">
              {Array.from({ length: 32 }).map((_, i) => (
                <span
                  key={i}
                  className="barcode-bar"
                  style={{
                    width: `${(i % 3) + 1}px`,
                    marginRight: `${(i % 2) + 1}px`,
                  }}
                ></span>
              ))}
            </div>
            <span className="barcode-number">{diningPass.bookingRef}-2026-US</span>
          </div>
        </div>

        {/* Action Buttons (Excluded from print) */}
        <div className="ticket-actions hide-print">
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={handlePrint}
            id="btn-print-pass"
          >
            🖨️ Print / Save Pass
          </button>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={onBookAnother}
            id="btn-book-another"
          >
            🔄 Reserve Another Table
          </button>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={onClose}
            id="btn-close-pass"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPass;
