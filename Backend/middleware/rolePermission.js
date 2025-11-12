const { User } = require("../models");

// Middleware to check if user has specific role
const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // If roles is a string, convert to array
      if (typeof roles === "string") {
        roles = [roles];
      }

      // Check if user has required role
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
        });
      }

      next();
    } catch (error) {
      console.error("Role check error:", error);
      return res.status(500).json({
        success: false,
        message: "Error checking permissions",
      });
    }
  };
};

// Middleware to check if user can modify shipment based on destination
const canModifyShipment = () => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // SuperAdmins and Admins can modify any shipment
      if (req.user.role === "superadmin" || req.user.role === "admin") {
        return next();
      }

      // Regular users can only modify shipments where destination matches their branch
      if (req.user.role === "user") {
        const { shipmentId } = req.params;
        const { destination } = req.body;

        // If updating an existing shipment
        if (shipmentId) {
          // Here you would typically fetch the shipment from database and check
          // if its destination matches the user's branch
          // For now, we'll just check the branch field
          if (req.user.branch && destination) {
            if (destination.includes(req.user.branch)) {
              return next();
            } else {
              return res.status(403).json({
                success: false,
                message: "You can only modify shipments for your branch",
              });
            }
          }
        } else {
          // Creating a new shipment
          if (req.user.branch && destination) {
            if (destination.includes(req.user.branch)) {
              return next();
            } else {
              return res.status(403).json({
                success: false,
                message: "You can only create shipments for your branch",
              });
            }
          }
        }
      }

      // If we reach here, user doesn't have permission
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({
        success: false,
        message: "Error checking permissions",
      });
    }
  };
};

// Middleware to check if user can send products to other branches
const canSendToBranch = () => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // SuperAdmins and Admins can send to any branch
      if (req.user.role === "superadmin" || req.user.role === "admin") {
        return next();
      }

      // Regular users can send products to other branches
      if (req.user.role === "user") {
        // Users can send products to other branches
        return next();
      }

      // If we reach here, user doesn't have permission
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({
        success: false,
        message: "Error checking permissions",
      });
    }
  };
};

module.exports = {
  requireRole,
  canModifyShipment,
  canSendToBranch,
};
