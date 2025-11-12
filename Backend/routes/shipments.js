const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const {
  requireRole,
  canModifyShipment,
  canSendToBranch,
} = require("../middleware/rolePermission");
const { Shipment, User, Notification } = require("../models");

// Afghanistan provinces list
const PROVINCES = [
  "Kabul",
  "Herat",
  "Kandahar",
  "Balkh",
  "Nangarhar",
  "Badghis",
  "Badakhshan",
  "Baghlan",
  "Bamyan",
  "Daykundi",
  "Farah",
  "Faryab",
  "Ghazni",
  "Ghor",
  "Helmand",
  "Jowzjan",
  "Kapisa",
  "Khost",
  "Kunar",
  "Kunduz",
  "Laghman",
  "Logar",
  "Nimruz",
  "Nuristan",
  "Paktia",
  "Paktika",
  "Panjshir",
  "Parwan",
  "Samangan",
  "Sar-e Pol",
  "Takhar",
  "Uruzgan",
  "Wardak",
  "Zabul",
];

// @route   GET /api/shipments/provinces
// @desc    Get list of all provinces
// @access  Public
router.get("/provinces", (req, res) => {
  res.json({
    success: true,
    provinces: PROVINCES,
  });
});

// @route   GET /api/shipments
// @desc    Get all shipments (filtered by user role and province)
// @access  Private
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let whereClause = {};
    let includeOptions = [
      {
        model: User,
        as: "sender",
        attributes: ["id", "username", "name", "email", "province", "branch"],
      },
      {
        model: User,
        as: "receiver",
        attributes: ["id", "username", "name", "email", "province", "branch"],
        required: false,
      },
    ];

    // Filter by user role
    if (user.role === "superadmin" || user.role === "admin") {
      // Admins can see all shipments
    } else if (user.role === "user") {
      // Regular users can only see shipments they sent or received
      whereClause = {
        [require("sequelize").Op.or]: [
          { sender_id: user.id },
          { receiver_id: user.id },
        ],
      };
    }

    // Optional filters
    if (req.query.status) {
      whereClause.status = req.query.status;
    }
    if (req.query.from_province) {
      whereClause.from_province = req.query.from_province;
    }
    if (req.query.to_province) {
      whereClause.to_province = req.query.to_province;
    }

    const shipments = await Shipment.findAll({
      where: whereClause,
      include: includeOptions,
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      count: shipments.length,
      shipments: shipments.map((s) => s.toJSON()),
    });
  } catch (error) {
    console.error("Get shipments error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching shipments",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   GET /api/shipments/:id
// @desc    Get single shipment by ID
// @access  Private
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const shipment = await Shipment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "name", "email", "province", "branch"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "username", "name", "email", "province", "branch"],
          required: false,
        },
      ],
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    // Check if user has permission to view this shipment
    if (
      user.role !== "superadmin" &&
      user.role !== "admin" &&
      shipment.sender_id !== user.id &&
      shipment.receiver_id !== user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      shipment: shipment.toJSON(),
    });
  } catch (error) {
    console.error("Get shipment error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching shipment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   POST /api/shipments
// @desc    Create new shipment
// @access  Private (with role-based permissions)
router.post("/", authenticateToken, canSendToBranch(), async (req, res) => {
  try {
    const { from_province, to_province, description } = req.body;
    const sender = await User.findByPk(req.user.userId);

    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate provinces
    if (!from_province || !to_province) {
      return res.status(400).json({
        success: false,
        message: "From province and to province are required",
      });
    }

    if (
      !PROVINCES.includes(from_province) ||
      !PROVINCES.includes(to_province)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid province name",
      });
    }

    if (from_province === to_province) {
      return res.status(400).json({
        success: false,
        message: "From and to provinces cannot be the same",
      });
    }

    // For regular users, check if they can send from their branch
    if (sender.role === "user") {
      if (sender.branch && !from_province.includes(sender.branch)) {
        // Extract province name from branch (e.g., "New York Branch" -> check if from_province is related)
        // This is a simplified check - in a real app, you'd have a more sophisticated mapping
        const senderProvince = sender.branch.replace(" Branch", "");
        if (from_province !== senderProvince) {
          return res.status(403).json({
            success: false,
            message: "You can only send shipments from your branch location",
          });
        }
      }
    }

    // Find receiver user in the destination province (if exists)
    let receiver = null;
    if (to_province) {
      receiver = await User.findOne({
        where: {
          province: to_province,
          role: { [require("sequelize").Op.ne]: "admin" },
        },
      });
    }

    // Create shipment
    const shipment = await Shipment.create({
      from_province,
      to_province,
      description: description || null,
      sender_id: sender.id,
      receiver_id: receiver ? receiver.id : null,
      status: "pending",
    });

    // Reload with associations
    await shipment.reload({
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "name", "email", "province", "branch"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "username", "name", "email", "province", "branch"],
          required: false,
        },
      ],
    });

    // Create notification for receiver if exists
    if (receiver) {
      await Notification.create({
        user_id: receiver.id,
        shipment_id: shipment.id,
        title: "New Shipment Arriving",
        message: `A shipment from ${from_province} to ${to_province} is on its way. Status: Pending`,
        type: "shipment_created",
        is_read: false,
      });
    }

    res.status(201).json({
      success: true,
      message: "Shipment created successfully",
      shipment: shipment.toJSON(),
    });
  } catch (error) {
    console.error("Create shipment error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating shipment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   PUT /api/shipments/:id/status
// @desc    Update shipment status
// @access  Private (with role-based permissions)
router.put(
  "/:id/status",
  authenticateToken,
  canModifyShipment(),
  async (req, res) => {
    try {
      const { status } = req.body;
      const user = await User.findByPk(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const validStatuses = ["pending", "in_progress", "delivered"];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status. Must be one of: pending, in_progress, delivered",
        });
      }

      const shipment = await Shipment.findByPk(req.params.id);
      if (!shipment) {
        return res.status(404).json({
          success: false,
          message: "Shipment not found",
        });
      }

      // Check permissions based on roles
      if (user.role === "superadmin") {
        // SuperAdmin can change any status
      } else if (user.role === "admin") {
        // Admin can change any status
      } else if (user.role === "user") {
        // Regular users have limited permissions
        if (status === "delivered") {
          // Users can only mark as delivered if they are the receiver or if destination is their branch
          if (
            shipment.receiver_id !== user.id &&
            (!user.branch ||
              !shipment.to_province.includes(
                user.branch.replace(" Branch", "")
              ))
          ) {
            return res.status(403).json({
              success: false,
              message:
                "You can only mark shipments as delivered for your branch",
            });
          }
        } else if (status === "in_progress") {
          // Users can mark as in_progress if they are the sender or if origin is their branch
          if (
            shipment.sender_id !== user.id &&
            (!user.branch ||
              !shipment.from_province.includes(
                user.branch.replace(" Branch", "")
              ))
          ) {
            return res.status(403).json({
              success: false,
              message:
                "You can only mark shipments as in progress from your branch",
            });
          }
        } else if (status === "pending") {
          // Users can only set to pending if they are the sender
          if (shipment.sender_id !== user.id) {
            return res.status(403).json({
              success: false,
              message: "You can only reset shipments you sent",
            });
          }
        }
      }

      // Update status
      const updateData = { status };

      if (status === "in_progress" && !shipment.shipped_at) {
        updateData.shipped_at = new Date();
      }

      if (status === "delivered") {
        updateData.delivered_at = new Date();

        // Create notification for sender
        if (shipment.sender_id) {
          await Notification.create({
            user_id: shipment.sender_id,
            shipment_id: shipment.id,
            title: "Shipment Delivered",
            message: `Your shipment from ${shipment.from_province} to ${shipment.to_province} has been delivered.`,
            type: "shipment_delivered",
            is_read: false,
          });
        }
      }

      await shipment.update(updateData);
      await shipment.reload({
        include: [
          {
            model: User,
            as: "sender",
            attributes: [
              "id",
              "username",
              "name",
              "email",
              "province",
              "branch",
            ],
          },
          {
            model: User,
            as: "receiver",
            attributes: [
              "id",
              "username",
              "name",
              "email",
              "province",
              "branch",
            ],
            required: false,
          },
        ],
      });

      res.json({
        success: true,
        message: "Shipment status updated successfully",
        shipment: shipment.toJSON(),
      });
    } catch (error) {
      console.error("Update shipment status error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating shipment status",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   GET /api/shipments/stats/overview
// @desc    Get shipment statistics (admin only)
// @access  Private (Admin)
router.get(
  "/stats/overview",
  authenticateToken,
  requireRole(["admin", "superadmin"]),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.user.userId);

      if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin only.",
        });
      }

      const totalShipments = await Shipment.count();
      const pendingShipments = await Shipment.count({
        where: { status: "pending" },
      });
      const inProgressShipments = await Shipment.count({
        where: { status: "in_progress" },
      });
      const deliveredShipments = await Shipment.count({
        where: { status: "delivered" },
      });

      // Get shipments by province
      const shipmentsByProvince = await Shipment.findAll({
        attributes: [
          "to_province",
          [
            require("sequelize").fn("COUNT", require("sequelize").col("id")),
            "count",
          ],
        ],
        group: ["to_province"],
        raw: true,
      });

      // Recent shipments
      const recentShipments = await Shipment.findAll({
        limit: 10,
        order: [["created_at", "DESC"]],
        include: [
          {
            model: User,
            as: "sender",
            attributes: ["id", "username", "name", "province", "branch"],
          },
          {
            model: User,
            as: "receiver",
            attributes: ["id", "username", "name", "province", "branch"],
            required: false,
          },
        ],
      });

      res.json({
        success: true,
        stats: {
          total: totalShipments,
          pending: pendingShipments,
          in_progress: inProgressShipments,
          delivered: deliveredShipments,
          by_province: shipmentsByProvince,
          recent: recentShipments.map((s) => s.toJSON()),
        },
      });
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching statistics",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

module.exports = router;
