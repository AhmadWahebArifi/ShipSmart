const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const { requireRole } = require("../middleware/rolePermission");
const { AuditLog } = require("../models");
const { Op } = require("sequelize");

// @route   GET /api/admin/audit-logs
// @desc    Get paginated audit logs (admin only)
// @access  Private (Admin)
router.get(
  "/",
  authenticateToken,
  requireRole(["admin", "superadmin"]),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 50,
        action,
        entity_type,
        actor_user_id,
        success,
        from,
        to,
      } = req.query;

      const where = {};

      if (action) where.action = { [Op.like]: `%${action}%` };
      if (entity_type) where.entity_type = entity_type;
      if (actor_user_id) where.actor_user_id = actor_user_id;
      if (success !== undefined) where.success = success === "true";

      if (from || to) {
        where.created_at = {};
        if (from) where.created_at[Op.gte] = new Date(from);
        if (to) where.created_at[Op.lte] = new Date(to);
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows: logs } = await AuditLog.findAndCountAll({
        where,
        include: [
          {
            model: require("../models").User,
            as: "actor",
            attributes: ["id", "username", "email", "role"],
            required: false,
          },
        ],
        order: [["created_at", "DESC"]],
        limit: parseInt(limit),
        offset,
      });

      res.json({
        success: true,
        count,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        logs: logs.map((log) => ({
          ...log.toJSON(),
          actor: log.actor || null,
        })),
      });
    } catch (error) {
      console.error("Get audit logs error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching audit logs",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   GET /api/admin/audit-logs/summary
// @desc    Get summary stats for admin dashboard
// @access  Private (Admin)
router.get(
  "/summary",
  authenticateToken,
  requireRole(["admin", "superadmin"]),
  async (req, res) => {
    try {
      const totalLogs = await AuditLog.count();
      const last24h = await AuditLog.count({
        where: {
          created_at: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });
      const failedLogins = await AuditLog.count({
        where: {
          action: "auth.login",
          success: false,
          created_at: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });

      res.json({
        success: true,
        totalLogs,
        last24h,
        failedLogins,
      });
    } catch (error) {
      console.error("Get audit summary error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching audit summary",
      });
    }
  }
);

module.exports = router;
