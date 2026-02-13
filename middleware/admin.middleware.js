// Admin authorization middleware
exports.adminOnly = (req, res, next) => {
  try {
    // Check if user has admin role
    if (!req.user || (req.user.role !== "admin" && req.user.isAdmin !== true)) {
      return res.status(403).json({ 
        message: "Access denied. Admin privileges required" 
      });
    }
    
    next();
  } catch (error) {
    return res.status(403).json({ 
      message: "Access denied. Admin privileges required" 
    });
  }
};
