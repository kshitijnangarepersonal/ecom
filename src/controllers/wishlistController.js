const User = require('../models/User');
const Product = require('../models/Product');

// @desc   Get wishlist
// @route  GET /api/v1/wishlist
const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    populate: { path: 'category', select: 'name slug' },
  });
  res.json({ success: true, wishlist: user.wishlist || [] });
};

// @desc   Add to wishlist
// @route  POST /api/v1/wishlist
const addToWishlist = async (req, res) => {
  const { productId } = req.body;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

  const user = await User.findById(req.user._id);
  const alreadyInWishlist = user.wishlist.some((id) => id.toString() === productId);

  if (!alreadyInWishlist) {
    user.wishlist.push(productId);
    await user.save();
  }

  res.json({ success: true, message: 'Added to wishlist', isInWishlist: true });
};

// @desc   Remove from wishlist
// @route  DELETE /api/v1/wishlist/:productId
const removeFromWishlist = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $pull: { wishlist: req.params.productId } });
  res.json({ success: true, message: 'Removed from wishlist', isInWishlist: false });
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
