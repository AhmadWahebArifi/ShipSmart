const { User, Shipment } = require("../models");

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

// Middleware to check if user can modify a shipment
const canModifyShipment = async (req, res, next) => {
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

    // For other roles, enforce shipment- and province-based rules
    const shipmentId = req.params.id;

    if (!shipmentId) {
      return res.status(400).json({
        success: false,
        message: "Shipment ID is required",
      });
    }

    // Load user and shipment from DB
    const [dbUser, shipment] = await Promise.all([
      User.findByPk(req.user.userId),
      Shipment.findByPk(shipmentId),
    ]);

    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    const requestedStatus = req.body?.status;
    const currentStatus = shipment.status;

    const hasProvince = !!dbUser.province;
    const hasBranch = !!dbUser.branch;

    const isFromProvinceUser =
      shipment.from_province &&
      ((hasProvince &&
        dbUser.province.toLowerCase() ===
          shipment.from_province.toLowerCase()) ||
        (hasBranch &&
          dbUser.branch
            .toLowerCase()
            .includes(shipment.from_province.toLowerCase())));

    const isToProvinceUser =
      shipment.to_province &&
      ((hasProvince &&
        dbUser.province.toLowerCase() === shipment.to_province.toLowerCase()) ||
        (hasBranch &&
          dbUser.branch
            .toLowerCase()
            .includes(shipment.to_province.toLowerCase())));

    // Allowed statuses for FROM province user: pending, in_progress, on_route, canceled
    const fromProvinceAllowed =
      isFromProvinceUser &&
      requestedStatus &&
      ["pending", "in_progress", "on_route", "canceled"].includes(
        requestedStatus
      );

    // Allowed transition for TO province user: on_route -> delivered
    const toProvinceAllowed =
      isToProvinceUser &&
      requestedStatus &&
      currentStatus === "on_route" &&
      requestedStatus === "delivered";

    if (fromProvinceAllowed || toProvinceAllowed) {
      return next();
    }

    // If we reach here, user doesn't have permission
    return res.status(403).json({
      success: false,
      message: "Insufficient permissions to modify this shipment",
    });
  } catch (error) {
    console.error("Permission check error:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking permissions",
    });
  }
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
