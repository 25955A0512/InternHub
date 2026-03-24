const jwt = require('jsonwebtoken');

const authMiddleware = {

  // Verify token — protect any route
  verifyToken: (req, res, next) => {
    try {
      // Token comes in header: "Authorization: Bearer eyJ..."
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          message: 'Access denied. No token provided.' 
        });
      }

      // Extract token from "Bearer <token>"
      const token = authHeader.split(' ')[1];

      // Verify and decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user info to request object
      req.user = decoded;

      // Move to next function
      next();

    } catch (error) {
      return res.status(401).json({ 
        message: 'Invalid or expired token. Please login again.' 
      });
    }
  },

  // Role-based access — only allow specific roles
  authorizeRoles: (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: `Access denied. Only ${roles.join(', ')} can access this.` 
        });
      }
      next();
    };
  }

};

module.exports = authMiddleware;
