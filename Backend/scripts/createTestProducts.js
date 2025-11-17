const { sequelize } = require("../config/database");
const { Product, Shipment, User } = require("../models");

async function createTestProducts() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Get the first user (admin) to use as creator
    const user = await User.findOne();
    if (!user) {
      console.log("❌ No users found in database");
      await sequelize.close();
      return;
    }

    console.log(`Using user: ${user.username} (ID: ${user.id}) as creator`);

    // Get all shipments to associate products with
    const shipments = await Shipment.findAll();
    if (shipments.length === 0) {
      console.log("❌ No shipments found in database");
      await sequelize.close();
      return;
    }

    console.log(`Found ${shipments.length} shipments`);

    // Create test products for each shipment
    console.log("\n=== Creating Test Products ===");
    for (let i = 0; i < shipments.length && i < 6; i++) {
      const shipment = shipments[i];
      const productData = {
        name: `Test Product ${i + 1}`,
        description: `Test product for shipment ${shipment.tracking_number}`,
        quantity: Math.floor(Math.random() * 10) + 1,
        weight: (Math.random() * 50 + 1).toFixed(2),
        price: (Math.random() * 1000 + 10).toFixed(2),
        shipment_tracking_number: shipment.tracking_number,
        created_by: user.id,
      };

      try {
        const product = await Product.create(productData);
        console.log(
          `✅ Created product "${product.name}" for shipment ${shipment.tracking_number} (Status: ${shipment.status})`
        );
      } catch (error) {
        console.error(
          `❌ Failed to create product for shipment ${shipment.tracking_number}:`,
          error.message
        );
      }
    }

    // Verify all products and their shipment statuses
    console.log("\n=== All Products With Shipment Statuses ===");
    const products = await Product.findAll({
      include: [
        {
          model: Shipment,
          as: "shipment",
          attributes: ["tracking_number", "status"],
        },
      ],
    });

    products.forEach((product) => {
      const shipmentStatus = product.shipment
        ? product.shipment.status
        : "unknown";
      console.log(
        `Product: ${product.name} - Shipment: ${product.shipment_tracking_number} - Status: ${shipmentStatus}`
      );
    });

    await sequelize.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    await sequelize.close();
    process.exit(1);
  }
}

createTestProducts();
