const dotenv = require("dotenv");
const { sequelize } = require("../config/database");
const { Product, Shipment, User } = require("../models");

dotenv.config();

async function debugFetchProducts() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Try to reproduce the same query shape as GET /api/products
    const products = await Product.findAll({
      include: [
        {
          model: Shipment,
          as: "shipment",
          attributes: ["tracking_number", "from_province", "to_province", "status"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "username", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    console.log(`✅ Query succeeded. Returned ${products.length} products`);
    if (products[0]) {
      console.log("Sample product:");
      console.log({
        id: products[0].id,
        name: products[0].name,
        shipment_tracking_number: products[0].shipment_tracking_number,
        shipment: products[0].shipment?.tracking_number,
        creator: products[0].creator?.username,
      });
    }

    await sequelize.close();
  } catch (error) {
    console.error("❌ Query failed:", error.message);
    if (error.original?.sqlMessage) {
      console.error("SQL message:", error.original.sqlMessage);
    }
    if (error.original?.sql) {
      console.error("SQL:", error.original.sql);
    }
    try {
      await sequelize.close();
    } catch (_) {
      // ignore
    }
    process.exit(1);
  }
}

debugFetchProducts();
