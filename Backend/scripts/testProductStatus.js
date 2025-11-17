const { sequelize } = require("../config/database");
const { Product, Shipment } = require("../models");

async function testProductStatus() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Get all products with their shipment information
    const products = await Product.findAll({
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
      ],
    });

    console.log("\n=== Products with Shipment Status ===");
    products.forEach((product) => {
      console.log(`Product: ${product.name}`);
      console.log(`  Shipment: ${product.shipment_tracking_number}`);
      console.log(
        `  Status: ${product.shipment ? product.shipment.status : "N/A"}`
      );
      console.log(`  Status Color Logic:`);

      // Show what color would be applied based on status
      const status = product.shipment ? product.shipment.status : null;
      switch (status) {
        case "delivered":
          console.log(`    🟢 Green - Delivered`);
          break;
        case "canceled":
          console.log(`    🔴 Red - Canceled`);
          break;
        case "on_route":
          console.log(`    🔵 Blue - On Route`);
          break;
        case "in_progress":
          console.log(`    🟡 Yellow - In Progress`);
          break;
        case "pending":
          console.log(`    ⚪ Gray - Pending`);
          break;
        default:
          console.log(`    ⚪ Gray - Unknown Status`);
      }
      console.log("");
    });

    await sequelize.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    await sequelize.close();
    process.exit(1);
  }
}

testProductStatus();
