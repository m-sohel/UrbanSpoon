const Inquiry = require('../models/Inquiry');

// Temporary in-memory store in case MongoDB is not actively running locally
// ensuring the user can test the full UI flow seamlessly!
let inMemoryInquiries = [];

/**
 * @desc    Submit a new table inquiry
 * @route   POST /api/inquiries
 * @access  Public
 */
const createInquiry = async (req, res, next) => {
  try {
    const { name, phone, date, guests } = req.body;

    // Backend validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    if (!date) {
      return res.status(400).json({ success: false, message: 'Reservation date is required' });
    }
    if (!guests || isNaN(guests) || Number(guests) < 1) {
      return res.status(400).json({ success: false, message: 'Valid number of guests (at least 1) is required' });
    }

    let savedInquiry;
    try {
      // Attempt to save to MongoDB
      savedInquiry = await Inquiry.create({
        name: name.trim(),
        phone: phone.trim(),
        date: new Date(date),
        guests: Number(guests),
      });
    } catch (dbErr) {
      console.warn('[Inquiry Controller] MongoDB write fallback:', dbErr.message);
      // In-memory fallback if database server is disconnected
      savedInquiry = {
        _id: `mock-${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        date: new Date(date),
        guests: Number(guests),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryInquiries.unshift(savedInquiry);
    }

    return res.status(201).json({
      success: true,
      message: 'Table inquiry submitted successfully',
      data: savedInquiry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all table inquiries (for Admin portal)
 * @route   GET /api/inquiries
 * @access  Public (Simple Admin)
 */
const getInquiries = async (req, res, next) => {
  try {
    let inquiries = [];
    try {
      inquiries = await Inquiry.find().sort({ createdAt: -1 });
    } catch (dbErr) {
      console.warn('[Inquiry Controller] MongoDB read fallback:', dbErr.message);
      inquiries = inMemoryInquiries;
    }

    return res.status(200).json(inquiries);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInquiry,
  getInquiries,
};
