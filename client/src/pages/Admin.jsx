import { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const Admin = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  const fetchInquiries = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/inquiries');
      setInquiries(res.data || []);
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
      setError(
        err.response?.data?.message ||
          'Failed to load inquiries. Ensure the backend server and MongoDB are connected.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const filteredInquiries = inquiries.filter((inq) => {
    const query = filterSearch.toLowerCase();
    return (
      inq.name?.toLowerCase().includes(query) ||
      inq.phone?.toLowerCase().includes(query) ||
      (inq.date && new Date(inq.date).toLocaleDateString().includes(query))
    );
  });

  return (
    <div className="page admin-page" id="page-admin">
      <section className="page-header">
        <div className="container">
          <span className="section__label">Admin Portal</span>
          <h1 className="section__title">Table Inquiries</h1>
          <div className="divider divider--center"></div>
          <p className="section__subtitle">
            View and manage real-time reservation inquiries submitted by guests.
          </p>
        </div>
      </section>

      <section className="section admin-section">
        <div className="container">
          {/* Header Actions Bar */}
          <div className="admin-actions-bar">
            <div className="admin-search-wrapper">
              <input
                type="text"
                className="form-input admin-search-input"
                placeholder="Search by name, phone, or date..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                id="admin-search"
              />
            </div>

            <div className="admin-stats-group">
              <span className="badge" id="admin-count-badge">
                Total Inquiries: {inquiries.length}
              </span>
              <button
                className="btn btn--outline btn--sm"
                onClick={fetchInquiries}
                disabled={loading}
                id="admin-refresh-btn"
              >
                {loading ? <span className="spinner"></span> : '🔄'} Refresh
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="admin-loading card text-center">
              <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto var(--space-md)' }}></div>
              <p className="section__subtitle" style={{ margin: '0 auto' }}>Fetching inquiries from database...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="admin-error card text-center" id="admin-error-box">
              <div className="admin-error__icon">⚠️</div>
              <h3 className="section__title" style={{ fontSize: 'var(--text-xl)' }}>Unable to Load Inquiries</h3>
              <p className="section__subtitle" style={{ margin: '0 auto var(--space-lg)' }}>
                {error}
              </p>
              <button className="btn btn--primary" onClick={fetchInquiries}>
                Retry Connection
              </button>
            </div>
          )}

          {/* Inquiries Content */}
          {!loading && !error && (
            <>
              {filteredInquiries.length === 0 ? (
                <div className="admin-empty card text-center" id="admin-empty-box">
                  <div className="admin-empty__icon">📋</div>
                  <h3 className="section__title" style={{ fontSize: 'var(--text-xl)' }}>
                    {inquiries.length === 0 ? 'No Inquiries Yet' : 'No matching inquiries found'}
                  </h3>
                  <p className="section__subtitle" style={{ margin: '0 auto' }}>
                    {inquiries.length === 0
                      ? 'When customers submit table inquiries from the contact page, they will appear here.'
                      : 'Try adjusting your search terms.'}
                  </p>
                </div>
              ) : (
                <div className="table-wrapper animate-fade-in" id="admin-table-container">
                  <table className="table" id="admin-inquiries-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Guest Name</th>
                        <th>Phone</th>
                        <th>Preferred Date</th>
                        <th>Guests</th>
                        <th>Submitted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInquiries.map((inq, idx) => {
                        const reservationDate = inq.date
                          ? new Date(inq.date).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A';

                        const submittedDate = inq.createdAt
                          ? new Date(inq.createdAt).toLocaleString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Recent';

                        return (
                          <tr key={inq._id || idx} id={`inquiry-row-${idx}`}>
                            <td><strong>{idx + 1}</strong></td>
                            <td>
                              <span className="admin-guest-name">{inq.name}</span>
                            </td>
                            <td>
                              <a href={`tel:${inq.phone}`} className="admin-phone-link">
                                {inq.phone}
                              </a>
                            </td>
                            <td>
                              <span className="admin-date-tag">📅 {reservationDate}</span>
                            </td>
                            <td>
                              <span className="badge">{inq.guests} {inq.guests === 1 ? 'Guest' : 'Guests'}</span>
                            </td>
                            <td>
                              <span className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>
                                {submittedDate}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Admin;
