const express = require("express");
const jwt = require("jsonwebtoken");
const { User, Shipment } = require("./models");

// JWT Secret (same as in auth.js)
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_here";

async function testAPIWithAuth() {
  try {
    console.log("Testing API with authentication...");

    // Find a user to test with
    const user = await User.findOne({ where: { id: 1 } });
    if (!user) {
      console.log("No user found with ID 1");
      return;
    }

    console.log("Testing with user:", user.name || user.username);

    // Create a JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Generated JWT token:", token.substring(0, 50) + "...");

    // Test the stats endpoint logic directly
    const { Sequelize } = require("sequelize");

    let whereClause = {};

    // Apply visibility rules based on user role
    if (user.role === "branch") {
      whereClause = {
        [Sequelize.Op.or]: [
          { sender_id: user.id },
          { "$sender.province$": user.province },
        ],
      };
      console.log("Applied branch visibility rules");
    }

    console.log("Where clause:", JSON.stringify(whereClause, null, 2));

    // Get total shipments
    const totalShipments = await Shipment.count({ where: whereClause });
    console.log("Total shipments:", totalShipments);

    // Get status statistics
    const statusStats = await Shipment.findAll({
      attributes: [
        "status",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      where: whereClause,
      group: ["status"],
      raw: true,
    });

    console.log("Raw status stats:", statusStats);

    const statusCounts = {
      pending: 0,
      in_progress: 0,
      on_route: 0,
      delivered: 0,
      canceled: 0,
    };

    statusStats.forEach((stat) => {
      statusCounts[stat.status] = parseInt(stat.count);
    });

    console.log("Status counts:", statusCounts);

    // Get deliveries today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const deliveredToday = await Shipment.count({
      where: {
        ...whereClause,
        status: "delivered",
        delivered_at: {
          [Sequelize.Op.gte]: today,
          [Sequelize.Op.lt]: tomorrow,
        },
      },
    });

    console.log("Delivered today:", deliveredToday);

    const result = {
      success: true,
      stats: {
        totalShipments,
        statusStats: statusCounts,
        deliveredToday,
      },
    };

    console.log("Final API response:", JSON.stringify(result, null, 2));

    return { token, result };
  } catch (error) {
    console.error("Test error:", error.message);
    throw error;
  }
}

testAPIWithAuth()
  .then(({ token, result }) => {
    console.log("\nTest completed successfully!");
    console.log("Use this token to test API calls:", token);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test failed:", error.message);
    process.exit(1);
  });
