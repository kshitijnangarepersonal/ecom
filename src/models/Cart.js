const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1, default: 1 },
        selectedVariant: { type: Map, of: String },
      },
    ],
    coupon: {
      code: String,
      discountType: { type: String, enum: ['percentage', 'fixed'] },
      discountValue: Number,
      maxDiscount: Number,
      minOrder: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
