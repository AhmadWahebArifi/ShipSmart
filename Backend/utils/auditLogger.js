const { AuditLog } = require("../models");

/**
 * Log an audit event
 * @param {Object} req - Express request object (optional, for auto IP/UA)
 * @param {Object} data
 * @param {number} [data.actor_user_id] - User ID who performed the action
 * @param {string} [data.actor_role] - Role of the actor at time of action
 * @param {string} data.action - Action key (e.g., "user.create", "shipment.update_status")
 * @param {string} [data.entity_type] - Entity type (e.g., "User", "Shipment")
 * @param {string} [data.entity_id] - Entity ID (string to support non-numeric)
 * @param {boolean} [data.success=true] - Whether the action succeeded
 * @param {string} [data.message] - Human-friendly message
 * @param {Object} [data.metadata] - Safe metadata (no passwords/tokens)
 */
async function logAudit(req, data) {
  try {
    const payload = {
      actor_user_id: data.actor_user_id || null,
      actor_role: data.actor_role || null,
      action: data.action,
      entity_type: data.entity_type || null,
      entity_id: data.entity_id || null,
      success: data.success !== undefined ? data.success : true,
      message: data.message || null,
      metadata: data.metadata || null,
      ip_address: null,
      user_agent: null,
    };

    if (req && req.ip) {
      payload.ip_address = req.ip;
    }
    if (req && req.get("User-Agent")) {
      payload.user_agent = req.get("User-Agent");
    }

    await AuditLog.create(payload);
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

/**
 * Middleware to auto-log actions (optional)
 * Use on routes you want to auto-log with minimal code
 */
function auditMiddleware(action, entity) {
  return (req, res, next) => {
    const originalSend = res.send;
    let logged = false;

    res.send = function (data) {
      if (!logged) {
        const success = res.statusCode < 400;
        logAudit(req, {
          actor_user_id: req.user?.userId,
          actor_role: req.user?.role,
          action,
          entity_type: entity,
          entity_id: req.params.id || req.body.id || null,
          success,
          message: success ? `${action} succeeded` : `${action} failed`,
        });
        logged = true;
      }
      originalSend.call(this, data);
    };

    next();
  };
}

module.exports = { logAudit, auditMiddleware };
