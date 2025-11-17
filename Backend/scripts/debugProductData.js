const { sequelize } = require("../config/database");
const { Product, Shipment } = require("../models");

async function debugProductData() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Get a few products to check their data
    const products = await Product.findAll({
      limit: 5,
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

    console.log("\n=== Product Data Debug ===");
    products.forEach((product, index) => {
      console.log(`\nProduct ${index + 1}:`);
      console.log(`  ID: ${product.id}`);
      console.log(`  Name: ${product.name}`);
      console.log(
        `  Shipment Tracking Number: ${product.shipment_tracking_number}`
      );
      console.log(
        `  Shipment Data:`,
        product.shipment
          ? {
              tracking_number: product.shipment.tracking_number,
              from_province: product.shipment.from_province,
              to_province: product.shipment.to_province,
              status: product.shipment.status,
            }
          : "null"
      );
    });

    // Get all shipments to see what options should be available
    const shipments = await Shipment.findAll({
      attributes: ["id", "tracking_number", "from_province", "to_province"],
    });

    console.log("\n=== Available Shipments ===");
    console.log(`Total shipments: ${shipments.length}`);
    shipments.slice(0, 10).forEach((shipment, index) => {
      console.log(
        `  ${index + 1}. ${shipment.tracking_number} - ${
          shipment.from_province
        } → ${shipment.to_province}`
      );
    });

    if (shipments.length > 10) {
      console.log(`  ... and ${shipments.length - 10} more`);
    }

    await sequelize.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    await sequelize.close();
    process.exit(1);
  }
}

debugProductData();
