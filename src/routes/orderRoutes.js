const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrder, cancelOrder, trackOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrder);
router.patch('/:id/cancel', cancelOrder);
router.get('/:id/track', trackOrder);

module.exports = router;
