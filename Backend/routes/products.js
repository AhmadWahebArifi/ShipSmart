const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const authenticateToken = require("../middleware/auth");
const { requireRole } = require("../middleware/rolePermission");
const { Product, Shipment, User } = require("../models");
const { logAudit } = require("../utils/auditLogger");

// Validation middleware
const validateProduct = [
  check("name", "Product name is required").not().isEmpty().trim(),
  check("quantity", "Quantity must be at least 1").isInt({ min: 1 }),
  check("weight", "Weight is required and must be greater than 0").isFloat({
    min: 0.01,
  }),
  check("price", "Price is required and must be 0 or greater").isFloat({
    min: 0,
  }),
  check("shipment_tracking_number", "Shipment tracking number is required")
    .not()
    .isEmpty(),
];

// @route   POST /api/products
// @desc    Create a new product
// @access  Private
router.post("/", [authenticateToken, ...validateProduct], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      description,
      quantity,
      weight,
      price,
      shipment_tracking_number,
      sender,
      sender_phone,
      sender_email,
      sender_address,
      receiver,
      // Add new receiver fields
      receiver_name,
      receiver_phone,
      receiver_email,
      receiver_address,
      discount,
      remaining,
    } = req.body;

    // Check if shipment exists
    const shipment = await Shipment.findOne({
      where: { tracking_number: shipment_tracking_number },
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    // Check if shipment status allows adding products
    if (
      shipment.status === "delivered" ||
      shipment.status === "canceled" ||
      shipment.status === "on_route"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot add products to a shipment that is delivered, canceled, or on route",
      });
    }

    // Create product
    const product = await Product.create({
      name,
      description: description || null,
      quantity,
      weight,
      price,
      shipment_tracking_number,
      created_by: req.user.userId,
      sender: sender || null,
      sender_phone: sender_phone || null,
      sender_email: sender_email || null,
      sender_address: sender_address || null,
      discount: discount || null,
      remaining: remaining || null,
      // Remove old receiver field
      // receiver: receiver || null,
      // Add new receiver fields
      receiver_name: receiver_name || null,
      receiver_phone: receiver_phone || null,
      receiver_email: receiver_email || null,
      receiver_address: receiver_address || null,
    });

    // Log successful product creation
    await logAudit(req, {
      actor_user_id: req.user.userId,
      actor_role: req.user.role,
      action: "product.create",
      entity_type: "Product",
      entity_id: product.id.toString(),
      success: true,
      message: `Product "${name}" created`,
      metadata: { name, quantity, weight, price, shipment_tracking_number }
    });

    // Reload with associations
    await product.reload({
      include: [
        {
          model: Shipment,
          as: "shipment",
          attributes: [
            "tracking_number",
            "from_province",
            "to_province",
            "status",
          ],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "username", "name", "email"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        quantity: product.quantity,
        weight: product.weight,
        price: product.price,
        shipment_tracking_number: product.shipment_tracking_number,
        shipment: product.shipment,
        created_by: product.creator,
        // Add sender fields
        sender: product.sender,
        sender_phone: product.sender_phone,
        sender_email: product.sender_email,
        sender_address: product.sender_address,
        // Add receiver fields
        receiver_name: product.receiver_name,
        receiver_phone: product.receiver_phone,
        receiver_email: product.receiver_email,
        receiver_address: product.receiver_address,
        // Add discount and remaining fields
        discount: product.discount,
        remaining: product.remaining,
        created_at: product.created_at,
        updated_at: product.updated_at,
      },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   GET /api/products
// @desc    Get all products (with optional filters)
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

    const { shipment_tracking_number } = req.query;
    const whereClause = {};

    if (shipment_tracking_number) {
      whereClause.shipment_tracking_number = shipment_tracking_number;
    }

    // Build include options
    const includeOptions = [
      {
        model: Shipment,
        as: "shipment",
        attributes: [
          "tracking_number",
          "from_province",
          "to_province",
          "status",
        ],
      },
      {
        model: User,
        as: "creator",
        attributes: ["id", "username", "name", "email"],
      },
    ];

    // For non-admin users, filter products based on their branch
    let shipmentWhereClause = {};
    if (user.role !== "superadmin" && user.role !== "admin") {
      if (user.branch) {
        const userProvince = user.branch.replace(" Branch", "");
        shipmentWhereClause = {
          [require("sequelize").Op.or]: [
            { from_province: userProvince },
            { to_province: userProvince },
          ],
        };
        // Add shipment filter to include options
        includeOptions[0].where = shipmentWhereClause;
      }
    }

    const products = await Product.findAll({
      where: whereClause,
      include: includeOptions,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      count: products.length,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        quantity: p.quantity,
        weight: p.weight,
        price: p.price,
        shipment_tracking_number: p.shipment_tracking_number,
        shipment: p.shipment,
        created_by: p.creator,
        // Add sender fields
        sender: p.sender,
        sender_phone: p.sender_phone,
        sender_email: p.sender_email,
        sender_address: p.sender_address,
        // Add receiver fields
        receiver_name: p.receiver_name,
        receiver_phone: p.receiver_phone,
        receiver_email: p.receiver_email,
        receiver_address: p.receiver_address,
        // Add discount and remaining fields
        discount: p.discount,
        remaining: p.remaining,
        created_at: p.created_at,
        updated_at: p.updated_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
      sqlMessage: error.original?.sqlMessage,
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
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

    // Build include options
    const includeOptions = [
      {
        model: Shipment,
        as: "shipment",
        attributes: [
          "tracking_number",
          "from_province",
          "to_province",
          "status",
        ],
      },
      {
        model: User,
        as: "creator",
        attributes: ["id", "username", "name", "email"],
      },
    ];

    // For non-admin users, filter products based on their branch
    let shipmentWhereClause = {};
    if (user.role !== "superadmin" && user.role !== "admin") {
      if (user.branch) {
        const userProvince = user.branch.replace(" Branch", "");
        shipmentWhereClause = {
          [require("sequelize").Op.or]: [
            { from_province: userProvince },
            { to_province: userProvince },
          ],
        };
        // Add shipment filter to include options
        includeOptions[0].where = shipmentWhereClause;
      }
    }

    const product = await Product.findByPk(req.params.id, {
      include: includeOptions,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Additional check for non-admin users to ensure they can access this product
    if (user.role !== "superadmin" && user.role !== "admin") {
      if (user.branch) {
        const userProvince = user.branch.replace(" Branch", "");
        const shipment = product.shipment;
        if (shipment) {
          // Check if user's branch matches either the from_province or to_province
          if (
            shipment.from_province !== userProvince &&
            shipment.to_province !== userProvince
          ) {
            return res.status(403).json({
              success: false,
              message: "You don't have permission to access this product",
            });
          }
        }
      }
    }

    res.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        quantity: product.quantity,
        weight: product.weight,
        price: product.price,
        shipment_tracking_number: product.shipment_tracking_number,
        shipment: product.shipment,
        created_by: product.creator,
        // Add sender fields
        sender: product.sender,
        sender_phone: product.sender_phone,
        sender_email: product.sender_email,
        sender_address: product.sender_address,
        // Add receiver fields
        receiver_name: product.receiver_name,
        receiver_phone: product.receiver_phone,
        receiver_email: product.receiver_email,
        receiver_address: product.receiver_address,
        // Add discount and remaining fields
        discount: product.discount,
        remaining: product.remaining,
        created_at: product.created_at,
        updated_at: product.updated_at,
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private
router.put(
  "/:id",
  [authenticateToken, ...validateProduct],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        name,
        description,
        quantity,
        weight,
        price,
        shipment_tracking_number,
        sender,
        sender_phone,
        sender_email,
        sender_address,
        receiver,
        // Add new receiver fields
        receiver_name,
        receiver_phone,
        receiver_email,
        receiver_address,
        discount,
        remaining,
      } = req.body;

      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Check if shipment exists if it's being updated
      if (
        shipment_tracking_number &&
        shipment_tracking_number !== product.shipment_tracking_number
      ) {
        const shipment = await Shipment.findOne({
          where: { tracking_number: shipment_tracking_number },
        });

        if (!shipment) {
          return res.status(404).json({
            success: false,
            message: "Shipment not found",
          });
        }

        // Check if shipment status allows adding products
        if (
          shipment.status === "delivered" ||
          shipment.status === "canceled" ||
          shipment.status === "on_route"
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Cannot add products to a shipment that is delivered, canceled, or on route",
          });
        }
      }

      // Update product
      product.name = name;
      if (description !== undefined) product.description = description;
      product.quantity = quantity;
      product.weight = weight;
      product.price = price;
      if (shipment_tracking_number) {
        product.shipment_tracking_number = shipment_tracking_number;
      }
      if (sender !== undefined) product.sender = sender;
      if (sender_phone !== undefined) product.sender_phone = sender_phone;
      if (sender_email !== undefined) product.sender_email = sender_email;
      if (sender_address !== undefined) product.sender_address = sender_address;
      if (discount !== undefined) product.discount = discount;
      if (remaining !== undefined) product.remaining = remaining;
      // Remove old receiver field
      // if (receiver !== undefined) product.receiver = receiver;
      // Add new receiver fields
      if (receiver_name !== undefined) product.receiver_name = receiver_name;
      if (receiver_phone !== undefined) product.receiver_phone = receiver_phone;
      if (receiver_email !== undefined) product.receiver_email = receiver_email;
      if (receiver_address !== undefined)
        product.receiver_address = receiver_address;

      await product.save();

      // Log successful product update
      await logAudit(req, {
        actor_user_id: req.user.userId,
        actor_role: req.user.role,
        action: "product.update",
        entity_type: "Product",
        entity_id: product.id.toString(),
        success: true,
        message: `Product "${name}" updated`,
        metadata: { name, quantity, weight, price, shipment_tracking_number }
      });

      // Reload with associations
      await product.reload({
        include: [
          {
            model: Shipment,
            as: "shipment",
            attributes: [
              "tracking_number",
              "from_province",
              "to_province",
              "status",
            ],
          },
          {
            model: User,
            as: "creator",
            attributes: ["id", "username", "name", "email"],
          },
        ],
      });

      res.json({
        success: true,
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          quantity: product.quantity,
          weight: product.weight,
          price: product.price,
          shipment_tracking_number: product.shipment_tracking_number,
          shipment: product.shipment,
          created_by: product.creator,
          // Add sender fields
          sender: product.sender,
          sender_phone: product.sender_phone,
          sender_email: product.sender_email,
          sender_address: product.sender_address,
          // Add receiver fields
          receiver_name: product.receiver_name,
          receiver_phone: product.receiver_phone,
          receiver_email: product.receiver_email,
          receiver_address: product.receiver_address,
          // Add discount and remaining fields
          discount: product.discount,
          remaining: product.remaining,
          created_at: product.created_at,
          updated_at: product.updated_at,
        },
      });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({
        success: false,
        message: "Error updating product",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (Admin only)
router.delete(
  "/:id",
  [authenticateToken, requireRole(["admin", "superadmin"])],
  async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      await product.destroy();

      // Log successful product deletion
      await logAudit(req, {
        actor_user_id: req.user.userId,
        actor_role: req.user.role,
        action: "product.delete",
        entity_type: "Product",
        entity_id: product.id.toString(),
        success: true,
        message: `Product "${product.name}" deleted`,
        metadata: { name: product.name, shipment_tracking_number: product.shipment_tracking_number }
      });

      res.json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting product",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

module.exports = router;
