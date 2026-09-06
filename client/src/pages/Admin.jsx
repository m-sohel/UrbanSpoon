import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/api';
import TableMap from '../components/TableMap';
import './Admin.css';

// Master list of 30 tables for Host Stand quick walk-in seating
const TABLE_OPTIONS = Array.from({ length: 30 }, (_, i) => {
  const num = i + 1;
  let zone = 'Main Dining Hall';
  let capacity = 4;
  if (num <= 8) {
    zone = 'Window Promenade';
    capacity = [1, 2, 5, 6].includes(num) ? 2 : 4;
  } else if (num >= 21 && num <= 26) {
    zone = 'Royal Booths';
    capacity = [23, 24].includes(num) ? 4 : num === 26 ? 8 : 6;
  } else if (num >= 27) {
    zone = 'Terrace Starlight';
    capacity = [27, 28].includes(num) ? 2 : 4;
  } else {
    zone = 'Main Dining Hall';
    capacity = num === 16 ? 8 : [11, 12, 15, 19, 20].includes(num) ? 6 : 4;
  }
  return { number: num, zone, capacity };
});

const DINING_SLOTS = [
  '12:00 PM - 02:00 PM',
  '02:00 PM - 04:00 PM',
  '06:00 PM - 08:00 PM',
  '08:00 PM - 10:00 PM',
  '10:00 PM - 11:30 PM',
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState('reservations'); // 'reservations' or 'inquiries'

  // Reservations state
  const [reservations, setReservations] = useState([]);
  const [resLoading, setResLoading] = useState(true);
  const [resError, setResError] = useState('');
  const [resFilterSearch, setResFilterSearch] = useState('');
  const [resFilterStatus, setResFilterStatus] = useState('all');

  // Inquiries state
  const [inquiries, setInquiries] = useState([]);
  const [inqLoading, setInqLoading] = useState(false);
  const [inqError, setInqError] = useState('');
  const [inqFilterSearch, setInqFilterSearch] = useState('');
  const [inqFilterStatus, setInqFilterStatus] = useState('all');

  // Walk-in Modal State
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [walkinTable, setWalkinTable] = useState(1);
  const [walkinGuests, setWalkinGuests] = useState(2);
  const [walkinSlot, setWalkinSlot] = useState(DINING_SLOTS[3]);
  const [walkinNotes, setWalkinNotes] = useState('');
  const [walkinLoading, setWalkinLoading] = useState(false);
  const [walkinError, setWalkinError] = useState('');
  const [walkinSuccess, setWalkinSuccess] = useState('');

  // Service Run Sheet Modal State
  const todayStr = new Date().toISOString().split('T')[0];
  const [showRunSheet, setShowRunSheet] = useState(false);
  const [runSheetDate, setRunSheetDate] = useState(todayStr);

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

  // Update reservation dining status (confirmed -> seated -> completed -> cancelled)
  const handleUpdateStatus = async (id, newStatus, tableNumber, ref) => {
    const actionVerb =
      newStatus === 'seated'
        ? 'seat guest at'
        : newStatus === 'completed'
        ? 'complete dining & free'
        : 'cancel reservation for';

    if (
      newStatus === 'cancelled' &&
      !window.confirm(`Are you sure you want to cancel booking ${ref} for Table ${tableNumber}?`)
    ) {
      return;
    }

    try {
      await API.patch(`/api/reservations/${id}/status`, { status: newStatus });
      await fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${actionVerb} Table ${tableNumber}.`);
    }
  };

  // Update inquiry pipeline status (new -> contacted -> quoted -> closed)
  const handleUpdateInquiryStatus = async (id, newStatus) => {
    try {
      await API.patch(`/api/inquiries/${id}/status`, { status: newStatus });
      setInquiries((prev) =>
        prev.map((inq) => (inq._id === id ? { ...inq, status: newStatus } : inq))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update inquiry status.');
    }
  };

  // Quick Walk-in Seating submission
  const handleSeatWalkin = async (e) => {
    e.preventDefault();
    setWalkinLoading(true);
    setWalkinError('');
    setWalkinSuccess('');

    try {
      const res = await API.post('/api/reservations/walkin', {
        tableNumber: Number(walkinTable),
        timeSlot: walkinSlot,
        guests: Number(walkinGuests),
        specialRequests: walkinNotes || 'Host stand walk-in party',
      });

      setWalkinSuccess(
        `Table ${walkinTable} seated successfully! Pass: ${res.data?.reservation?.bookingRef || 'CONFIRMED'}`
      );
      setTimeout(() => {
        setShowWalkinModal(false);
        setWalkinSuccess('');
        setWalkinNotes('');
      }, 1200);
      await fetchReservations();
    } catch (err) {
      setWalkinError(err.response?.data?.message || 'Failed to seat walk-in party.');
    } finally {
      setWalkinLoading(false);
    }
  };

  // Export reservations to CSV
  const handleExportCSV = () => {
    if (reservations.length === 0) {
      alert('No reservations available to export.');
      return;
    }

    const headers = [
      'Booking Ref',
      'Table Number',
      'Zone',
      'Date',
      'Time Slot',
      'Guest Name',
      'Phone',
      'Email',
      'Party Size',
      'Status',
      'Special Requests',
      'Created At',
    ];

    const rows = reservations.map((r) => [
      `"${r.bookingRef || ''}"`,
      `"${r.tableNumber || ''}"`,
      `"${r.zone || ''}"`,
      `"${r.date || ''}"`,
      `"${r.timeSlot || ''}"`,
      `"${(r.guestName || '').replace(/"/g, '""')}"`,
      `"${r.guestPhone || ''}"`,
      `"${r.guestEmail || ''}"`,
      `"${r.guests || ''}"`,
      `"${r.status || ''}"`,
      `"${(r.specialRequests || '').replace(/"/g, '""')}"`,
      `"${r.createdAt ? new Date(r.createdAt).toISOString() : ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `UrbanSpoon_Reservations_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Calculate Shift KPI Metrics
  const kpis = useMemo(() => {
    // 1. Today's covers
    const todayRes = reservations.filter((r) => r.date === todayStr && r.status !== 'cancelled');
    const todayCovers = todayRes.reduce((sum, r) => sum + (Number(r.guests) || 0), 0);

    // 2. Active tables (confirmed or seated)
    const activeTables = reservations.filter((r) => ['confirmed', 'seated'].includes(r.status));
    const activeCount = activeTables.length;
    const occupancyRate = Math.min(100, Math.round((activeCount / 30) * 100));

    // 3. High-demand zone
    const zoneFrequency = {};
    reservations.forEach((r) => {
      if (r.status !== 'cancelled') {
        const zone = r.zone || 'Main Dining';
        zoneFrequency[zone] = (zoneFrequency[zone] || 0) + 1;
      }
    });
    let topZone = 'Window Promenade';
    let maxBookings = 0;
    Object.entries(zoneFrequency).forEach(([zone, count]) => {
      if (count > maxBookings) {
        maxBookings = count;
        topZone = zone;
      }
    });

    // 4. Pending Inquiries
    const pendingInquiries = inquiries.filter((inq) => (inq.status || 'new') === 'new').length;

    return {
      todayCovers,
      todayResCount: todayRes.length,
      activeCount,
      occupancyRate,
      topZone,
      maxBookings,
      pendingInquiries,
    };
  }, [reservations, inquiries, todayStr]);

  // Filtered reservations
  const filteredReservations = reservations.filter((r) => {
    const q = resFilterSearch.toLowerCase();
    const matchesSearch =
      r.guestName?.toLowerCase().includes(q) ||
      r.bookingRef?.toLowerCase().includes(q) ||
      r.guestPhone?.toLowerCase().includes(q) ||
      r.tableName?.toLowerCase().includes(q) ||
      r.date?.includes(q) ||
      r.zone?.toLowerCase().includes(q);

    const matchesStatus = resFilterStatus === 'all' || r.status === resFilterStatus;

    return matchesSearch && matchesStatus;
  });

  // Filtered inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    const q = inqFilterSearch.toLowerCase();
    const matchesSearch =
      inq.name?.toLowerCase().includes(q) ||
      inq.phone?.toLowerCase().includes(q) ||
      inq.email?.toLowerCase().includes(q) ||
      inq.inquiryType?.toLowerCase().includes(q) ||
      (inq.date && new Date(inq.date).toLocaleDateString().includes(q));

    const matchesStatus = inqFilterStatus === 'all' || (inq.status || 'new') === inqFilterStatus;

    return matchesSearch && matchesStatus;
  });

  // Reservations for Run Sheet
  const runSheetReservations = reservations
    .filter((r) => (runSheetDate ? r.date === runSheetDate : true))
    .sort((a, b) => (a.timeSlot > b.timeSlot ? 1 : -1));

  return (
    <div className="page admin-page" id="page-admin">
      <section className="page-header no-print">
        <div className="container">
          <span className="section__label">Urban Spoon Management</span>
          <h1 className="section__title">Live Floor &amp; Service Control</h1>
          <div className="divider divider--center"></div>
          <p className="section__subtitle">
            Oversee real-time table turnover, host stand operations, dining lifecycle, and event inquiries.
          </p>
        </div>
      </section>

      <section className="section admin-section">
        <div className="container">
          {/* Admin User Status Ribbon */}
          <div className="admin-user-ribbon no-print" id="admin-user-ribbon">
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

          {/* LIVE SHIFT KPI METRICS BAR */}
          <div className="admin-kpi-grid no-print" id="admin-kpi-grid">
            <div className="admin-kpi-card" id="kpi-today-covers">
              <div className="admin-kpi-icon-wrap kpi-gold">👥</div>
              <div className="admin-kpi-content">
                <span className="admin-kpi-label">Today's Covers</span>
                <span className="admin-kpi-val">{kpis.todayCovers} Guests</span>
                <span className="admin-kpi-sub">{kpis.todayResCount} parties booked today</span>
              </div>
            </div>

            <div className="admin-kpi-card" id="kpi-occupancy">
              <div className="admin-kpi-icon-wrap kpi-blue">📊</div>
              <div className="admin-kpi-content">
                <span className="admin-kpi-label">Floor Occupancy</span>
                <span className="admin-kpi-val">{kpis.occupancyRate}%</span>
                <span className="admin-kpi-sub">
                  {kpis.activeCount} of 30 tables active / seated
                </span>
              </div>
            </div>

            <div className="admin-kpi-card" id="kpi-top-zone">
              <div className="admin-kpi-icon-wrap kpi-purple">🌟</div>
              <div className="admin-kpi-content">
                <span className="admin-kpi-label">Top Demand Zone</span>
                <span className="admin-kpi-val">{kpis.topZone}</span>
                <span className="admin-kpi-sub">{kpis.maxBookings} total bookings</span>
              </div>
            </div>

            <div className="admin-kpi-card" id="kpi-pending-inquiries">
              <div className="admin-kpi-icon-wrap kpi-green">📩</div>
              <div className="admin-kpi-content">
                <span className="admin-kpi-label">Pending Inquiries</span>
                <span className="admin-kpi-val">{kpis.pendingInquiries} New</span>
                <span className="admin-kpi-sub">Event &amp; banquet requests</span>
              </div>
            </div>
          </div>

          {/* Tab Switcher: Reservations / Floor Radar vs Inquiries */}
          <div className="admin-tabs-nav no-print" id="admin-tabs-nav">
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'reservations' ? 'admin-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('reservations')}
              id="tab-btn-reservations"
            >
              🍽️ Floor Service &amp; 30-Table Lifecycle ({reservations.length})
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'inquiries' ? 'admin-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('inquiries')}
              id="tab-btn-inquiries"
            >
              📋 Private Event Inquiry Pipeline ({inquiries.length})
            </button>
          </div>

          {/* TAB 1: 30-TABLE RESERVATIONS & LIVE RADAR */}
          {activeTab === 'reservations' && (
            <div className="admin-tab-content animate-fade-in" id="tab-content-reservations">
              {/* Embedded Live 30-Table Floor Radar */}
              <div className="no-print" style={{ marginBottom: 'var(--space-2xl)' }}>
                <div className="section-title-wrapper" style={{ marginBottom: 'var(--space-md)' }}>
                  <h3 className="section__title" style={{ fontSize: 'var(--text-xl)' }}>
                    Live 30-Table Floor Radar
                  </h3>
                  <p className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>
                    Visual floor plan dynamically reflecting confirmed, seated, and freed tables.
                  </p>
                </div>
                <TableMap onSelectTable={() => {}} />
              </div>

              {/* Host Stand Controls & Action Bar */}
              <div className="admin-actions-bar no-print" id="admin-res-action-bar">
                <div className="admin-search-wrapper">
                  <input
                    type="text"
                    className="form-input admin-search-input"
                    placeholder="Search guest, ref #, table, phone, or zone..."
                    value={resFilterSearch}
                    onChange={(e) => setResFilterSearch(e.target.value)}
                    id="admin-res-search"
                  />
                </div>

                {/* Status Filter Dropdown */}
                <div className="admin-filter-select-wrap">
                  <select
                    className="form-input admin-filter-select"
                    value={resFilterStatus}
                    onChange={(e) => setResFilterStatus(e.target.value)}
                    id="admin-status-filter"
                  >
                    <option value="all">All Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="seated">Seated (Dining)</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Primary Action Buttons */}
                <div className="admin-control-buttons">
                  <button
                    type="button"
                    className="btn btn--primary btn--sm admin-btn-walkin"
                    onClick={() => setShowWalkinModal(true)}
                    id="btn-seat-walkin"
                  >
                    ⚡ + Seat Walk-in
                  </button>

                  <button
                    type="button"
                    className="btn btn--outline btn--sm admin-btn-csv"
                    onClick={handleExportCSV}
                    id="btn-export-csv"
                    title="Download reservations data as CSV file"
                  >
                    📥 Export CSV
                  </button>

                  <button
                    type="button"
                    className="btn btn--outline btn--sm admin-btn-runsheet"
                    onClick={() => setShowRunSheet(true)}
                    id="btn-service-runsheet"
                    title="Open print-ready front of house run sheet"
                  >
                    🖨️ Service Run Sheet
                  </button>

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
                  <div
                    className="spinner"
                    style={{ width: '36px', height: '36px', margin: '0 auto var(--space-md)' }}
                  ></div>
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
                        No records match your search or filter parameters.
                      </p>
                    </div>
                  ) : (
                    <div className="table-wrapper animate-fade-in no-print">
                      <table className="table" id="admin-reservations-table">
                        <thead>
                          <tr>
                            <th>Ref #</th>
                            <th>Table &amp; Zone</th>
                            <th>Date &amp; Slot</th>
                            <th>Guest Info</th>
                            <th>Party</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'center' }}>Turnover Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReservations.map((res) => {
                            const isConfirmed = res.status === 'confirmed';
                            const isSeated = res.status === 'seated';
                            const isCompleted = res.status === 'completed';
                            const isCancelled = res.status === 'cancelled';

                            return (
                              <tr
                                key={res._id || res.bookingRef}
                                className={isSeated ? 'row-seated-highlight' : ''}
                              >
                                <td>
                                  <strong className="admin-ref-code">{res.bookingRef}</strong>
                                </td>
                                <td>
                                  <span className="admin-table-badge">Table {res.tableNumber}</span>
                                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                                    {res.zone}
                                  </div>
                                </td>
                                <td>
                                  <div style={{ fontWeight: 500 }}>📅 {res.date}</div>
                                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                    ⏰ {res.timeSlot}
                                  </div>
                                </td>
                                <td>
                                  <strong className="admin-guest-name">{res.guestName}</strong>
                                  <div style={{ fontSize: '0.75rem' }}>
                                    <a href={`tel:${res.guestPhone}`} className="admin-phone-link">
                                      {res.guestPhone}
                                    </a>
                                  </div>
                                  {res.specialRequests && (
                                    <div className="admin-notes-tag" title={res.specialRequests}>
                                      💬 {res.specialRequests}
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <span className="badge">{res.guests} P</span>
                                </td>
                                <td>
                                  <span className={`status-pill status-pill--${res.status}`}>
                                    {isSeated && <span className="live-pulse-dot"></span>}
                                    {res.status?.toUpperCase()}
                                  </span>
                                </td>
                                <td>
                                  <div className="admin-turnover-actions">
                                    {/* Action 1: Seat Guest (if confirmed) */}
                                    {isConfirmed && (
                                      <button
                                        type="button"
                                        className="btn-action btn-action--seat"
                                        onClick={() =>
                                          handleUpdateStatus(
                                            res._id,
                                            'seated',
                                            res.tableNumber,
                                            res.bookingRef
                                          )
                                        }
                                        title="Seat guest at table"
                                      >
                                        🪑 Seat Guest
                                      </button>
                                    )}

                                    {/* Action 2: Complete Dining & Free Table (if seated) */}
                                    {isSeated && (
                                      <button
                                        type="button"
                                        className="btn-action btn-action--complete"
                                        onClick={() =>
                                          handleUpdateStatus(
                                            res._id,
                                            'completed',
                                            res.tableNumber,
                                            res.bookingRef
                                          )
                                        }
                                        title="Mark dining complete and free table"
                                      >
                                        ✅ Complete Dining
                                      </button>
                                    )}

                                    {/* Action 3: Cancel Booking */}
                                    {(isConfirmed || isSeated) && (
                                      <button
                                        type="button"
                                        className="btn-action btn-action--cancel"
                                        onClick={() =>
                                          handleUpdateStatus(
                                            res._id,
                                            'cancelled',
                                            res.tableNumber,
                                            res.bookingRef
                                          )
                                        }
                                        title="Cancel reservation"
                                      >
                                        ❌ Cancel
                                      </button>
                                    )}

                                    {/* Terminal states */}
                                    {isCompleted && (
                                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                        Table Freed
                                      </span>
                                    )}
                                    {isCancelled && (
                                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                        Cancelled
                                      </span>
                                    )}
                                  </div>
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

          {/* TAB 2: PRIVATE EVENT INQUIRY PIPELINE */}
          {activeTab === 'inquiries' && (
            <div className="admin-tab-content animate-fade-in" id="tab-content-inquiries">
              <div className="admin-actions-bar no-print">
                <div className="admin-search-wrapper">
                  <input
                    type="text"
                    className="form-input admin-search-input"
                    placeholder="Search by name, phone, email, or inquiry type..."
                    value={inqFilterSearch}
                    onChange={(e) => setInqFilterSearch(e.target.value)}
                    id="admin-search"
                  />
                </div>

                {/* Status Filter Dropdown */}
                <div className="admin-filter-select-wrap">
                  <select
                    className="form-input admin-filter-select"
                    value={inqFilterStatus}
                    onChange={(e) => setInqFilterStatus(e.target.value)}
                    id="admin-inq-status-filter"
                  >
                    <option value="all">All Pipeline Stages</option>
                    <option value="new">🟡 New</option>
                    <option value="contacted">🔵 Contacted</option>
                    <option value="quoted">🟣 Quoted</option>
                    <option value="closed">🟢 Closed</option>
                  </select>
                </div>

                <div className="admin-stats-group">
                  <span className="badge" id="admin-count-badge">
                    Total: {inquiries.length}
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
                  <div
                    className="spinner"
                    style={{ width: '36px', height: '36px', margin: '0 auto var(--space-md)' }}
                  ></div>
                  <p className="text-muted">Fetching inquiries...</p>
                </div>
              )}

              {inqError && (
                <div className="admin-error card text-center" id="admin-error-box">
                  <div className="admin-error__icon">⚠️</div>
                  <h3 className="section__title" style={{ fontSize: 'var(--text-xl)' }}>
                    Unable to Load Inquiries
                  </h3>
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
                          ? 'When customers submit banquet or event messages, they will appear here.'
                          : 'Try adjusting your search or stage filter.'}
                      </p>
                    </div>
                  ) : (
                    <div className="table-wrapper animate-fade-in" id="admin-table-container">
                      <table className="table" id="admin-inquiries-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Guest Contact</th>
                            <th>Inquiry Type</th>
                            <th>Event Details</th>
                            <th>Message</th>
                            <th>Pipeline Stage</th>
                            <th>Received</th>
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

                            const currentStatus = inq.status || 'new';

                            return (
                              <tr key={inq._id || idx} id={`inquiry-row-${idx}`}>
                                <td>
                                  <strong>{idx + 1}</strong>
                                </td>
                                <td>
                                  <span className="admin-guest-name">{inq.name}</span>
                                  <div>
                                    <a href={`tel:${inq.phone}`} className="admin-phone-link">
                                      {inq.phone}
                                    </a>
                                  </div>
                                  {inq.email && (
                                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                                      {inq.email}
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <span className="inquiry-type-tag">
                                    {inq.inquiryType || 'General Inquiry'}
                                  </span>
                                </td>
                                <td>
                                  <div>📅 {reservationDate}</div>
                                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                    👥 {inq.guests} {inq.guests === 1 ? 'Guest' : 'Guests'}
                                  </div>
                                </td>
                                <td>
                                  <div className="inquiry-message-cell" title={inq.message}>
                                    {inq.message || 'No special instructions provided.'}
                                  </div>
                                </td>
                                <td>
                                  <div className="inquiry-status-selector-wrap">
                                    <select
                                      className={`inquiry-status-dropdown status-pill--${currentStatus}`}
                                      value={currentStatus}
                                      onChange={(e) =>
                                        handleUpdateInquiryStatus(inq._id, e.target.value)
                                      }
                                      id={`select-status-${inq._id || idx}`}
                                    >
                                      <option value="new">🟡 New</option>
                                      <option value="contacted">🔵 Contacted</option>
                                      <option value="quoted">🟣 Quoted</option>
                                      <option value="closed">🟢 Closed</option>
                                    </select>
                                  </div>
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

      {/* QUICK WALK-IN SEATING MODAL */}
      {showWalkinModal && (
        <div className="modal-backdrop animate-fade-in" id="walkin-modal-backdrop">
          <div className="modal-card admin-modal" id="walkin-modal">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">⚡ Quick Walk-in Seating</h3>
                <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>
                  Instantly seat guests at the host stand without online pre-booking.
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowWalkinModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSeatWalkin} className="modal-body">
              {walkinError && <div className="form-error-banner">{walkinError}</div>}
              {walkinSuccess && <div className="form-success-banner">{walkinSuccess}</div>}

              <div className="form-group">
                <label className="form-label" htmlFor="walkin-table-select">
                  Select Table (1 - 30)
                </label>
                <select
                  id="walkin-table-select"
                  className="form-input"
                  value={walkinTable}
                  onChange={(e) => setWalkinTable(e.target.value)}
                  required
                >
                  {TABLE_OPTIONS.map((t) => (
                    <option key={t.number} value={t.number}>
                      Table {t.number} — {t.zone} ({t.capacity} Max Guests)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="walkin-guests-input">
                    Party Size (Guests)
                  </label>
                  <input
                    type="number"
                    id="walkin-guests-input"
                    className="form-input"
                    min="1"
                    max="10"
                    value={walkinGuests}
                    onChange={(e) => setWalkinGuests(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ flex: 1.5 }}>
                  <label className="form-label" htmlFor="walkin-slot-select">
                    Service Time Slot
                  </label>
                  <select
                    id="walkin-slot-select"
                    className="form-input"
                    value={walkinSlot}
                    onChange={(e) => setWalkinSlot(e.target.value)}
                    required
                  >
                    {DINING_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="walkin-notes-input">
                  Special Requests / Server Notes (Optional)
                </label>
                <input
                  type="text"
                  id="walkin-notes-input"
                  className="form-input"
                  placeholder="e.g. High chair needed, anniversary champagne, quick lunch"
                  value={walkinNotes}
                  onChange={(e) => setWalkinNotes(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => setShowWalkinModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={walkinLoading}
                  id="btn-confirm-walkin"
                >
                  {walkinLoading ? <span className="spinner"></span> : '🪑 Seat Table Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DAILY SERVICE RUN SHEET MODAL (PRINT READY) */}
      {showRunSheet && (
        <div className="modal-backdrop animate-fade-in" id="runsheet-modal-backdrop">
          <div className="modal-card runsheet-modal" id="runsheet-modal">
            <div className="modal-header no-print">
              <div>
                <h3 className="modal-title">🖨️ Daily Service Run Sheet</h3>
                <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>
                  Kitchen &amp; Front-of-House guest list for service briefing.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => window.print()}
                  id="btn-print-sheet"
                >
                  🖨️ Print Sheet
                </button>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setShowRunSheet(false)}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="runsheet-date-picker no-print">
              <label htmlFor="runsheet-date" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Select Service Date:
              </label>
              <input
                type="date"
                id="runsheet-date"
                className="form-input"
                style={{ width: 'auto' }}
                value={runSheetDate}
                onChange={(e) => setRunSheetDate(e.target.value)}
              />
              <span className="badge" style={{ marginLeft: 'auto' }}>
                {runSheetReservations.length} Bookings on {runSheetDate}
              </span>
            </div>

            {/* Printable Content Area */}
            <div className="runsheet-printable-sheet" id="printable-service-sheet">
              <div className="runsheet-print-header">
                <div>
                  <h2 className="runsheet-restaurant-title">URBAN SPOON FINE DINING</h2>
                  <div className="runsheet-meta">
                    <strong>Daily Service Run Sheet</strong> • Date: {runSheetDate} • Total Bookings:{' '}
                    {runSheetReservations.length}
                  </div>
                </div>
                <div className="runsheet-legend">
                  <span>[ ] Host Check</span>
                  <span>[ ] Seated</span>
                  <span>[ ] Billed</span>
                </div>
              </div>

              {runSheetReservations.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                  No reservations found for {runSheetDate}.
                </div>
              ) : (
                <table className="runsheet-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>✓</th>
                      <th>Slot</th>
                      <th>Tbl #</th>
                      <th>Zone</th>
                      <th>Guest Name</th>
                      <th>Covers</th>
                      <th>Contact</th>
                      <th>Dietary / Notes</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runSheetReservations.map((res) => (
                      <tr key={res._id || res.bookingRef}>
                        <td style={{ textAlign: 'center' }}>
                          <input type="checkbox" className="runsheet-checkbox" />
                        </td>
                        <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{res.timeSlot}</td>
                        <td>
                          <strong>T-{res.tableNumber}</strong>
                        </td>
                        <td>{res.zone}</td>
                        <td>
                          <strong>{res.guestName}</strong>
                          <div style={{ fontSize: '0.7rem', color: '#666' }}>{res.bookingRef}</div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{res.guests}</td>
                        <td style={{ fontSize: '0.8rem' }}>{res.guestPhone}</td>
                        <td style={{ fontStyle: 'italic', fontSize: '0.8rem' }}>
                          {res.specialRequests || '—'}
                        </td>
                        <td>
                          <span className={`runsheet-status-tag tag-${res.status}`}>
                            {res.status?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div className="runsheet-footer">
                <div>Urban Spoon Kitchen &amp; Host Stand Operations</div>
                <div>Printed on: {new Date().toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
