const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc   Create order (checkout)
// @route  POST /api/v1/orders
const createOrder = async (req, res) => {
  const {
    shippingAddress,
    paymentMethod,
    items,
    subtotal,
    discountAmount = 0,
    taxAmount = 0,
    shippingAmount = 0,
    totalAmount,
    couponApplied,
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, error: 'No items in order' });
  }

  // Stock validation
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) return res.status(404).json({ success: false, error: `Product not found: ${item.name}` });
    if (product.stock < item.quantity)
      return res.status(400).json({ success: false, error: `Insufficient stock for: ${item.name}` });
  }

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5 + Math.floor(Math.random() * 3));

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    paymentMethod,
    subtotal,
    discountAmount,
    taxAmount,
    shippingAmount,
    totalAmount,
    couponApplied,
    estimatedDelivery,
    // COD orders are pending; Razorpay orders get updated after verify
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
    orderStatus: paymentMethod === 'cod' ? 'processing' : 'pending',
    statusHistory: [{ status: 'pending', note: 'Order placed successfully' }],
    tracking: {
      trackingNumber: `DC${Date.now().toString().slice(-9)}`,
      carrier: 'BlueDart Express',
      estimatedDelivery,
    },
  });

  // Reduce stock
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  // Clear cart
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: null });

  // Mock notification
  console.log(`📦 [MOCK NOTIFY] Order ${order.orderId} placed by ${req.user.email}`);

  res.status(201).json({ success: true, order });
};

// @desc   Get user's orders
// @route  GET /api/v1/orders
const getOrders = async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = { user: req.user._id };
  if (status) query.orderStatus = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Order.countDocuments(query),
  ]);

  res.json({
    success: true,
    orders,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
};

// @desc   Get single order
// @route  GET /api/v1/orders/:id
const getOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
  res.json({ success: true, order });
};

// @desc   Cancel order
// @route  PATCH /api/v1/orders/:id/cancel
const cancelOrder = async (req, res) => {
  const { reason } = req.body;
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
  if (!['pending', 'processing'].includes(order.orderStatus)) {
    return res.status(400).json({ success: false, error: 'Order cannot be cancelled at this stage' });
  }

  order.orderStatus = 'cancelled';
  order.cancelledAt = new Date();
  order.cancellationReason = reason || 'Cancelled by user';
  order.statusHistory.push({ status: 'cancelled', note: reason || 'Cancelled by user' });

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }

  await order.save();
  res.json({ success: true, message: 'Order cancelled successfully', order });
};

// @desc   Get tracking info (mock)
// @route  GET /api/v1/orders/:id/track
const trackOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

  const baseTime = order.createdAt.getTime();
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;

  const allSteps = [
    { status: 'order_placed', label: 'Order Placed', location: 'Dusk Commerce Warehouse', timestamp: new Date(baseTime), description: 'Your order has been placed successfully' },
    { status: 'processing', label: 'Processing', location: 'Mumbai Distribution Center', timestamp: new Date(baseTime + 3 * hour), description: 'Your order is being prepared for dispatch' },
    { status: 'shipped', label: 'Shipped', location: 'Mumbai Airport Hub', timestamp: new Date(baseTime + 1 * day), description: 'Order handed over to BlueDart Express' },
    { status: 'out_for_delivery', label: 'Out for Delivery', location: 'Local Delivery Hub', timestamp: new Date(baseTime + 4 * day), description: 'Your order is out for delivery' },
    { status: 'delivered', label: 'Delivered', location: 'Your Address', timestamp: order.deliveredAt || new Date(baseTime + 5 * day), description: 'Order delivered successfully' },
  ];

  const completedStatuses = {
    pending: ['order_placed'],
    processing: ['order_placed', 'processing'],
    shipped: ['order_placed', 'processing', 'shipped'],
    out_for_delivery: ['order_placed', 'processing', 'shipped', 'out_for_delivery'],
    delivered: ['order_placed', 'processing', 'shipped', 'out_for_delivery', 'delivered'],
    cancelled: [],
  };

  const completed = completedStatuses[order.orderStatus] || ['order_placed'];
  const events = allSteps.map((step) => ({
    ...step,
    completed: completed.includes(step.status),
    active: completed[completed.length - 1] === step.status,
  }));

  res.json({
    success: true,
    tracking: {
      orderId: order.orderId,
      orderStatus: order.orderStatus,
      trackingNumber: order.tracking?.trackingNumber,
      carrier: order.tracking?.carrier,
      estimatedDelivery: order.estimatedDelivery,
      events,
    },
  });
};

module.exports = { createOrder, getOrders, getOrder, cancelOrder, trackOrder };
