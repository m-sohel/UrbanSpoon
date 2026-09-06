import { useState } from 'react';
import TableMap from '../components/TableMap';
import ReservationModal from '../components/ReservationModal';
import BookingPass from '../components/BookingPass';
import ContactInfo from '../components/ContactInfo';
import OpeningHours from '../components/OpeningHours';
import MapPlaceholder from '../components/MapPlaceholder';
import InquiryForm from '../components/InquiryForm';
import './Contact.css';

const Contact = () => {
  const [modalTable, setModalTable] = useState(null);
  const [confirmedPass, setConfirmedPass] = useState(null);

  return (
    <div className="page contact-page" id="page-contact">
      {/* Page Header banner */}
      <section className="page-header">
        <div className="container">
          <span className="section__label">Fine Dining Reservations</span>
          <h1 className="section__title">Instant Table Booking &amp; Floor Plan</h1>
          <div className="divider divider--center"></div>
          <p className="section__subtitle">
            Experience our interactive 30-table seating layout. Pick your preferred date, time slot, and click any available table for instant confirmation.
          </p>
        </div>
      </section>

      <div className="section contact-section">
        <div className="container">
          {/* Section 1: Visual Interactive Seating & Instant Confirmation Engine */}
          <TableMap
            selectedTable={modalTable}
            onSelectTable={(table) => setModalTable(table)}
          />

          {/* Modal for entering guest details for selected table */}
          {modalTable && (
            <ReservationModal
              table={modalTable}
              onClose={() => setModalTable(null)}
              onBookingConfirmed={(pass) => {
                setModalTable(null);
                setConfirmedPass(pass);
              }}
            />
          )}

          {/* Instant Boarding Pass Ticket upon successful reservation */}
          {confirmedPass && (
            <BookingPass
              diningPass={confirmedPass}
              onClose={() => setConfirmedPass(null)}
              onBookAnother={() => {
                setConfirmedPass(null);
                setModalTable(null);
              }}
            />
          )}

          {/* Section 2: Contact Info Cards */}
          <div style={{ marginTop: 'var(--space-4xl)' }}>
            <div className="text-center" style={{ marginBottom: 'var(--space-2xl)' }}>
              <span className="section__label">Location &amp; Inquiries</span>
              <h2 className="section__title" style={{ fontSize: 'var(--text-3xl)' }}>
                Direct Contact &amp; Hours
              </h2>
              <div className="divider divider--center"></div>
            </div>
            <ContactInfo />
          </div>

          {/* Section 3: General Inquiries Form & Hours */}
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
