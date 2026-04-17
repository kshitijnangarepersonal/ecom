const express = require('express');
const router = express.Router();
const { getCoupons, validateCoupon } = require('../controllers/couponController');

router.get('/', getCoupons);
router.get('/validate/:code', validateCoupon);

module.exports = router;
