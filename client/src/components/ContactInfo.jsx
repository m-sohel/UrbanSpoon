import './ContactInfo.css';

const ContactInfo = () => {
  const contactDetails = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      ),
      label: 'Address',
      value: '123 Gourmet Avenue, Downtown District',
      subvalue: 'Mumbai, India 400001',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      ),
      label: 'Phone',
      value: '+91 98765 43210',
      href: 'tel:+919876543210',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
      label: 'Email',
      value: 'hello@urbanspoon.in',
      href: 'mailto:hello@urbanspoon.in',
    },
  ];

  return (
    <div className="contact-info stagger-children" id="contact-info">
      {contactDetails.map((item, idx) => (
        <div className="contact-info__card card" key={idx} id={`contact-${item.label.toLowerCase()}`}>
          <div className="contact-info__icon">{item.icon}</div>
          <div className="contact-info__details">
            <span className="contact-info__label">{item.label}</span>
            {item.href ? (
              <a href={item.href} className="contact-info__value contact-info__value--link">
                {item.value}
              </a>
            ) : (
              <>
                <span className="contact-info__value">{item.value}</span>
                {item.subvalue && <span className="contact-info__subvalue">{item.subvalue}</span>}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactInfo;
