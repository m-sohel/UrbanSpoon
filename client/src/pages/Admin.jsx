import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/api';
import TableMap from '../components/TableMap';
import './Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('reservations'); // 'reservations' or 'inquiries'

  // Reservations state
  const [reservations, setReservations] = useState([]);
  const [resLoading, setResLoading] = useState(true);
  const [resError, setResError] = useState('');
  const [resFilterSearch, setResFilterSearch] = useState('');

  // Inquiries state
  const [inquiries, setInquiries] = useState([]);
  const [inqLoading, setInqLoading] = useState(false);
  const [inqError, setInqError] = useState('');
  const [inqFilterSearch, setInqFilterSearch] = useState('');

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch confirmed reservations
  const fetchReservations = async () => {
    setResLoading(true);
    setResError('');
    try {
      const res = await API.get('/api/reservations');
      setReservations(res.data?.reservations || []);
    } catch (err) {
      console.error('Failed to fetch reservations:', err);
      if (err.response?.status === 401) {
        setResError('Session expired. Please sign in again.');
      } else if (err.response?.status === 403) {
        setResError('Access denied: Admin role required.');
      } else {
        setResError('Failed to load table reservations from server.');
      }
    } finally {
      setResLoading(false);
    }
  };

  // Fetch contact inquiries
  const fetchInquiries = async () => {
    setInqLoading(true);
    setInqError('');
    try {
      const res = await API.get('/api/inquiries');
      setInquiries(res.data || []);
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
      setInqError('Failed to load inquiries from server.');
    } finally {
      setInqLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchInquiries();
  }, []);

  // Cancel / Free a table
  const handleCancelReservation = async (id, tableNumber, ref) => {
    if (!window.confirm(`Are you sure you want to cancel reservation ${ref} for Table ${tableNumber}? This table will immediately become available for booking.`)) {
      return;
    }
    try {
      await API.patch(`/api/reservations/${id}/cancel`);
      await fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel reservation.');
    }
  };

  const filteredReservations = reservations.filter((r) => {
    const q = resFilterSearch.toLowerCase();
    return (
      r.guestName?.toLowerCase().includes(q) ||
      r.bookingRef?.toLowerCase().includes(q) ||
      r.guestPhone?.toLowerCase().includes(q) ||
      r.tableName?.toLowerCase().includes(q) ||
      r.date?.includes(q)
    );
  });

  const filteredInquiries = inquiries.filter((inq) => {
    const q = inqFilterSearch.toLowerCase();
    return (
      inq.name?.toLowerCase().includes(q) ||
      inq.phone?.toLowerCase().includes(q) ||
      (inq.date && new Date(inq.date).toLocaleDateString().includes(q))
    );
  });

  return (
    <div className="page admin-page" id="page-admin">
      <section className="page-header">
        <div className="container">
          <span className="section__label">Urban Spoon Management</span>
          <h1 className="section__title">Administration Dashboard</h1>
          <div className="divider divider--center"></div>
          <p className="section__subtitle">
            Oversee real-time table floor occupancy, manage confirmed reservations, and inspect guest inquiries.
          </p>
        </div>
      </section>

      <section className="section admin-section">
        <div className="container">
          {/* Admin Authentication Status Ribbon */}
          <div className="admin-user-ribbon" id="admin-user-ribbon">
            <div className="admin-user-info">
              <span className="admin-avatar">🛡️</span>
              <div>
                <div className="admin-user-name">
                  <strong>{user?.name || 'Administrator'}</strong>
                  <span className="badge badge--admin">RBAC: {user?.role?.toUpperCase() || 'ADMIN'}</span>
                </div>
                <div className="admin-user-email text-muted">{user?.email || 'admin@urbanspoon.com'}</div>
              </div>
            </div>
            <button
              className="btn btn--outline btn--sm btn-logout"
              onClick={handleLogout}
              id="admin-logout-btn"
              title="End admin session"
            >
              🚪 Sign Out
            </button>
          </div>

          {/* Tab Switcher: Reservations / Live Floor Radar vs Inquiries */}
          <div className="admin-tabs-nav" id="admin-tabs-nav">
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'reservations' ? 'admin-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('reservations')}
              id="tab-btn-reservations"
            >
              🍽️ 30-Table Reservations &amp; Live Radar ({reservations.filter((r) => r.status === 'confirmed').length})
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'inquiries' ? 'admin-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('inquiries')}
              id="tab-btn-inquiries"
            >
              📋 Contact Inquiries ({inquiries.length})
            </button>
          </div>

          {/* TAB 1: 30-TABLE RESERVATIONS & LIVE RADAR */}
          {activeTab === 'reservations' && (
            <div className="admin-tab-content animate-fade-in" id="tab-content-reservations">
              {/* Embedded Live 30-Table Floor Radar */}
              <div style={{ marginBottom: 'var(--space-3xl)' }}>
                <div className="section-title-wrapper" style={{ marginBottom: 'var(--space-md)' }}>
                  <h3 className="section__title" style={{ fontSize: 'var(--text-xl)' }}>
                    Live 30-Table Floor Radar
                  </h3>
                  <p className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>
                    Check live visual seating occupancy for any date or dining slot.
                  </p>
                </div>
                <TableMap onSelectTable={() => {}} />
              </div>

              {/* Reservations Records Table */}
              <div className="admin-actions-bar">
                <div className="admin-search-wrapper">
                  <input
                    type="text"
                    className="form-input admin-search-input"
                    placeholder="Search reservations by guest, ref code, table, or phone..."
                    value={resFilterSearch}
                    onChange={(e) => setResFilterSearch(e.target.value)}
                    id="admin-res-search"
                  />
                </div>

                <div className="admin-stats-group">
                  <span className="badge">
                    Total Bookings: {reservations.length}
                  </span>
                  <button
                    className="btn btn--outline btn--sm"
                    onClick={fetchReservations}
                    disabled={resLoading}
                    id="admin-res-refresh"
                  >
                    {resLoading ? <span className="spinner"></span> : '🔄'} Refresh
                  </button>
                </div>
              </div>

              {resLoading && (
                <div className="admin-loading card text-center">
                  <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto var(--space-md)' }}></div>
                  <p className="text-muted">Loading reservations data...</p>
                </div>
              )}

              {resError && (
                <div className="admin-error card text-center">
                  <p>{resError}</p>
                  <button className="btn btn--primary" onClick={fetchReservations}>
                    Retry
                  </button>
                </div>
              )}

              {!resLoading && !resError && (
                <>
                  {filteredReservations.length === 0 ? (
                    <div className="admin-empty card text-center">
                      <div className="admin-empty__icon">🍽️</div>
                      <h3 className="section__title" style={{ fontSize: 'var(--text-xl)' }}>
                        No Reservations Found
                      </h3>
                      <p className="text-muted">
                        When guests book tables from the interactive map, their confirmed passes will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="table-wrapper animate-fade-in">
                      <table className="table" id="admin-reservations-table">
                        <thead>
                          <tr>
                            <th>Ref #</th>
                            <th>Table</th>
                            <th>Date &amp; Slot</th>
                            <th>Guest Name</th>
                            <th>Contact</th>
                            <th>Party</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReservations.map((res) => (
                            <tr key={res._id || res.bookingRef}>
                              <td>
                                <strong style={{ color: 'var(--color-primary-400)', fontFamily: 'monospace' }}>
                                  {res.bookingRef}
                                </strong>
                              </td>
                              <td>
                                <span className="admin-guest-name">
                                  Table {res.tableNumber}
                                </span>
                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                  {res.zone}
                                </div>
                              </td>
                              <td>
                                <div>📅 {res.date}</div>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                  ⏰ {res.timeSlot}
                                </div>
                              </td>
                              <td>
                                <strong>{res.guestName}</strong>
                                {res.specialRequests && (
                                  <div className="text-muted" style={{ fontSize: '0.7rem', fontStyle: 'italic' }}>
                                    "{res.specialRequests}"
                                  </div>
                                )}
                              </td>
                              <td>
                                <a href={`tel:${res.guestPhone}`} className="admin-phone-link">
                                  {res.guestPhone}
                                </a>
                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                  {res.guestEmail}
                                </div>
                              </td>
                              <td>
                                <span className="badge">{res.guests} P</span>
                              </td>
                              <td>
                                <span
                                  className="badge"
                                  style={{
                                    background:
                                      res.status === 'confirmed'
                                        ? 'rgba(34, 197, 94, 0.15)'
                                        : 'rgba(239, 68, 68, 0.15)',
                                    color: res.status === 'confirmed' ? '#4ade80' : '#f87171',
                                    borderColor:
                                      res.status === 'confirmed'
                                        ? 'rgba(34, 197, 94, 0.3)'
                                        : 'rgba(239, 68, 68, 0.3)',
                                  }}
                                >
                                  {res.status?.toUpperCase()}
                                </span>
                              </td>
                              <td>
                                {res.status === 'confirmed' && (
                                  <button
                                    type="button"
                                    className="btn btn--outline btn--sm"
                                    style={{ padding: '3px 8px', fontSize: '0.7rem', borderColor: '#ef4444', color: '#f87171' }}
                                    onClick={() => handleCancelReservation(res._id, res.tableNumber, res.bookingRef)}
                                    title="Cancel reservation and free up table"
                                  >
                                    Free Table
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 2: INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="admin-tab-content animate-fade-in" id="tab-content-inquiries">
              <div className="admin-actions-bar">
                <div className="admin-search-wrapper">
                  <input
                    type="text"
                    className="form-input admin-search-input"
                    placeholder="Search by name, phone, or date..."
                    value={inqFilterSearch}
                    onChange={(e) => setInqFilterSearch(e.target.value)}
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
                    disabled={inqLoading}
                    id="admin-refresh-btn"
                  >
                    {inqLoading ? <span className="spinner"></span> : '🔄'} Refresh
                  </button>
                </div>
              </div>

              {inqLoading && (
                <div className="admin-loading card text-center">
                  <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto var(--space-md)' }}></div>
                  <p className="text-muted">Fetching inquiries...</p>
                </div>
              )}

              {inqError && (
                <div className="admin-error card text-center" id="admin-error-box">
                  <div className="admin-error__icon">⚠️</div>
                  <h3 className="section__title" style={{ fontSize: 'var(--text-xl)' }}>Unable to Load Inquiries</h3>
                  <p className="section__subtitle" style={{ margin: '0 auto var(--space-lg)' }}>
                    {inqError}
                  </p>
                  <button className="btn btn--primary" onClick={fetchInquiries}>
                    Retry Connection
                  </button>
                </div>
              )}

              {!inqLoading && !inqError && (
                <>
                  {filteredInquiries.length === 0 ? (
                    <div className="admin-empty card text-center" id="admin-empty-box">
                      <div className="admin-empty__icon">📋</div>
                      <h3 className="section__title" style={{ fontSize: 'var(--text-xl)' }}>
                        {inquiries.length === 0 ? 'No Inquiries Yet' : 'No matching inquiries found'}
                      </h3>
                      <p className="section__subtitle" style={{ margin: '0 auto' }}>
                        {inquiries.length === 0
                          ? 'When customers submit general contact messages, they will appear here.'
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
          )}
        </div>
      </section>
    </div>
  );
};

export default Admin;
