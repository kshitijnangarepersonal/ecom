const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

const populateCart = (cart) =>
  cart.populate({
    path: 'items.product',
    populate: { path: 'category', select: 'name' },
  });

// @desc   Get current user's cart
// @route  GET /api/v1/cart
const getCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }
  await populateCart(cart);
  res.json({ success: true, cart });
};

// @desc   Add item to cart
// @route  POST /api/v1/cart/items
const addToCart = async (req, res) => {
  const { productId, quantity = 1, selectedVariant } = req.body;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
  if (product.stock < 1) return res.status(400).json({ success: false, error: 'Product is out of stock' });

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existing = cart.items.find((item) => item.product.toString() === productId);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, product.stock);
    if (selectedVariant) existing.selectedVariant = selectedVariant;
  } else {
    cart.items.push({ product: productId, quantity: Math.min(quantity, product.stock), selectedVariant });
  }

  await cart.save();
  await populateCart(cart);
  res.json({ success: true, message: 'Added to cart', cart });
};

// @desc   Update cart item quantity
// @route  PATCH /api/v1/cart/items/:itemId
const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, error: 'Cart not found' });

  const item = cart.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ success: false, error: 'Item not in cart' });

  item.quantity = quantity;
  await cart.save();
  await populateCart(cart);
  res.json({ success: true, cart });
};

// @desc   Remove item from cart
// @route  DELETE /api/v1/cart/items/:itemId
const removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, error: 'Cart not found' });

  cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
  await cart.save();
  await populateCart(cart);
  res.json({ success: true, message: 'Item removed', cart });
};

// @desc   Clear entire cart
// @route  DELETE /api/v1/cart
const clearCart = async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: null });
  res.json({ success: true, message: 'Cart cleared' });
};

// @desc   Apply coupon code
// @route  POST /api/v1/cart/apply-coupon
const applyCoupon = async (req, res) => {
  const { code } = req.body;
  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), isActive: true });

  if (!coupon) return res.status(400).json({ success: false, error: 'Invalid or expired coupon code' });
  if (coupon.validUntil && new Date() > coupon.validUntil)
    return res.status(400).json({ success: false, error: 'Coupon has expired' });
  if (coupon.usedCount >= coupon.usageLimit)
    return res.status(400).json({ success: false, error: 'Coupon usage limit reached' });

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, error: 'Cart not found' });

  cart.coupon = {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    maxDiscount: coupon.maxDiscount,
    minOrder: coupon.minOrder,
  };
  await cart.save();

  res.json({
    success: true,
    message: `Coupon "${coupon.code}" applied! ${coupon.description || ''}`,
    coupon: cart.coupon,
  });
};

// @desc   Remove coupon
// @route  DELETE /api/v1/cart/coupon
const removeCoupon = async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { coupon: null });
  res.json({ success: true, message: 'Coupon removed' });
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart, applyCoupon, removeCoupon };
