const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getDealProducts,
  getProductsByCategory,
  searchProducts,
  getRelatedProducts,
} = require('../controllers/productController');
const { getProductReviews, createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/deals', getDealProducts);
router.get('/search', searchProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/:id', getProduct);
router.get('/:id/related', getRelatedProducts);
router.get('/:productId/reviews', getProductReviews);
router.post('/:productId/reviews', protect, (req, res, next) => {
  req.body.productId = req.params.productId;
  next();
}, createReview);

module.exports = router;
