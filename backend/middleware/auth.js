/**
 * Ecobin JWT & RBAC Middleware
 */
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'ecobin_super_secret_jwt_key_2026';

const authenticateToken = (req, res, next) => {
  let token = null;

  // Check Authorization header
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // Check cookies as fallback
  if (!token && req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to proceed.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.findOne('users', u => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session user. Please log in again.'
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ward_area: user.ward_area
    };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token expired or invalid. Please re-authenticate.',
      error: err.message
    });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]. Your current role is '${req.user.role}'.`
      });
    }

    next();
  };
};

module.exports = {
  JWT_SECRET,
  authenticateToken,
  requireRole
};
