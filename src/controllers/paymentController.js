const crypto = require('crypto');
const Order = require('../models/Order');
const razorpay = require('../config/razorpay');

// @desc   Create Razorpay order
// @route  POST /api/v1/payments/create-order
const createRazorpayOrder = async (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body;

  try {
    const options = {
      amount: Math.round(Number(amount) * 100), // Convert to paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
      },
    });
  } catch (error) {
    console.error('Razorpay Error:', error);
    res.status(500).json({ success: false, error: 'Failed to initiate payment. Check Razorpay credentials.' });
  }
};

// @desc   Verify Razorpay payment and update order
// @route  POST /api/v1/payments/verify
const verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  // Generate expected signature
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (generatedSignature !== razorpaySignature) {
    return res.status(400).json({ success: false, error: 'Payment verification failed. Invalid signature.' });
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentStatus: 'paid',
      orderStatus: 'processing',
      $push: { statusHistory: { status: 'processing', note: 'Payment confirmed via Razorpay' } },
    },
    { new: true }
  );

  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

  console.log(`💳 [PAYMENT] Order ${order.orderId} paid via Razorpay: ${razorpayPaymentId}`);
  res.json({ success: true, message: 'Payment verified successfully', order });
};

module.exports = { createRazorpayOrder, verifyPayment };
