const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const authenticateToken = require("../middleware/auth");
const { requireRole } = require("../middleware/rolePermission");
const { Product, Shipment, User } = require("../models");

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

    // Create product
    const product = await Product.create({
      name,
      description: description || null,
      quantity,
      weight,
      price,
      shipment_tracking_number,
      created_by: req.user.userId,
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
        created_at: product.created_at,
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
    const { shipment_tracking_number } = req.query;
    const whereClause = {};

    if (shipment_tracking_number) {
      whereClause.shipment_tracking_number = shipment_tracking_number;
    }

    const products = await Product.findAll({
      where: whereClause,
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
      order: [["created_at", "DESC"]],
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
        created_at: p.created_at,
        updated_at: p.updated_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Private
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
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

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
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

      await product.save();

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
