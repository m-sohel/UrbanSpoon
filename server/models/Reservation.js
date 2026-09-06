const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    bookingRef: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    tableNumber: {
      type: Number,
      required: [true, 'Table number is required'],
      min: 1,
      max: 30,
    },
    tableName: {
      type: String,
      required: true,
    },
    zone: {
      type: String,
      required: true,
    },
    // Normalized date string 'YYYY-MM-DD' for exact slot querying across timezones
    date: {
      type: String,
      required: [true, 'Reservation date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Dining time slot is required'],
    },
    guests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'At least 1 guest is required'],
      max: [8, 'Maximum 8 guests per table'],
    },
    guestName: {
      type: String,
      required: [true, 'Guest name is required'],
      trim: true,
    },
    guestPhone: {
      type: String,
      required: [true, 'Contact phone number is required'],
      trim: true,
    },
    guestEmail: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
    },
    specialRequests: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['confirmed', 'completed', 'cancelled'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly look up active reservations for a table on a date & slot
reservationSchema.index({ date: 1, timeSlot: 1, tableNumber: 1, status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
