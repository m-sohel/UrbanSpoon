import './MapPlaceholder.css';

const MapPlaceholder = () => {
  return (
    <div className="map-placeholder" id="map-placeholder">
      <div className="map-placeholder__header">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="map-placeholder__icon">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
          <line x1="8" y1="2" x2="8" y2="18"/>
          <line x1="16" y1="6" x2="16" y2="22"/>
        </svg>
        <h3 className="map-placeholder__title">Find Us</h3>
      </div>
      <div className="map-placeholder__frame">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3773.6!2d72.83!3d18.93!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDU1JzQ4LjAiTiA3MsKwNDknNDguMCJF!5e0!3m2!1sen!2sin!4v1"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Urban Spoon Location"
        ></iframe>
        {/* Overlay to show it's a placeholder area */}
        <div className="map-placeholder__overlay">
          <div className="map-placeholder__pin">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--color-accent)" stroke="none">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3" fill="var(--color-bg-primary)"/>
            </svg>
          </div>
          <p className="map-placeholder__label">123 Gourmet Avenue, Mumbai</p>
        </div>
      </div>
    </div>
  );
};

export default MapPlaceholder;
