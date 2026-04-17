const Category = require('../models/Category');

// @desc   Get all active categories
// @route  GET /api/v1/categories
const getCategories = async (req, res) => {
  const categories = await Category.find({ isActive: true, parent: null }).sort('order');
  res.json({ success: true, categories });
};

// @desc   Get category by ID
// @route  GET /api/v1/categories/:id
const getCategoryById = async (req, res) => {
  const category = await Category.findById(req.params.id).populate('parent', 'name slug');
  if (!category) {
    return res.status(404).json({ success: false, error: 'Category not found' });
  }
  res.json({ success: true, category });
};

module.exports = { getCategories, getCategoryById };
