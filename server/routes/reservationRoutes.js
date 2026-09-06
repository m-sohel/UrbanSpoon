const express = require('express');
const router = express.Router();
const {
  getAvailability,
  createReservation,
  getAllReservations,
  cancelReservation,
  updateReservationStatus,
  createWalkinReservation,
} = require('../controllers/reservationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Floor availability check remains open for public map exploration
router.get('/availability', getAvailability);

// Creating a reservation requires customer or staff authentication
router.post('/', protect, createReservation);

// Admin-only management endpoints
router.get('/', protect, adminOnly, getAllReservations);
router.patch('/:id/cancel', protect, adminOnly, cancelReservation);
router.patch('/:id/status', protect, adminOnly, updateReservationStatus);
router.post('/walkin', protect, adminOnly, createWalkinReservation);

module.exports = router;

