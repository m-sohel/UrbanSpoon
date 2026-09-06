const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify JWT token and authenticate user
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'urbanspoon_fallback_secret_key'
      );

      // Fetch user from database excluding password
      let user;
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch (dbErr) {
        console.warn('[Auth Middleware] Database read fallback:', dbErr.message);
      }

      // If user found in DB, attach to req
      if (user) {
        req.user = user;
      } else if (decoded.id && decoded.role) {
        // Fallback in case user payload is contained in token
        req.user = {
          _id: decoded.id,
          name: decoded.name || 'Admin User',
          email: decoded.email || 'admin@urbanspoon.com',
          role: decoded.role,
        };
      } else {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found',
        });
      }

      next();
    } catch (error) {
      console.error('[Auth Middleware] Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid or expired',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no bearer token provided',
    });
  }
};

/**
 * Middleware to restrict access to specific roles (e.g. 'admin')
 * @param  {...string} roles Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before role verification',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }

    next();
  };
};

const adminOnly = authorize('admin');

module.exports = {
  protect,
  authorize,
  adminOnly,
};
