const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const { requireRole } = require("../middleware/rolePermission");
const { User } = require("../models");
const bcrypt = require("bcryptjs");

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get(
  "/",
  authenticateToken,
  requireRole(["admin", "superadmin"]),
  async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ["password"] }, // Exclude password field
        order: [["created_at", "DESC"]],
      });

      res.json({
        success: true,
        count: users.length,
        users: users.map((user) => user.toJSON()),
      });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching users",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   GET /api/users/:id
// @desc    Get user by ID (admin only)
// @access  Private (Admin)
router.get(
  "/:id",
  authenticateToken,
  requireRole(["admin", "superadmin"]),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ["password"] }, // Exclude password field
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        user: user.toJSON(),
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching user",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   POST /api/users
// @desc    Create new user (admin only)
// @access  Private (Admin)
router.post(
  "/",
  authenticateToken,
  requireRole(["admin", "superadmin"]),
  async (req, res) => {
    try {
      const { username, email, password, role, name, branch, province } =
        req.body;

      // Validate required fields
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Username, email, and password are required",
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          email: email.trim().toLowerCase(),
        },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      // Check if username already exists
      const existingUsername = await User.findOne({
        where: {
          username: username.trim(),
        },
      });

      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: "User with this username already exists",
        });
      }

      // Validate role (non-superadmin users can't create superadmin users)
      const validRoles =
        req.user.role === "superadmin"
          ? ["user", "admin", "superadmin", "driver", "client"]
          : ["user", "admin", "driver", "client"];

      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role",
        });
      }

      // Create user (password will be hashed by Sequelize hook)
      const user = await User.create({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password, // Will be hashed by beforeCreate hook
        role: role || "user",
        name: name || null,
        branch: branch || null,
        province: province || null,
      });

      res.status(201).json({
        success: true,
        message: "User created successfully",
        user: user.toJSON(),
      });
    } catch (error) {
      console.error("Create user error:", error);

      // Handle validation errors
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          error: error.errors.map((e) => e.message),
        });
      }

      res.status(500).json({
        success: false,
        message: "Error creating user",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   PUT /api/users/:id
// @desc    Update user (admin only)
// @access  Private (Admin)
router.put(
  "/:id",
  authenticateToken,
  requireRole(["admin", "superadmin"]),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Prevent non-superadmin users from modifying superadmin users
      if (user.role === "superadmin" && req.user.role !== "superadmin") {
        return res.status(403).json({
          success: false,
          message: "Only SuperAdmins can modify SuperAdmin accounts",
        });
      }

      // Prevent users from modifying their own role to superadmin
      if (req.user.role !== "superadmin" && req.body.role === "superadmin") {
        return res.status(403).json({
          success: false,
          message: "Only SuperAdmins can create SuperAdmin accounts",
        });
      }

      // Prepare update data
      const updateData = {};
      const allowedFields = [
        "username",
        "email",
        "role",
        "name",
        "branch",
        "province",
      ];

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          if (field === "email") {
            updateData[field] = req.body[field].trim().toLowerCase();
          } else if (field === "username") {
            updateData[field] = req.body[field].trim();
          } else {
            updateData[field] = req.body[field];
          }
        }
      }

      // If password is being updated
      if (req.body.password) {
        updateData.password = await bcrypt.hash(req.body.password, 10);
      }

      // Update user
      await user.update(updateData);

      res.json({
        success: true,
        message: "User updated successfully",
        user: user.toJSON(),
      });
    } catch (error) {
      console.error("Update user error:", error);

      // Handle validation errors
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          error: error.errors.map((e) => e.message),
        });
      }

      res.status(500).json({
        success: false,
        message: "Error updating user",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private (Admin)
router.delete(
  "/:id",
  authenticateToken,
  requireRole(["admin", "superadmin"]),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Prevent users from deleting themselves
      if (user.id === req.user.userId) {
        return res.status(400).json({
          success: false,
          message: "You cannot delete your own account",
        });
      }

      // Prevent non-superadmin users from deleting superadmin users
      if (user.role === "superadmin" && req.user.role !== "superadmin") {
        return res.status(403).json({
          success: false,
          message: "Only SuperAdmins can delete SuperAdmin accounts",
        });
      }

      // Delete user
      await user.destroy();

      res.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting user",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

module.exports = router;
