const express = require('express');
const router = express.Router();
const {
  createInquiry,
  getInquiries,
} = require('../controllers/inquiryController');

router.route('/')
  .post(createInquiry)
  .get(getInquiries);

module.exports = router;
