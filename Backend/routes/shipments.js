const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const {
  requireRole,
  canModifyShipment,
  canSendToBranch,
} = require("../middleware/rolePermission");
const { Shipment, User, Notification, Vehicle } = require("../models");

// Import provincial connections data and functions
const provincialConnections = require("../routes/provincialConnections");
const {
  PROVINCIAL_CONNECTIONS,
  toEnglishProvinceName,
  getShortestRoute,
  formatRoute,
} = provincialConnections;

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
      {
        model: Vehicle,
        as: "vehicle",
        attributes: [
          "id",
          "vehicle_id",
          "type",
          "driver_name",
          "capacity",
          "status",
        ],
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
        {
          model: Vehicle,
          as: "vehicle",
          attributes: [
            "id",
            "vehicle_id",
            "type",
            "driver_name",
            "capacity",
            "status",
          ],
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
    const {
      from_province,
      to_province,
      tracking_number,
      description,
      expected_departure_date,
      expected_arrival_date,
      vehicle_id,
    } = req.body;

    // Debug log the received data
    console.log("Received shipment creation request with data:", {
      from_province,
      to_province,
      tracking_number,
      description,
      expected_departure_date,
      expected_arrival_date,
    });
    const sender = await User.findByPk(req.user.userId);

    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate required fields
    if (!from_province || !to_province || !tracking_number) {
      return res.status(400).json({
        success: false,
        message: "From province, to province, and tracking number are required",
        missing_fields: {
          from_province: !from_province,
          to_province: !to_province,
          tracking_number: !tracking_number,
        },
      });
    }

    // Validate province names (case-insensitive and trim whitespace)
    const normalizedFromProvince = from_province?.trim();
    const normalizedToProvince = to_province?.trim();

    // Debug logging to see what we're receiving
    console.log("Received province values in creation route:", {
      from_province,
      to_province,
      normalizedFromProvince,
      normalizedToProvince,
    });

    const isValidFromProvince = PROVINCES.some(
      (province) =>
        province.toLowerCase() === normalizedFromProvince?.toLowerCase()
    );
    const isValidToProvince = PROVINCES.some(
      (province) =>
        province.toLowerCase() === normalizedToProvince?.toLowerCase()
    );

    if (!isValidFromProvince || !isValidToProvince) {
      console.log("Province validation failed in creation route:", {
        from_province,
        to_province,
        normalizedFromProvince,
        normalizedToProvince,
        isValidFromProvince,
        isValidToProvince,
        availableProvinces: PROVINCES,
      });
      return res.status(400).json({
        success: false,
        message: "Invalid province name",
      });
    }

    // Use the exact province name from the PROVINCES array to ensure consistency
    const exactFromProvince = PROVINCES.find(
      (province) =>
        province.toLowerCase() === normalizedFromProvince?.toLowerCase()
    );
    const exactToProvince = PROVINCES.find(
      (province) =>
        province.toLowerCase() === normalizedToProvince?.toLowerCase()
    );

    // Check if provinces are the same (using exact names)
    if (exactFromProvince === exactToProvince) {
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

    // Calculate route information
    let routeInfo = null;
    let routeHops = null;

    // Convert to English for route calculation
    const fromProvinceEn = toEnglishProvinceName(exactFromProvince);
    const toProvinceEn = toEnglishProvinceName(exactToProvince);

    // Check if there's a direct connection
    const hasDirectConnection =
      PROVINCIAL_CONNECTIONS[fromProvinceEn] &&
      PROVINCIAL_CONNECTIONS[fromProvinceEn].includes(toProvinceEn);

    if (!hasDirectConnection) {
      // Find the shortest route
      const shortestRoute = getShortestRoute(fromProvinceEn, toProvinceEn);
      if (shortestRoute) {
        // Format route for display (using English for storage)
        routeInfo = formatRoute(shortestRoute, "en");
        routeHops = shortestRoute.length - 1;
      }
    } else {
      // Direct connection
      routeInfo = `${fromProvinceEn} → ${toProvinceEn}`;
      routeHops = 0;
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

    // Create shipment with exact province names and route information
    console.log("Creating shipment with data:", {
      from_province: exactFromProvince,
      to_province: exactToProvince,
      tracking_number,
      description: description || null,
      sender_id: sender.id,
      receiver_id: receiver ? receiver.id : null,
      status: "pending",
      expected_departure_date: expected_departure_date || null,
      expected_arrival_date: expected_arrival_date || null,
      vehicle_id: vehicle_id || null,
      route_info: routeInfo,
      route_hops: routeHops,
    });

    const shipment = await Shipment.create({
      from_province: exactFromProvince,
      to_province: exactToProvince,
      tracking_number, // Added tracking_number here
      description: description || null,
      sender_id: sender.id,
      receiver_id: receiver ? receiver.id : null,
      status: "pending",
      expected_departure_date: expected_departure_date || null,
      expected_arrival_date: expected_arrival_date || null,
      vehicle_id: vehicle_id || null,
      route_info: routeInfo,
      route_hops: routeHops,
    });

    console.log("Shipment created successfully with ID:", shipment.id);

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

    // Update vehicle status if vehicle is assigned
    if (
      vehicle_id &&
      (shipment.status === "in_progress" || shipment.status === "on_route")
    ) {
      const vehicle = await Vehicle.findByPk(vehicle_id);
      if (vehicle) {
        await vehicle.update({ status: "not_available" });
      }
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

// @route   PUT /api/shipments/:id
// @desc    Update shipment
// @access  Private
router.put("/:id", authenticateToken, canModifyShipment, async (req, res) => {
  try {
    const shipment = await Shipment.findByPk(req.params.id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    const {
      from_province,
      to_province,
      tracking_number,
      description,
      status,
      expected_departure_date,
      expected_arrival_date,
      vehicle_id,
    } = req.body;

    // Validate province names if provided
    if (from_province) {
      const isValidFromProvince = PROVINCES.some(
        (province) => province.toLowerCase() === from_province.toLowerCase()
      );
      if (!isValidFromProvince) {
        return res.status(400).json({
          success: false,
          message: "Invalid from province name",
        });
      }
    }

    if (to_province) {
      const isValidToProvince = PROVINCES.some(
        (province) => province.toLowerCase() === to_province.toLowerCase()
      );
      if (!isValidToProvince) {
        return res.status(400).json({
          success: false,
          message: "Invalid to province name",
        });
      }
    }

    // Check if provinces are the same
    if (from_province && to_province && from_province === to_province) {
      return res.status(400).json({
        success: false,
        message: "From and to provinces cannot be the same",
      });
    }

    // Update shipment
    const updatedShipment = await shipment.update({
      from_province: from_province || shipment.from_province,
      to_province: to_province || shipment.to_province,
      tracking_number: tracking_number || shipment.tracking_number,
      description:
        description !== undefined ? description : shipment.description,
      status: status || shipment.status,
      expected_departure_date:
        expected_departure_date !== undefined
          ? expected_departure_date
          : shipment.expected_departure_date,
      expected_arrival_date:
        expected_arrival_date !== undefined
          ? expected_arrival_date
          : shipment.expected_arrival_date,
      vehicle_id: vehicle_id !== undefined ? vehicle_id : shipment.vehicle_id,
    });

    // Update vehicle status if needed
    if (vehicle_id !== undefined && shipment.vehicle_id !== vehicle_id) {
      // Set previous vehicle to available if it existed
      if (shipment.vehicle_id) {
        const previousVehicle = await Vehicle.findByPk(shipment.vehicle_id);
        if (previousVehicle) {
          // Only set to available if shipment is not in progress or on route
          if (status !== "in_progress" && status !== "on_route") {
            await previousVehicle.update({ status: "available" });
          }
        }
      }

      // Set new vehicle to not available if shipment is in progress or on route
      if (vehicle_id && (status === "in_progress" || status === "on_route")) {
        const newVehicle = await Vehicle.findByPk(vehicle_id);
        if (newVehicle) {
          await newVehicle.update({ status: "not_available" });
        }
      }
    }

    // Reload with associations
    await updatedShipment.reload({
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
        {
          model: Vehicle,
          as: "vehicle",
          attributes: [
            "id",
            "vehicle_id",
            "type",
            "driver_name",
            "capacity",
            "status",
          ],
          required: false,
        },
      ],
    });

    res.json({
      success: true,
      message: "Shipment updated successfully",
      shipment: updatedShipment.toJSON(),
    });
  } catch (error) {
    console.error("Update shipment error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating shipment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   PUT /api/shipments/:id/status
// @desc    Update shipment status
// @access  Private
router.put(
  "/:id/status",
  authenticateToken,
  canModifyShipment,
  async (req, res) => {
    try {
      const { status } = req.body;
      const shipment = await Shipment.findByPk(req.params.id);

      if (!shipment) {
        return res.status(404).json({
          success: false,
          message: "Shipment not found",
        });
      }

      // Validate status
      const validStatuses = [
        "pending",
        "in_progress",
        "on_route",
        "delivered",
        "canceled",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      // Update status
      const updatedShipment = await shipment.update({ status });

      // Update vehicle status if needed
      if (shipment.vehicle_id) {
        const vehicle = await Vehicle.findByPk(shipment.vehicle_id);
        if (vehicle) {
          if (status === "in_progress" || status === "on_route") {
            await vehicle.update({ status: "not_available" });
          } else if (status === "delivered" || status === "canceled") {
            await vehicle.update({ status: "available" });
          }
        }
      }

      // Reload with associations
      await updatedShipment.reload({
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
          {
            model: Vehicle,
            as: "vehicle",
            attributes: [
              "id",
              "vehicle_id",
              "type",
              "driver_name",
              "capacity",
              "status",
            ],
            required: false,
          },
        ],
      });

      res.json({
        success: true,
        message: "Shipment status updated successfully",
        shipment: updatedShipment.toJSON(),
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

// @route   DELETE /api/shipments/:id
// @desc    Delete shipment
// @access  Private
router.delete(
  "/:id",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const shipment = await Shipment.findByPk(req.params.id);
      if (!shipment) {
        return res.status(404).json({
          success: false,
          message: "Shipment not found",
        });
      }

      // Set vehicle to available if it was assigned
      if (shipment.vehicle_id) {
        const vehicle = await Vehicle.findByPk(shipment.vehicle_id);
        if (vehicle) {
          await vehicle.update({ status: "available" });
        }
      }

      await shipment.destroy();

      res.json({
        success: true,
        message: "Shipment deleted successfully",
      });
    } catch (error) {
      console.error("Delete shipment error:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting shipment",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

module.exports = router;
