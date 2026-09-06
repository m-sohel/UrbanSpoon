const express = require('express');
const router = express.Router();
const {
  createInquiry,
  getInquiries,
} = require('../controllers/inquiryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// POST is public (guests submitting table inquiry)
// GET is restricted to authenticated administrators only (RBAC)
router.route('/')
  .post(createInquiry)
  .get(protect, adminOnly, getInquiries);

module.exports = router;

