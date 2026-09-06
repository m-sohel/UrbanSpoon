const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [25, 'Phone cannot exceed 25 characters'],
    },
    inquiryType: {
      type: String,
      enum: ['Private Banquet & Buyout', 'Event Catering', 'Corporate Dinner', 'General Feedback & Questions'],
      default: 'General Feedback & Questions',
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    guests: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'quoted', 'closed'],
      default: 'new',
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }

);

module.exports = mongoose.model('Inquiry', inquirySchema);
