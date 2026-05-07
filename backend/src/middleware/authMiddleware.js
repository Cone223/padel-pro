const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ status: 'error', message: 'No autorizado. Por favor inicia sesión.' });
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET || 'padelfinder_secret_2024');
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ status: 'error', message: 'El usuario ya no existe o está inactivo.' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Token inválido o expirado.' });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: 'No tenés permiso para realizar esta acción.' });
    }
    next();
  };
};

exports.optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET || 'padelfinder_secret_2024');
      const user = await User.findById(decoded.id);
      if (user && user.isActive) req.user = user;
    }
  } catch (error) { /* ignore */ }
  next();
};
