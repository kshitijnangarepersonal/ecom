const Product = require('../models/Product');
const Review = require('../models/Review');

// @desc   Get all products with filters, pagination, sorting
// @route  GET /api/v1/products
const getProducts = async (req, res) => {
  const { page = 1, limit = 12, category, brand, minPrice, maxPrice, sort, q, deal, featured } = req.query;

  const query = { isActive: true };

  if (category) query.category = category;
  if (brand) query.brand = new RegExp(brand, 'i');
  if (deal === 'true') query.isOnDeal = true;
  if (featured === 'true') query.isFeatured = true;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (q) {
    query.$or = [
      { name: new RegExp(q, 'i') },
      { brand: new RegExp(q, 'i') },
      { tags: { $elemMatch: { $regex: q, $options: 'i' } } },
    ];
  }

  let sortQuery = { createdAt: -1 };
  if (sort === 'price_asc') sortQuery = { price: 1 };
  else if (sort === 'price_desc') sortQuery = { price: -1 };
  else if (sort === 'rating') sortQuery = { 'ratings.average': -1 };
  else if (sort === 'newest') sortQuery = { createdAt: -1 };
  else if (sort === 'discount') sortQuery = { discount: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(query).populate('category', 'name slug').sort(sortQuery).skip(skip).limit(Number(limit)),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    products,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      limit: Number(limit),
    },
  });
};

// @desc   Get single product by ID
// @route  GET /api/v1/products/:id
const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug')
    .populate({
      path: 'reviews',
      populate: { path: 'user', select: 'name avatar' },
      options: { sort: { createdAt: -1 }, limit: 20 },
    });

  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  res.json({ success: true, product });
};

// @desc   Get featured products (home hero)
// @route  GET /api/v1/products/featured
const getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ isActive: true, isFeatured: true })
    .populate('category', 'name slug')
    .limit(10)
    .sort({ 'ratings.average': -1 });

  res.json({ success: true, products });
};

// @desc   Get deals of the day
// @route  GET /api/v1/products/deals
const getDealProducts = async (req, res) => {
  const products = await Product.find({ isActive: true, isOnDeal: true })
    .populate('category', 'name slug')
    .limit(10)
    .sort({ discount: -1 });

  res.json({ success: true, products });
};

// @desc   Get products by category
// @route  GET /api/v1/products/category/:categoryId
const getProductsByCategory = async (req, res) => {
  const { page = 1, limit = 12, sort } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  let sortQuery = { createdAt: -1 };
  if (sort === 'price_asc') sortQuery = { price: 1 };
  else if (sort === 'price_desc') sortQuery = { price: -1 };
  else if (sort === 'rating') sortQuery = { 'ratings.average': -1 };

  const [products, total] = await Promise.all([
    Product.find({ category: req.params.categoryId, isActive: true })
      .populate('category', 'name slug')
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments({ category: req.params.categoryId, isActive: true }),
  ]);

  res.json({
    success: true,
    products,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
};

// @desc   Search products
// @route  GET /api/v1/products/search
const searchProducts = async (req, res) => {
  const { q = '', page = 1, limit = 12 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const query = {
    isActive: true,
    $or: [
      { name: new RegExp(q, 'i') },
      { brand: new RegExp(q, 'i') },
      { tags: { $elemMatch: { $regex: q, $options: 'i' } } },
    ],
  };

  const [products, total] = await Promise.all([
    Product.find(query).populate('category', 'name slug').skip(skip).limit(Number(limit)),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    products,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
};

// @desc   Get related products
// @route  GET /api/v1/products/:id/related
const getRelatedProducts = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .populate('category', 'name slug')
    .limit(8);

  res.json({ success: true, products: related });
};

module.exports = {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getDealProducts,
  getProductsByCategory,
  searchProducts,
  getRelatedProducts,
};
