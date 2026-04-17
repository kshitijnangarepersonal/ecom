const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: String, unique: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        image: String,
        price: Number,
        quantity: Number,
        selectedVariant: { type: Map, of: String },
      },
    ],
    // shippingAddress: {
    //   fullName: String,
    //   phone: String,
    //   addressLine1: String,
    //   addressLine2: String,
    //   landmark: String,
    //   city: String,
    //   state: String,
    //   pincode: String,
    //   country: { type: String, default: 'India' },
    //   type: String,
    // },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, required: true },
      type: { type: String, default: 'home' }
    },
    paymentMethod: { type: String, required: true, enum: ['razorpay', 'cod'] },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    shippingAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    couponApplied: {
      code: String,
      discount: Number,
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
    tracking: {
      trackingNumber: String,
      carrier: String,
      estimatedDelivery: Date,
    },
    estimatedDelivery: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancellationReason: String,
  },
  { timestamps: true }
);

orderSchema.pre('save', function (next) {
  if (!this.orderId) {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const rand = Math.floor(Math.random() * 9000 + 1000);
    this.orderId = `ORD-${dateStr}-${rand}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
