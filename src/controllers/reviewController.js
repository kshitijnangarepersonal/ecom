const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc   Create a review
// @route  POST /api/v1/reviews
const createReview = async (req, res) => {
  const { productId, rating, title, comment } = req.body;

  if (!productId || !rating || !title || !comment) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  const existing = await Review.findOne({ user: req.user._id, product: productId });
  if (existing) {
    return res.status(400).json({ success: false, error: 'You have already reviewed this product' });
  }

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    rating: Number(rating),
    title,
    comment,
    isVerifiedPurchase: true,
  });

  await review.populate('user', 'name avatar');

  // Recalculate product rating
  const allReviews = await Review.find({ product: productId });
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  await Product.findByIdAndUpdate(productId, {
    $push: { reviews: review._id },
    'ratings.average': parseFloat(avgRating.toFixed(1)),
    'ratings.count': allReviews.length,
  });

  res.status(201).json({ success: true, review });
};

// @desc   Get reviews for a product
// @route  GET /api/v1/products/:productId/reviews
const getProductReviews = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [reviews, total] = await Promise.all([
    Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Review.countDocuments({ product: req.params.productId }),
  ]);

  res.json({ success: true, reviews, pagination: { total, page: Number(page) } });
};

// @desc   Delete own review
// @route  DELETE /api/v1/reviews/:id
const deleteReview = async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
  if (!review) return res.status(404).json({ success: false, error: 'Review not found' });

  await review.deleteOne();

  const allReviews = await Review.find({ product: review.product });
  const avgRating = allReviews.length > 0 ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length : 0;

  await Product.findByIdAndUpdate(review.product, {
    $pull: { reviews: review._id },
    'ratings.average': parseFloat(avgRating.toFixed(1)),
    'ratings.count': allReviews.length,
  });

  res.json({ success: true, message: 'Review deleted' });
};

module.exports = { createReview, getProductReviews, deleteReview };
