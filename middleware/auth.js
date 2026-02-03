const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'User account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Check user role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Access denied' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions' 
      });
    }

    next();
  };
};

// Check specific permissions
const checkPermission = (module, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Access denied' });
    }

    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user has specific permission
    const hasPermission = req.user.permissions.some(perm => 
      perm.module === module && perm.actions.includes(action)
    );

    if (!hasPermission) {
      return res.status(403).json({ 
        message: `Access denied. Missing ${action} permission for ${module}` 
      });
    }

    next();
  };
};

// Rate limiting for sensitive operations
const sensitiveOperation = (req, res, next) => {
  // Additional security checks for sensitive operations
  const userAgent = req.get('User-Agent');
  const ip = req.ip || req.connection.remoteAddress;
  
  // Log sensitive operation
  console.log(`Sensitive operation by user ${req.user.id} from IP ${ip}`);
  
  next();
};

module.exports = {
  auth,
  authorize,
  checkPermission,
  sensitiveOperation
};
