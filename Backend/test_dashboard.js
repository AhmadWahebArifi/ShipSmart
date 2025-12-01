const express = require("express");
const { Shipment, User } = require("./models");
const { Sequelize } = require("sequelize");

// Simulate the dashboard stats endpoint
async function testDashboardStats(userId) {
  try {
    console.log("Testing dashboard stats endpoint...");

    // Simulate user lookup
    const user = await User.findByPk(userId);
    if (!user) {
      console.log("User not found for ID:", userId);
      return;
    }

    console.log(
      "User found:",
      user.name || user.username,
      "Role:",
      user.role,
      "Province:",
      user.province
    );

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

    console.log("Today:", today.toISOString());
    console.log("Tomorrow:", tomorrow.toISOString());

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
      totalShipments,
      statusStats: statusCounts,
      deliveredToday,
    };

    console.log("Final result:", result);

    return result;
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

// Test with different user IDs
async function runTests() {
  try {
    // Get all users first
    const users = await User.findAll({
      attributes: ["id", "username", "name", "role", "province"],
    });

    console.log("Available users:");
    users.forEach((u) => {
      console.log(
        `  ID: ${u.id}, Name: ${u.name || u.username}, Role: ${
          u.role
        }, Province: ${u.province}`
      );
    });
    console.log("\n");

    // Test with first user
    if (users.length > 0) {
      await testDashboardStats(users[0].id);
    }

    process.exit(0);
  } catch (error) {
    console.error("Test error:", error.message);
    process.exit(1);
  }
}

runTests();
