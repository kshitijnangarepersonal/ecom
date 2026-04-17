const Address = require('../models/Address');
const User = require('../models/User');

// @desc   Get user's addresses
// @route  GET /api/v1/addresses
const getAddresses = async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
  res.json({ success: true, addresses });
};

// @desc   Add new address
// @route  POST /api/v1/addresses
const addAddress = async (req, res) => {
  const { fullName, phone, pincode, addressLine1, addressLine2, landmark, city, state, type, isDefault } = req.body;

  if (isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  const count = await Address.countDocuments({ user: req.user._id });

  const address = await Address.create({
    user: req.user._id,
    fullName,
    phone,
    pincode,
    addressLine1,
    addressLine2,
    landmark,
    city,
    state,
    type: type || 'home',
    isDefault: count === 0 || !!isDefault,
  });

  await User.findByIdAndUpdate(req.user._id, { $push: { addresses: address._id } });

  res.status(201).json({ success: true, address });
};

// @desc   Update address
// @route  PATCH /api/v1/addresses/:id
const updateAddress = async (req, res) => {
  const address = await Address.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!address) return res.status(404).json({ success: false, error: 'Address not found' });
  res.json({ success: true, address });
};

// @desc   Delete address
// @route  DELETE /api/v1/addresses/:id
const deleteAddress = async (req, res) => {
  const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!address) return res.status(404).json({ success: false, error: 'Address not found' });

  await User.findByIdAndUpdate(req.user._id, { $pull: { addresses: address._id } });
  res.json({ success: true, message: 'Address deleted' });
};

// @desc   Set default address
// @route  PATCH /api/v1/addresses/:id/default
const setDefaultAddress = async (req, res) => {
  await Address.updateMany({ user: req.user._id }, { isDefault: false });
  const address = await Address.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isDefault: true },
    { new: true }
  );
  if (!address) return res.status(404).json({ success: false, error: 'Address not found' });
  res.json({ success: true, address });
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress };
