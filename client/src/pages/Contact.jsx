import ContactInfo from '../components/ContactInfo';
import OpeningHours from '../components/OpeningHours';
import MapPlaceholder from '../components/MapPlaceholder';
import InquiryForm from '../components/InquiryForm';
import './Contact.css';

const Contact = () => {
  return (
    <div className="page contact-page" id="page-contact">
      {/* Page Header banner */}
      <section className="page-header">
        <div className="container">
          <span className="section__label">Get in Touch</span>
          <h1 className="section__title">Contact &amp; Reservations</h1>
          <div className="divider divider--center"></div>
          <p className="section__subtitle">
            Have a question or looking to reserve a table? Reach out to us directly or submit your inquiry below.
          </p>
        </div>
      </section>

      <div className="section contact-section">
        <div className="container">
          {/* Contact Info Cards */}
          <ContactInfo />

          {/* Two Columns: Inquiry Form on Left, Timings & Map on Right */}
          <div className="contact-main-grid">
            <div className="contact-main-grid__form">
              <InquiryForm />
            </div>

            <div className="contact-main-grid__info">
              <OpeningHours />
              <MapPlaceholder />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
