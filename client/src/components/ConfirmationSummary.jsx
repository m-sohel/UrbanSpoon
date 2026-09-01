import './ConfirmationSummary.css';

const ConfirmationSummary = ({ data, onReset }) => {
  const formattedDate = data.date
    ? new Date(data.date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : data.date;

  return (
    <div className="confirmation animate-scale-in" id="confirmation-summary">
      <div className="confirmation__icon-wrapper">
        <div className="confirmation__icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" className="confirmation__circle" />
            <polyline points="22 4 12 14.01 9 11.01" className="confirmation__check" />
          </svg>
        </div>
      </div>

      <h2 className="confirmation__title">Inquiry Submitted Successfully!</h2>
      <p className="confirmation__subtitle">
        Thank you, <strong>{data.name}</strong>. Your table inquiry has been received.
      </p>

      <div className="confirmation__details">
        <div className="confirmation__detail">
          <span className="confirmation__label">Name</span>
          <span className="confirmation__value">{data.name}</span>
        </div>
        <div className="confirmation__detail">
          <span className="confirmation__label">Phone</span>
          <span className="confirmation__value">{data.phone}</span>
        </div>
        <div className="confirmation__detail">
          <span className="confirmation__label">Date</span>
          <span className="confirmation__value">{formattedDate}</span>
        </div>
        <div className="confirmation__detail">
          <span className="confirmation__label">Guests</span>
          <span className="confirmation__value">{data.guests}</span>
        </div>
      </div>

      <p className="confirmation__note">
        We&rsquo;ll get back to you shortly to confirm your reservation.
      </p>

      <button className="btn btn--outline btn--lg" onClick={onReset} id="confirmation-reset">
        Make Another Inquiry
      </button>
    </div>
  );
};

export default ConfirmationSummary;
