import { useState } from 'react';
import API from '../api/api';
import ConfirmationSummary from './ConfirmationSummary';
import './InquiryForm.css';

const InquiryForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    guests: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\+?[\d\s-]{7,15}$/.test(formData.phone.trim())) newErrors.phone = 'Enter a valid phone number';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.guests) newErrors.guests = 'Number of guests is required';
    else if (isNaN(formData.guests) || Number(formData.guests) < 1) newErrors.guests = 'Enter a valid number';
    else if (Number(formData.guests) > 20) newErrors.guests = 'Maximum 20 guests per table';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await API.post('/api/inquiries', {
        ...formData,
        guests: Number(formData.guests),
      });
      setSubmitted(true);
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ name: '', phone: '', date: '', guests: '' });
    setErrors({});
    setSubmitted(false);
    setServerError('');
  };

  if (submitted) {
    return <ConfirmationSummary data={formData} onReset={handleReset} />;
  }

  // Get tomorrow's date as min date for reservation
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="inquiry-form-wrapper" id="inquiry-form-wrapper">
      <div className="inquiry-form__header">
        <span className="section__label">Reservations</span>
        <h2 className="section__title">Reserve Your Table</h2>
        <p className="section__subtitle">
          Complete the form below and we&rsquo;ll confirm your table shortly.
        </p>
      </div>

      <form className="inquiry-form" onSubmit={handleSubmit} noValidate id="inquiry-form">
        <div className="form-group">
          <label className="form-label" htmlFor="inquiry-name">Full Name</label>
          <input
            className={`form-input ${errors.name ? 'form-input--error' : ''}`}
            type="text"
            id="inquiry-name"
            name="name"
            placeholder="e.g. John Doe"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="inquiry-phone">Phone Number</label>
          <input
            className={`form-input ${errors.phone ? 'form-input--error' : ''}`}
            type="tel"
            id="inquiry-phone"
            name="phone"
            placeholder="e.g. +91 98765 43210"
            value={formData.phone}
            onChange={handleChange}
          />
          {errors.phone && <span className="form-error">{errors.phone}</span>}
        </div>

        <div className="inquiry-form__row">
          <div className="form-group">
            <label className="form-label" htmlFor="inquiry-date">Preferred Date</label>
            <input
              className={`form-input ${errors.date ? 'form-input--error' : ''}`}
              type="date"
              id="inquiry-date"
              name="date"
              min={minDate}
              value={formData.date}
              onChange={handleChange}
            />
            {errors.date && <span className="form-error">{errors.date}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="inquiry-guests">Number of Guests</label>
            <input
              className={`form-input ${errors.guests ? 'form-input--error' : ''}`}
              type="number"
              id="inquiry-guests"
              name="guests"
              placeholder="e.g. 4"
              min="1"
              max="20"
              value={formData.guests}
              onChange={handleChange}
            />
            {errors.guests && <span className="form-error">{errors.guests}</span>}
          </div>
        </div>

        {serverError && (
          <div className="inquiry-form__server-error" id="server-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {serverError}
          </div>
        )}

        <button
          type="submit"
          className={`btn btn--primary btn--lg inquiry-form__submit ${loading ? 'btn--loading' : ''}`}
          disabled={loading}
          id="inquiry-submit"
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Submitting...
            </>
          ) : (
            'Submit Inquiry'
          )}
        </button>
      </form>
    </div>
  );
};

export default InquiryForm;
