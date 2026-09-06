import './ConfirmationSummary.css';

const ConfirmationSummary = ({ data, onReset }) => {
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

      <h2 className="confirmation__title">Inquiry Sent Successfully!</h2>
      <p className="confirmation__subtitle">
        Thank you, <strong>{data.name}</strong>. Our private events and hospitality team has received your message.
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
        {data.inquiryType && (
          <div className="confirmation__detail">
            <span className="confirmation__label">Inquiry Type</span>
            <span className="confirmation__value">{data.inquiryType}</span>
          </div>
        )}
        {data.email && (
          <div className="confirmation__detail">
            <span className="confirmation__label">Email</span>
            <span className="confirmation__value">{data.email}</span>
          </div>
        )}
      </div>

      <p className="confirmation__note">
        Our team will get in touch with you within 24 hours. For urgent dining table reservations, please use our <strong>Live 30-Table Floor Map</strong> above!
      </p>

      <button className="btn btn--outline btn--lg" onClick={onReset} id="confirmation-reset">
        Send Another Message
      </button>
    </div>
  );
};

export default ConfirmationSummary;
