import { useState } from 'react';
import API from '../api/api';
import ConfirmationSummary from './ConfirmationSummary';
import './InquiryForm.css';

const InquiryForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    inquiryType: 'Private Banquet & Buyout',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\+?[\d\s-]{7,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Enter a valid phone number';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      await API.post('/api/inquiries', formData);
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
    setFormData({
      name: '',
      phone: '',
      email: '',
      inquiryType: 'Private Banquet & Buyout',
      message: '',
    });
    setErrors({});
    setSubmitted(false);
    setServerError('');
  };

  if (submitted) {
    return <ConfirmationSummary data={formData} onReset={handleReset} />;
  }

  return (
    <div className="inquiry-form-wrapper" id="inquiry-form-wrapper">
      <div className="inquiry-form__header">
        <span className="section__label">Special Occasions &amp; Contact</span>
        <h2 className="section__title">Private Events &amp; Inquiries</h2>
        <p className="section__subtitle">
          Planning a private banquet, corporate event, wedding reception, or have general questions? Send our hospitality team a direct message.
        </p>
      </div>

      {/* Helpful reminder pointing to the visual table floor plan */}
      <div className="inquiry-reservation-tip" style={{
        background: 'rgba(200, 150, 62, 0.08)',
        border: '1px dashed var(--color-primary-500)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        marginBottom: 'var(--space-lg)',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-neutral-300)',
        lineHeight: 1.5,
      }}>
        💡 <strong>Looking for regular dining tables?</strong> Please use our{' '}
        <a href="#visual-floor-plan" style={{ color: 'var(--color-primary-400)', fontWeight: 600, textDecoration: 'underline' }}>
          Interactive 30-Table Floor Map above
        </a>{' '}
        for instant guaranteed confirmation and a digital dining pass!
      </div>

      <form className="inquiry-form" onSubmit={handleSubmit} noValidate id="inquiry-form">
        <div className="form-group">
          <label className="form-label" htmlFor="inquiry-name">
            Full Name *
          </label>
          <input
            className={`form-input ${errors.name ? 'form-input--error' : ''}`}
            type="text"
            id="inquiry-name"
            name="name"
            placeholder="e.g. Vikram Singhania"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="inquiry-form__row">
          <div className="form-group">
            <label className="form-label" htmlFor="inquiry-phone">
              Phone Number *
            </label>
            <input
              className={`form-input ${errors.phone ? 'form-input--error' : ''}`}
              type="tel"
              id="inquiry-phone"
              name="phone"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="inquiry-email">
              Email Address
            </label>
            <input
              className="form-input"
              type="email"
              id="inquiry-email"
              name="email"
              placeholder="vikram@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="inquiry-type">
            Inquiry Purpose
          </label>
          <select
            className="form-input"
            id="inquiry-type"
            name="inquiryType"
            value={formData.inquiryType}
            onChange={handleChange}
          >
            <option value="Private Banquet &amp; Buyout">Private Banquet &amp; Restaurant Buyout</option>
            <option value="Event Catering">Outdoor &amp; Event Catering</option>
            <option value="Corporate Dinner">Corporate Dinner &amp; VIP Meeting</option>
            <option value="General Feedback &amp; Questions">General Questions &amp; Feedback</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="inquiry-message">
            Message &amp; Event Details
          </label>
          <textarea
            className="form-input"
            id="inquiry-message"
            name="message"
            rows={4}
            placeholder="Tell us about your event, expected guests, preferred dates, or special dietary requirements..."
            value={formData.message}
            onChange={handleChange}
            style={{ resize: 'vertical' }}
          ></textarea>
        </div>

        {serverError && (
          <div className="inquiry-form__server-error" id="server-error">
            <span>⚠️</span>
            <span>{serverError}</span>
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
              Sending Inquiry...
            </>
          ) : (
            '📨 Send Event & Hospitality Inquiry'
          )}
        </button>
      </form>
    </div>
  );
};

export default InquiryForm;
