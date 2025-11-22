const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { testConnection } = require("./config/database");
const models = require("./models");
const {
  scheduleShipmentStatusUpdates,
} = require("./jobs/shipmentStatusUpdater");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Test database connection
testConnection();

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/shipments", require("./routes/shipments"));

app.use("/api/vehicles", require("./routes/vehicles"));
app.use("/api/users", require("./routes/users"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/products", require("./routes/products")); // Products management
app.use(
  "/api/provincial-connections",
  require("./routes/provincialConnections").router
);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "ShipSmart API is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 ShipSmart Backend Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📅 Server started at: ${new Date().toISOString()}`);

  // Schedule shipment status updates
  scheduleShipmentStatusUpdates();

  // Show available routes
  console.log("\n📋 Available API Routes:");
  console.log("   GET  /                           - API status");
  console.log("   POST /api/auth/register          - Register user");
  console.log("   POST /api/auth/login             - Login user");
  console.log("   GET  /api/auth/me                - Get current user");
  console.log("   PUT  /api/auth/profile           - Update user profile");
  console.log("   GET  /api/shipments              - Get all shipments");
  console.log("   GET  /api/shipments/:id          - Get shipment by ID");
  console.log("   POST /api/shipments              - Create new shipment");
  console.log("   PUT  /api/shipments/:id/status   - Update shipment status");
  console.log(
    "   GET  /api/shipments/stats/overview - Get shipment statistics"
  );
  console.log(
    "   GET  /api/users                  - Get all users (Admin only)"
  );
  console.log(
    "   GET  /api/users/:id              - Get user by ID (Admin only)"
  );
  console.log(
    "   POST /api/users                  - Create new user (Admin only)"
  );
  console.log("   PUT  /api/users/:id              - Update user (Admin only)");
  console.log("   DELETE /api/users/:id            - Delete user (Admin only)");
  console.log(
    "   GET  /api/provincial-connections - Get provincial road connections"
  );
  console.log(
    "   GET  /api/provincial-connections/:province - Get neighbors for a province"
  );
  console.log(
    "   GET  /api/provincial-connections/check-route/:from/:to - Check route between provinces"
  );
  console.log(
    "   GET  /api/provincial-connections/find-routes/:from/:to - Find all routes between provinces"
  );
  console.log(
    "   GET  /api/provincial-connections/shortest-route/:from/:to - Find shortest route between provinces"
  );
});

module.exports = app;
