import { useState, useEffect } from 'react';
import API from '../api/api';
import './TableMap.css';

const TableMap = ({ onSelectTable, selectedTable }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSlot, setSelectedSlot] = useState('08:00 PM - 10:00 PM');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedCapacity, setSelectedCapacity] = useState('all');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [floorData, setFloorData] = useState(null);

  // Fetch real-time availability whenever date or slot changes
  const fetchAvailability = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get(
        `/api/reservations/availability?date=${selectedDate}&timeSlot=${encodeURIComponent(selectedSlot)}`
      );
      if (res.data?.success) {
        setFloorData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch table availability:', err);
      setError('Unable to load real-time table availability. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [selectedDate, selectedSlot]);

  // Filter tables based on user preferences
  const tables = floorData?.tables || [];
  const filteredTables = tables.filter((t) => {
    if (selectedZone !== 'all' && t.zone !== selectedZone) return false;
    if (selectedCapacity !== 'all') {
      const cap = Number(selectedCapacity);
      if (cap === 2 && t.capacity !== 2) return false;
      if (cap === 4 && t.capacity !== 4) return false;
      if (cap === 6 && t.capacity < 6) return false;
    }
    return true;
  });

  const handleTableClick = (table) => {
    if (!table.isAvailable) return;
    onSelectTable({
      ...table,
      date: selectedDate,
      timeSlot: selectedSlot,
    });
  };

  return (
    <div className="table-map-wrapper animate-fade-in" id="visual-floor-plan">
      {/* Control Bar: Date, Slot, Capacity & Zone Filters */}
      <div className="floor-controls-card card">
        <div className="floor-controls-header">
          <div className="floor-controls-title-group">
            <span className="section__label">Live Floor Plan</span>
            <h2 className="floor-controls-heading">Select Dining Slot & View 30 Tables</h2>
          </div>
          <div className="floor-stats-badge">
            <span className="live-pulse"></span>
            <span>
              <strong>{floorData?.availableCount ?? 30}</strong> of 30 Tables Available
            </span>
          </div>
        </div>

        <div className="floor-controls-grid">
          {/* Date Picker */}
          <div className="control-field">
            <label className="control-label" htmlFor="floor-date">
              📅 Reservation Date
            </label>
            <input
              type="date"
              id="floor-date"
              className="control-input"
              value={selectedDate}
              min={todayStr}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Time Slot Picker */}
          <div className="control-field">
            <label className="control-label" htmlFor="floor-slot">
              ⏰ Dining Time Slot
            </label>
            <select
              id="floor-slot"
              className="control-input"
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
            >
              <optgroup label="Lunch Slots">
                <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM (Lunch)</option>
                <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Lunch)</option>
              </optgroup>
              <optgroup label="Dinner Slots">
                <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM (Sunset Dinner)</option>
                <option value="08:00 PM - 10:00 PM">08:00 PM - 10:00 PM (Prime Dinner)</option>
                <option value="10:00 PM - 11:30 PM">10:00 PM - 11:30 PM (Late Dining)</option>
              </optgroup>
            </select>
          </div>


          {/* Party Size Filter */}
          <div className="control-field">
            <label className="control-label" htmlFor="floor-capacity">
              👥 Party Size
            </label>
            <select
              id="floor-capacity"
              className="control-input"
              value={selectedCapacity}
              onChange={(e) => setSelectedCapacity(e.target.value)}
            >
              <option value="all">All Party Sizes</option>
              <option value="2">2 Guests (Couples)</option>
              <option value="4">4 Guests (Family &amp; Friends)</option>
              <option value="6">6 to 8 Guests (Large Group)</option>
            </select>
          </div>

          {/* Zone Filter */}
          <div className="control-field">
            <label className="control-label" htmlFor="floor-zone">
              📍 Dining Zone
            </label>
            <select
              id="floor-zone"
              className="control-input"
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
            >
              <option value="all">All Zones (All 30 Tables)</option>
              <option value="Window Promenade">🪟 Window Promenade (Tables 1 - 8)</option>
              <option value="Main Dining Hall">🍽️ Main Dining Hall (Tables 9 - 20)</option>
              <option value="Royal Booths">👑 Royal Velvet Booths (Tables 21 - 26)</option>
              <option value="Terrace Starlight">🌿 Starlight Terrace (Tables 27 - 30)</option>
            </select>
          </div>
        </div>


        {/* Legend */}
        <div className="floor-legend-bar">
          <div className="legend-item">
            <span className="legend-swatch legend-swatch--available"></span>
            <span>Available to Book</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch legend-swatch--selected"></span>
            <span>Selected Table</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch legend-swatch--booked"></span>
            <span>Reserved / Booked</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon">🪟</span>
            <span>Skyline Glass View</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon">🌿</span>
            <span>Alfresco Starlight</span>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="floor-loading card text-center">
          <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto var(--space-md)' }}></div>
          <p className="text-muted">Loading live table radar for {selectedSlot}...</p>
        </div>
      )}

      {error && (
        <div className="floor-error card text-center">
          <p className="text-muted">{error}</p>
          <button className="btn btn--outline btn--sm" onClick={fetchAvailability}>
            Retry Radar
          </button>
        </div>
      )}

      {/* Interactive Floor Plan Architectural Map */}
      {!loading && !error && (
        <div className="restaurant-floor-plan card" id="restaurant-floor-layout">
          {/* Architectural Top: Panoramic Skyline Glass Wall */}
          <div className="floor-wall floor-wall--window">
            <span className="wall-label">
              🪟 Panoramic Glass Window Promenade (Skyline & Illuminated Fountains)
            </span>
          </div>

          {/* ZONE 1: Window Promenade (Tables 1 - 8) */}
          <div className="floor-zone zone-window">
            <div className="zone-header">
              <span className="zone-title">Window Promenade (Tables 1 - 8)</span>
              <span className="zone-desc">Floor-to-ceiling glass panoramic views</span>
            </div>
            <div className="zone-tables-grid">
              {tables.slice(0, 8).map((table) => {
                const isMatch = filteredTables.some((t) => t.number === table.number);
                const isCurrentSelected = selectedTable?.number === table.number;

                return (
                  <button
                    key={table.number}
                    type="button"
                    disabled={!table.isAvailable}
                    className={`table-node ${table.shape} ${
                      table.isAvailable ? 'table-node--available' : 'table-node--booked'
                    } ${isCurrentSelected ? 'table-node--selected' : ''} ${
                      !isMatch ? 'table-node--dimmed' : ''
                    }`}
                    onClick={() => handleTableClick(table)}
                    id={`table-btn-${table.number}`}
                    title={`${table.name} • ${table.capacity} Guests • ${
                      table.isAvailable ? 'Available' : 'Reserved for this slot'
                    }`}
                  >
                    <div className="table-chairs-ring">
                      {Array.from({ length: table.capacity }).map((_, idx) => (
                        <span key={idx} className="chair-dot"></span>
                      ))}
                    </div>
                    <div className="table-inner">
                      <span className="table-num">T-{table.number}</span>
                      <span className="table-cap">{table.capacity}P</span>
                      <span className="table-status-icon">
                        {isCurrentSelected ? '✓' : table.isAvailable ? '🪟' : '🔒'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Central Section: Split into Royal Booths (Left), Main Hall (Center), Terrace (Right) */}
          <div className="floor-middle-section">
            {/* ZONE 3: Royal Velvet Booths & Alcoves (Tables 21 - 26) */}
            <div className="floor-zone zone-booths">
              <div className="zone-header">
                <span className="zone-title">👑 Royal Booths (21 - 26)</span>
                <span className="zone-desc">Plush velvet, high acoustic privacy</span>
              </div>
              <div className="zone-tables-grid zone-tables-grid--booths">
                {tables.slice(20, 26).map((table) => {
                  const isMatch = filteredTables.some((t) => t.number === table.number);
                  const isCurrentSelected = selectedTable?.number === table.number;

                  return (
                    <button
                      key={table.number}
                      type="button"
                      disabled={!table.isAvailable}
                      className={`table-node booth ${
                        table.isAvailable ? 'table-node--available' : 'table-node--booked'
                      } ${isCurrentSelected ? 'table-node--selected' : ''} ${
                        !isMatch ? 'table-node--dimmed' : ''
                      }`}
                      onClick={() => handleTableClick(table)}
                      id={`table-btn-${table.number}`}
                      title={`${table.name} • ${table.capacity} Guests • ${table.view}`}
                    >
                      <div className="booth-cushion-top"></div>
                      <div className="table-inner">
                        <span className="table-num">T-{table.number}</span>
                        <span className="table-cap">{table.capacity}P</span>
                        <span className="table-status-icon">
                          {isCurrentSelected ? '✓' : table.isAvailable ? '👑' : '🔒'}
                        </span>
                      </div>
                      <div className="booth-cushion-bottom"></div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ZONE 2: Main Dining Hall (Tables 9 - 20) */}
            <div className="floor-zone zone-mainhall">
              <div className="zone-header">
                <span className="zone-title">🍽️ Main Dining Hall (9 - 20)</span>
                <span className="zone-desc">Crystal chandelier & open culinary theater</span>
              </div>
              <div className="zone-tables-grid zone-tables-grid--mainhall">
                {tables.slice(8, 20).map((table) => {
                  const isMatch = filteredTables.some((t) => t.number === table.number);
                  const isCurrentSelected = selectedTable?.number === table.number;

                  return (
                    <button
                      key={table.number}
                      type="button"
                      disabled={!table.isAvailable}
                      className={`table-node ${table.shape} ${
                        table.isAvailable ? 'table-node--available' : 'table-node--booked'
                      } ${isCurrentSelected ? 'table-node--selected' : ''} ${
                        !isMatch ? 'table-node--dimmed' : ''
                      }`}
                      onClick={() => handleTableClick(table)}
                      id={`table-btn-${table.number}`}
                      title={`${table.name} • ${table.capacity} Guests • ${table.view}`}
                    >
                      <div className="table-chairs-ring">
                        {Array.from({ length: table.capacity }).map((_, idx) => (
                          <span key={idx} className="chair-dot"></span>
                        ))}
                      </div>
                      <div className="table-inner">
                        <span className="table-num">T-{table.number}</span>
                        <span className="table-cap">{table.capacity}P</span>
                        <span className="table-status-icon">
                          {isCurrentSelected ? '✓' : table.isAvailable ? '✨' : '🔒'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ZONE 4: Terrace Starlight Alfresco (Tables 27 - 30) */}
            <div className="floor-zone zone-terrace">
              <div className="zone-header">
                <span className="zone-title">🌿 Starlight Terrace (27 - 30)</span>
                <span className="zone-desc">Open-air romantic night sky patio</span>
              </div>
              <div className="zone-tables-grid zone-tables-grid--terrace">
                {tables.slice(26, 30).map((table) => {
                  const isMatch = filteredTables.some((t) => t.number === table.number);
                  const isCurrentSelected = selectedTable?.number === table.number;

                  return (
                    <button
                      key={table.number}
                      type="button"
                      disabled={!table.isAvailable}
                      className={`table-node ${table.shape} ${
                        table.isAvailable ? 'table-node--available' : 'table-node--booked'
                      } ${isCurrentSelected ? 'table-node--selected' : ''} ${
                        !isMatch ? 'table-node--dimmed' : ''
                      }`}
                      onClick={() => handleTableClick(table)}
                      id={`table-btn-${table.number}`}
                      title={`${table.name} • ${table.capacity} Guests • ${table.view}`}
                    >
                      <div className="terrace-breeze-indicator"></div>
                      <div className="table-inner">
                        <span className="table-num">T-{table.number}</span>
                        <span className="table-cap">{table.capacity}P</span>
                        <span className="table-status-icon">
                          {isCurrentSelected ? '✓' : table.isAvailable ? '🌿' : '🔒'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Architectural Bottom: Main Foyer & Host Stand */}
          <div className="floor-wall floor-wall--entrance">
            <span className="wall-label">🚪 Grand Foyer Entrance & Valet Host Stand</span>
          </div>
        </div>
      )}

      {/* Selected Table Floating Call to Action */}
      {selectedTable && (
        <div className="selected-table-banner animate-fade-in" id="selected-table-banner">
          <div className="selected-table-info">
            <span className="selected-badge">Table Selected</span>
            <div className="selected-table-name">
              <strong>{selectedTable.name}</strong> • {selectedTable.zone} ({selectedTable.capacity} Guests Max)
            </div>
            <div className="selected-table-meta text-muted">
              📅 {selectedDate} • ⏰ {selectedSlot} • {selectedTable.view}
            </div>
          </div>
          <button
            type="button"
            className="btn btn--primary btn-reserve-action"
            onClick={() => onSelectTable(selectedTable)}
            id="btn-proceed-reservation"
          >
            ✨ Reserve This Table Now
          </button>
        </div>
      )}
    </div>
  );
};

export default TableMap;
