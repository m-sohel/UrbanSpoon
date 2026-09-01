import './OpeningHours.css';

const OpeningHours = () => {
  const hours = [
    { day: 'Monday', time: '11:00 AM – 10:00 PM' },
    { day: 'Tuesday', time: '11:00 AM – 10:00 PM' },
    { day: 'Wednesday', time: '11:00 AM – 10:00 PM' },
    { day: 'Thursday', time: '11:00 AM – 10:00 PM' },
    { day: 'Friday', time: '11:00 AM – 11:00 PM' },
    { day: 'Saturday', time: '10:00 AM – 11:00 PM' },
    { day: 'Sunday', time: '10:00 AM – 11:00 PM' },
  ];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="opening-hours" id="opening-hours">
      <div className="opening-hours__header">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opening-hours__icon">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <h3 className="opening-hours__title">Opening Hours</h3>
      </div>
      <div className="opening-hours__list">
        {hours.map((item) => (
          <div
            className={`opening-hours__row ${item.day === today ? 'opening-hours__row--today' : ''}`}
            key={item.day}
          >
            <span className="opening-hours__day">
              {item.day}
              {item.day === today && <span className="opening-hours__today-badge">Today</span>}
            </span>
            <span className="opening-hours__dots"></span>
            <span className="opening-hours__time">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpeningHours;
