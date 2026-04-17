const Coupon = require('../models/Coupon');

// @desc   Get all active coupons (publicly visible)
// @route  GET /api/v1/coupons
const getCoupons = async (req, res) => {
  const coupons = await Coupon.find({ isActive: true });
  res.json({ success: true, coupons });
};

// @desc   Validate a coupon code
// @route  GET /api/v1/coupons/validate/:code
const validateCoupon = async (req, res) => {
  const coupon = await Coupon.findOne({
    code: req.params.code.toUpperCase().trim(),
    isActive: true,
  });

  if (!coupon) return res.status(404).json({ success: false, error: 'Invalid coupon code' });
  if (coupon.validUntil && new Date() > coupon.validUntil)
    return res.status(400).json({ success: false, error: 'This coupon has expired' });
  if (coupon.usedCount >= coupon.usageLimit)
    return res.status(400).json({ success: false, error: 'Coupon usage limit reached' });

  res.json({ success: true, coupon });
};

module.exports = { getCoupons, validateCoupon };
