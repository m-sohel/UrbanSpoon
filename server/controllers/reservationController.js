const Reservation = require('../models/Reservation');
const { TABLES, TIME_SLOTS, ZONES } = require('../config/tableLayout');

// Helper to generate unique booking reference like 'US-8492'
const generateBookingRef = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'US-';
  for (let i = 0; i < 4; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
};

// In-memory fallback in case database server is momentarily offline
let inMemoryReservations = [];

/**
 * @desc    Get real-time floor availability for 30 tables on specific date & slot
 * @route   GET /api/reservations/availability
 * @access  Public
 */
const getAvailability = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const date = req.query.date || todayStr;
    const timeSlot = req.query.timeSlot || TIME_SLOTS[3].label; // default 08:00 PM - 10:00 PM dinner

    let confirmedBookings = [];
    try {
      confirmedBookings = await Reservation.find({
        date,
        timeSlot,
        status: { $in: ['confirmed', 'seated'] },
      });
    } catch (dbErr) {
      console.warn('[Reservation Controller] MongoDB read fallback:', dbErr.message);
      confirmedBookings = inMemoryReservations.filter(
        (r) =>
          r.date === date &&
          r.timeSlot === timeSlot &&
          (r.status === 'confirmed' || r.status === 'seated')
      );
    }

    // Create lookup map of booked table numbers
    const bookedMap = new Map();
    confirmedBookings.forEach((b) => {
      bookedMap.set(b.tableNumber, {
        bookingRef: b.bookingRef,
        status: b.status,
        guestInitials: b.guestName
          ? b.guestName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
          : 'RES',
        partySize: b.guests,
      });
    });

    // Map all 30 master tables with real-time status
    const tablesWithStatus = TABLES.map((t) => {
      const isBooked = bookedMap.has(t.number);
      const bookingInfo = isBooked ? bookedMap.get(t.number) : null;
      const currentStatus = isBooked ? bookingInfo.status : 'available';

      return {
        ...t,
        isAvailable: !isBooked,
        isReserved: isBooked,
        status: currentStatus, // 'available' | 'confirmed' | 'seated'
        activeBooking: bookingInfo,
      };
    });


    const totalTables = TABLES.length;
    const reservedCount = bookedMap.size;
    const availableCount = totalTables - reservedCount;

    return res.status(200).json({
      success: true,
      date,
      timeSlot,
      totalTables,
      availableCount,
      reservedCount,
      occupancyRate: Math.round((reservedCount / totalTables) * 100),
      timeSlots: TIME_SLOTS,
      zones: ZONES,
      tables: tablesWithStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Instantly book a table with atomic conflict check & confirmation pass
 * @route   POST /api/reservations
 * @access  Public
 */
const createReservation = async (req, res, next) => {
  try {
    const {
      tableNumber,
      date,
      timeSlot,
      guests,
      guestName,
      guestPhone,
      guestEmail,
      specialRequests,
    } = req.body;

    // 1. Basic validation
    if (!tableNumber || isNaN(tableNumber) || tableNumber < 1 || tableNumber > 30) {
      return res.status(400).json({
        success: false,
        message: 'Invalid table number. Please select a table between 1 and 30.',
      });
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Valid reservation date (YYYY-MM-DD) is required.',
      });
    }

    if (!timeSlot || !timeSlot.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Dining time slot is required.',
      });
    }

    const tableDef = TABLES.find((t) => t.number === Number(tableNumber));
    if (!tableDef) {
      return res.status(404).json({
        success: false,
        message: `Table ${tableNumber} does not exist in restaurant layout.`,
      });
    }

    const guestsNum = Number(guests);
    if (!guestsNum || guestsNum < 1 || guestsNum > tableDef.capacity) {
      return res.status(400).json({
        success: false,
        message: `Table ${tableNumber} accommodates up to ${tableDef.capacity} guests (you requested ${guestsNum}).`,
      });
    }

    if (!guestName || !guestName.trim()) {
      return res.status(400).json({ success: false, message: 'Guest name is required.' });
    }
    if (!guestPhone || !guestPhone.trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }
    if (!guestEmail || !guestEmail.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    // 2. Atomic double-booking check
    let existingBooking = null;
    try {
      existingBooking = await Reservation.findOne({
        date,
        timeSlot,
        tableNumber: Number(tableNumber),
        status: { $in: ['confirmed', 'seated'] },
      });
    } catch (dbErr) {
      console.warn('[Reservation Controller] MongoDB check fallback:', dbErr.message);
      existingBooking = inMemoryReservations.find(
        (r) =>
          r.date === date &&
          r.timeSlot === timeSlot &&
          r.tableNumber === Number(tableNumber) &&
          (r.status === 'confirmed' || r.status === 'seated')
      );
    }


    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: `Table ${tableNumber} (${tableDef.name} - ${tableDef.zone}) has just been reserved by another guest for this time slot. Please select another available table on the floor plan!`,
      });
    }

    // 3. Generate unique booking reference
    let bookingRef = generateBookingRef();
    // Guarantee uniqueness
    try {
      let isRefTaken = await Reservation.findOne({ bookingRef });
      while (isRefTaken) {
        bookingRef = generateBookingRef();
        isRefTaken = await Reservation.findOne({ bookingRef });
      }
    } catch {
      // Ignored in fallback
    }

    // 4. Save confirmed reservation
    const reservationData = {
      bookingRef,
      user: req.user?._id,
      tableNumber: Number(tableNumber),
      tableName: `${tableDef.name} (${tableDef.zone})`,
      zone: tableDef.zone,
      date,
      timeSlot,
      guests: guestsNum,
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      specialRequests: (specialRequests || '').trim(),
      status: 'confirmed',
    };

    let savedReservation;
    try {
      savedReservation = await Reservation.create(reservationData);
    } catch (dbErr) {
      console.warn('[Reservation Controller] MongoDB save fallback:', dbErr.message);
      savedReservation = {
        _id: `res-${Date.now()}`,
        ...reservationData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryReservations.unshift(savedReservation);
    }

    // 5. Formulate instant confirmation dining pass payload
    const diningPass = {
      bookingRef: savedReservation.bookingRef,
      status: 'CONFIRMED',
      restaurantName: 'Urban Spoon Fine Dining',
      tableNumber: savedReservation.tableNumber,
      tableName: tableDef.name,
      zone: tableDef.zone,
      view: tableDef.view,
      date: savedReservation.date,
      timeSlot: savedReservation.timeSlot,
      guests: savedReservation.guests,
      guestName: savedReservation.guestName,
      guestPhone: savedReservation.guestPhone,
      guestEmail: savedReservation.guestEmail,
      specialRequests: savedReservation.specialRequests,
      issuedAt: new Date().toISOString(),
    };

    return res.status(201).json({
      success: true,
      message: 'Table reserved instantly! Your dining pass is confirmed.',
      reservation: savedReservation,
      diningPass,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reservations for Admin management & live floor radar
 * @route   GET /api/reservations
 * @access  Private (Admin Only)
 */
const getAllReservations = async (req, res, next) => {
  try {
    const { date, status, tableNumber } = req.query;
    const filter = {};

    if (date) filter.date = date;
    if (status) filter.status = status;
    if (tableNumber) filter.tableNumber = Number(tableNumber);

    let reservations = [];
    try {
      reservations = await Reservation.find(filter).sort({ date: -1, createdAt: -1 });
    } catch (dbErr) {
      console.warn('[Reservation Controller] MongoDB admin read fallback:', dbErr.message);
      reservations = inMemoryReservations.filter((r) => {
        if (date && r.date !== date) return false;
        if (status && r.status !== status) return false;
        if (tableNumber && r.tableNumber !== Number(tableNumber)) return false;
        return true;
      });
    }

    return res.status(200).json({
      success: true,
      count: reservations.length,
      reservations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a reservation (frees table immediately)
 * @route   PATCH /api/reservations/:id/cancel
 * @access  Private (Admin Only)
 */
const cancelReservation = async (req, res, next) => {
  try {
    const { id } = req.params;

    let reservation;
    try {
      reservation = await Reservation.findById(id);
      if (reservation) {
        reservation.status = 'cancelled';
        await reservation.save();
      }
    } catch (dbErr) {
      console.warn('[Reservation Controller] MongoDB cancel fallback:', dbErr.message);
      reservation = inMemoryReservations.find((r) => r._id === id || r.bookingRef === id);
      if (reservation) {
        reservation.status = 'cancelled';
      }
    }

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Reservation ${reservation.bookingRef} (Table ${reservation.tableNumber}) has been cancelled. Table is now available.`,
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update reservation operational status (seated, completed, cancelled)
 * @route   PATCH /api/reservations/:id/status
 * @access  Private (Admin Only)
 */
const updateReservationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['confirmed', 'seated', 'completed', 'cancelled'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowed.join(', ')}`,
      });
    }

    let reservation;
    try {
      reservation = await Reservation.findById(id);
      if (reservation) {
        reservation.status = status;
        await reservation.save();
      }
    } catch (dbErr) {
      console.warn('[Reservation Controller] MongoDB status update fallback:', dbErr.message);
      reservation = inMemoryReservations.find((r) => r._id === id || r.bookingRef === id);
      if (reservation) {
        reservation.status = status;
      }
    }

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found.',
      });
    }

    const messages = {
      seated: `Guests for Table ${reservation.tableNumber} marked as SEATED. Table is currently dining.`,
      completed: `Table ${reservation.tableNumber} marked as COMPLETED & billed. Table is now cleaned and available.`,
      cancelled: `Reservation for Table ${reservation.tableNumber} cancelled. Table is now available.`,
      confirmed: `Reservation for Table ${reservation.tableNumber} set back to CONFIRMED.`,
    };

    return res.status(200).json({
      success: true,
      message: messages[status] || `Reservation status updated to ${status}`,
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Quick Walk-in Seating (Host stand seats walk-in directly at door)
 * @route   POST /api/reservations/walkin
 * @access  Private (Admin Only)
 */
const createWalkinReservation = async (req, res, next) => {
  try {
    const { tableNumber, date, timeSlot, guests, specialRequests } = req.body;

    if (!tableNumber || isNaN(tableNumber) || tableNumber < 1 || tableNumber > 30) {
      return res.status(400).json({
        success: false,
        message: 'Valid table number between 1 and 30 is required.',
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const bookingDate = date || todayStr;
    const slot = timeSlot || TIME_SLOTS[3].label;

    const tableDef = TABLES.find((t) => t.number === Number(tableNumber));
    if (!tableDef) {
      return res.status(404).json({
        success: false,
        message: `Table ${tableNumber} not found.`,
      });
    }

    // Check table is currently open
    let existingBooking = null;
    try {
      existingBooking = await Reservation.findOne({
        date: bookingDate,
        timeSlot: slot,
        tableNumber: Number(tableNumber),
        status: { $in: ['confirmed', 'seated'] },
      });
    } catch (dbErr) {
      existingBooking = inMemoryReservations.find(
        (r) =>
          r.date === bookingDate &&
          r.timeSlot === slot &&
          r.tableNumber === Number(tableNumber) &&
          (r.status === 'confirmed' || r.status === 'seated')
      );
    }

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: `Table ${tableNumber} is already occupied or reserved for this slot.`,
      });
    }

    const bookingRef = generateBookingRef();
    const guestsNum = Number(guests) || 2;

    const walkinRecord = {
      bookingRef,
      tableNumber: Number(tableNumber),
      tableName: `${tableDef.name} (${tableDef.zone})`,
      zone: tableDef.zone,
      date: bookingDate,
      timeSlot: slot,
      guests: guestsNum,
      guestName: 'Walk-in Guest',
      guestPhone: 'Walk-in (Door)',
      guestEmail: 'walkin@urbanspoon.com',
      specialRequests: specialRequests || 'Walk-in seated directly at host stand',
      status: 'seated', // Directly marked as seated
    };

    let savedWalkin;
    try {
      savedWalkin = await Reservation.create(walkinRecord);
    } catch (dbErr) {
      savedWalkin = {
        _id: `walkin-${Date.now()}`,
        ...walkinRecord,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryReservations.unshift(savedWalkin);
    }

    return res.status(201).json({
      success: true,
      message: `Table ${tableNumber} seated for walk-in party (${guestsNum} Guests)!`,
      reservation: savedWalkin,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Seed sample reservations if collection is empty
 */
const seedDemoReservations = async () => {
  try {
    const count = await Reservation.countDocuments();
    if (count === 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const demoBookings = [
        {
          bookingRef: 'US-DEMO1',
          tableNumber: 3,
          tableName: 'Table 3 (Window Promenade)',
          zone: 'Window Promenade',
          date: todayStr,
          timeSlot: '08:00 PM - 10:00 PM',
          guests: 2,
          guestName: 'Vikram Singhania',
          guestPhone: '+91 98200 11223',
          guestEmail: 'vikram@example.com',
          specialRequests: 'Anniversary celebration, window table preferred',
          status: 'confirmed',
        },
        {
          bookingRef: 'US-DEMO2',
          tableNumber: 12,
          tableName: 'Table 12 (Main Dining Hall)',
          zone: 'Main Dining Hall',
          date: todayStr,
          timeSlot: '08:00 PM - 10:00 PM',
          guests: 5,
          guestName: 'Ananya Roy',
          guestPhone: '+91 99100 44556',
          guestEmail: 'ananya@example.com',
          specialRequests: 'High chair needed for child',
          status: 'confirmed',
        },
        {
          bookingRef: 'US-DEMO3',
          tableNumber: 23,
          tableName: 'Table 23 (Royal Booths)',
          zone: 'Royal Booths',
          date: todayStr,
          timeSlot: '08:00 PM - 10:00 PM',
          guests: 6,
          guestName: 'Rajesh Mehta',
          guestPhone: '+91 97300 77889',
          guestEmail: 'mehta.biz@example.com',
          specialRequests: 'Corporate VIP dinner',
          status: 'confirmed',
        },
        {
          bookingRef: 'US-DEMO4',
          tableNumber: 28,
          tableName: 'Table 28 (Terrace Starlight)',
          zone: 'Terrace Starlight',
          date: tomorrowStr,
          timeSlot: '08:00 PM - 10:00 PM',
          guests: 2,
          guestName: 'Tara Kapoor',
          guestPhone: '+91 96500 33221',
          guestEmail: 'tara@example.com',
          specialRequests: 'Birthday dessert candle',
          status: 'confirmed',
        },
      ];

      await Reservation.insertMany(demoBookings);
      console.log('[Urban Spoon Reservations] ✅ Seeded initial sample table bookings.');
    }
  } catch (err) {
    console.warn('[Urban Spoon Reservations] Demo seeding notice:', err.message);
  }
};

module.exports = {
  getAvailability,
  createReservation,
  getAllReservations,
  cancelReservation,
  updateReservationStatus,
  createWalkinReservation,
  seedDemoReservations,
};

