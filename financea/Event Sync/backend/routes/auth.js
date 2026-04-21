const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'eventsync_secret_key', { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, userType, role, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, userType, role, phone });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      role: user.role,
      phone: user.phone,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      role: user.role,
      phone: user.phone,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

// GET /api/auth/users/sso
router.get('/users/sso', protect, async (req, res) => {
  try {
    const ssos = await User.find({ role: 'Student Service Officer' }).select('-password');
    res.json(ssos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/update-phone
router.put('/update-phone', protect, async (req, res) => {
  try {
    const { phone } = req.body;
    await User.findByIdAndUpdate(req.user._id, { phone });
    res.json({ success: true, message: 'Phone updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;