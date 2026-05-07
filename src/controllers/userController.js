const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'padelfinder_secret_2024', {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d',
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  res.status(statusCode).json({ status: 'success', token, data: { user } });
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, passwordConfirm, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'Nombre, email y contraseña son requeridos.' });
    }
    if (password !== passwordConfirm) {
      return res.status(400).json({ status: 'error', message: 'Las contraseñas no coinciden.' });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ status: 'error', message: 'Ya existe un usuario con este email.' });
    }
    const user = await User.create({ name, email, password, phone, role: 'user' });
    createSendToken(user, 201, res);
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Por favor ingresá email y contraseña.' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ status: 'error', message: 'Email o contraseña incorrectos.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ status: 'error', message: 'Tu cuenta está suspendida. Contactá al administrador.' });
    }
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ status: 'success', data: { user } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, location } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, location },
      { new: true, runValidators: true }
    );
    res.json({ status: 'success', data: { user } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ status: 'error', message: 'Las contraseñas nuevas no coinciden.' });
    }
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return res.status(400).json({ status: 'error', message: 'Contraseña actual incorrecta.' });
    }
    user.password = newPassword;
    await user.save();
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
