const express = require('express');
const router = express.Router();
const {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
} = require('../controllers/inquiryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// POST is public (guests submitting event or general inquiry)
// GET is restricted to authenticated administrators only (RBAC)
router.route('/')
  .post(createInquiry)
  .get(protect, adminOnly, getInquiries);

router.patch('/:id/status', protect, adminOnly, updateInquiryStatus);

module.exports = router;


