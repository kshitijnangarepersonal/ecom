const express = require('express');
const router = express.Router();
const { register, login, getMe, updateMe, changePassword, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.patch('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

module.exports = router;
