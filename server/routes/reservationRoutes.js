const express = require('express');
const router = express.Router();
const {
  getAvailability,
  createReservation,
  getAllReservations,
  cancelReservation,
} = require('../controllers/reservationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public endpoints
router.get('/availability', getAvailability);
router.post('/', createReservation);

// Admin-only management endpoints
router.get('/', protect, adminOnly, getAllReservations);
router.patch('/:id/cancel', protect, adminOnly, cancelReservation);

module.exports = router;
