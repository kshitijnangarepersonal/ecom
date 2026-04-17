const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc   Register new user
// @route  POST /api/v1/auth/register
const register = async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  const userExists = await User.findOne({ $or: [{ email }, { phone }] });
  if (userExists) {
    return res.status(400).json({
      success: false,
      error: 'User already exists with this email or phone number',
    });
  }

  const user = await User.create({ name, email, phone, password });
  const token = generateToken(user._id);

  // Simulate welcome notification (no real email sent)
  console.log(`📧 [MOCK EMAIL] Welcome email sent to ${email}`);

  res.status(201).json({
    success: true,
    message: 'Welcome to Dusk Commerce! 🎉',
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
    },
  });
};

// @desc   Login user
// @route  POST /api/v1/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
    },
  });
};

// @desc   Get current user
// @route  GET /api/v1/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('addresses')
    .populate({ path: 'wishlist', populate: { path: 'category', select: 'name' } });

  res.json({ success: true, user });
};

// @desc   Update profile
// @route  PATCH /api/v1/auth/me
const updateMe = async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone },
    { new: true, runValidators: true }
  ).select('-password');

  res.json({ success: true, user });
};

// @desc   Change password
// @route  PATCH /api/v1/auth/change-password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!(await user.matchPassword(currentPassword))) {
    return res.status(401).json({ success: false, error: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
};

// @desc   Logout (client-side; server returns success)
// @route  POST /api/v1/auth/logout
const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

module.exports = { register, login, getMe, updateMe, changePassword, logout };
