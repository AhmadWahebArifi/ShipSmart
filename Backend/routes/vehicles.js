const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const authenticateToken = require("../middleware/auth");
const { requireRole } = require("../middleware/rolePermission");
const { Vehicle, User, Shipment } = require("../models");

// Validation middleware
const validateVehicle = [
  check("vehicle_id", "Vehicle ID is required").not().isEmpty().trim(),
  check("type", "Vehicle type is required").not().isEmpty().trim(),
  check("capacity", "Capacity is required and must be greater than 0").isFloat({
    min: 0.01,
  }),
  check("status", "Status must be either available or not_available").isIn([
    "available",
    "not_available",
  ]),
];

// @route   POST /api/vehicles
// @desc    Create a new vehicle
// @access  Private
router.post("/", [authenticateToken, ...validateVehicle], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { vehicle_id, type, driver_name, capacity, status } = req.body;

    // Check if vehicle already exists
    const existingVehicle = await Vehicle.findOne({
      where: { vehicle_id },
    });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle with this ID already exists",
      });
    }

    // Create vehicle
    const vehicle = await Vehicle.create({
      vehicle_id,
      type,
      driver_name: driver_name || null,
      capacity,
      status: status || "available",
      created_by: req.user.userId,
    });

    // Reload with associations
    await vehicle.reload({
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "username", "name", "email"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      vehicle: {
        id: vehicle.id,
        vehicle_id: vehicle.vehicle_id,
        type: vehicle.type,
        driver_name: vehicle.driver_name,
        capacity: vehicle.capacity,
        status: vehicle.status,
        created_by: vehicle.creator,
        created_at: vehicle.created_at,
        updated_at: vehicle.updated_at,
      },
    });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    res.status(500).json({
      success: false,
      message: "Error creating vehicle",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   GET /api/vehicles
// @desc    Get all vehicles
// @access  Private
router.get("/", authenticateToken, async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "username", "name", "email"],
        },
        {
          model: Shipment,
          as: "shipments",
          attributes: ["id", "tracking_number", "status"],
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // Calculate real-time vehicle status based on active shipments
    const vehiclesWithStatus = vehicles.map((v) => {
      // If vehicle has active shipments (in_progress or on_route), it's not available
      const activeShipments = v.shipments?.filter(
        (s) => s.status === "in_progress" || s.status === "on_route"
      );

      // Determine real-time status
      const realTimeStatus =
        activeShipments && activeShipments.length > 0
          ? "not_available"
          : v.status;

      return {
        id: v.id,
        vehicle_id: v.vehicle_id,
        type: v.type,
        driver_name: v.driver_name,
        capacity: v.capacity,
        status: realTimeStatus,
        created_by: v.creator,
        created_at: v.created_at,
        updated_at: v.updated_at,
      };
    });

    res.json({
      success: true,
      count: vehicles.length,
      vehicles: vehiclesWithStatus,
    });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vehicles",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   GET /api/vehicles/:id
// @desc    Get single vehicle by ID
// @access  Private
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "username", "name", "email"],
        },
        {
          model: Shipment,
          as: "shipments",
          attributes: ["id", "tracking_number", "status"],
          required: false,
        },
      ],
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // Calculate real-time vehicle status based on active shipments
    const activeShipments = vehicle.shipments?.filter(
      (s) => s.status === "in_progress" || s.status === "on_route"
    );

    // Determine real-time status
    const realTimeStatus =
      activeShipments && activeShipments.length > 0
        ? "not_available"
        : vehicle.status;

    res.json({
      success: true,
      vehicle: {
        id: vehicle.id,
        vehicle_id: vehicle.vehicle_id,
        type: vehicle.type,
        driver_name: vehicle.driver_name,
        capacity: vehicle.capacity,
        status: realTimeStatus,
        created_by: vehicle.creator,
        created_at: vehicle.created_at,
        updated_at: vehicle.updated_at,
      },
    });
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vehicle",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   PUT /api/vehicles/:id
// @desc    Update a vehicle
// @access  Private
router.put(
  "/:id",
  [authenticateToken, ...validateVehicle],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { vehicle_id, type, driver_name, capacity, status } = req.body;

      const vehicle = await Vehicle.findByPk(req.params.id);

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: "Vehicle not found",
        });
      }

      // Check if another vehicle already exists with this ID
      if (vehicle_id !== vehicle.vehicle_id) {
        const existingVehicle = await Vehicle.findOne({
          where: { vehicle_id },
        });

        if (existingVehicle) {
          return res.status(400).json({
            success: false,
            message: "Vehicle with this ID already exists",
          });
        }
      }

      // Update vehicle
      vehicle.vehicle_id = vehicle_id;
      vehicle.type = type;
      vehicle.driver_name = driver_name || null;
      vehicle.capacity = capacity;
      vehicle.status = status || "available";

      await vehicle.save();

      // Reload with associations
      await vehicle.reload({
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["id", "username", "name", "email"],
          },
        ],
      });

      res.json({
        success: true,
        vehicle: {
          id: vehicle.id,
          vehicle_id: vehicle.vehicle_id,
          type: vehicle.type,
          driver_name: vehicle.driver_name,
          capacity: vehicle.capacity,
          status: vehicle.status,
          created_by: vehicle.creator,
          created_at: vehicle.created_at,
          updated_at: vehicle.updated_at,
        },
      });
    } catch (error) {
      console.error("Error updating vehicle:", error);
      res.status(500).json({
        success: false,
        message: "Error updating vehicle",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   DELETE /api/vehicles/:id
// @desc    Delete a vehicle
// @access  Private (Admin only)
router.delete(
  "/:id",
  [authenticateToken, requireRole(["admin", "superadmin"])],
  async (req, res) => {
    try {
      const vehicle = await Vehicle.findByPk(req.params.id);

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: "Vehicle not found",
        });
      }

      await vehicle.destroy();

      res.json({
        success: true,
        message: "Vehicle deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting vehicle",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

module.exports = router;
