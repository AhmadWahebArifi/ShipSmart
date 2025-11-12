const { sequelize } = require("../config/database");
const { User, Shipment } = require("../models");
const dotenv = require("dotenv");

dotenv.config();

async function createSampleShipments() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Sync models (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log("✅ Database models synchronized");

    // Find users for testing
    const adminUser = await User.findOne({ where: { role: "admin" } });
    const superAdminUser = await User.findOne({
      where: { role: "superadmin" },
    });
    const branchUser = await User.findOne({ where: { role: "user" } });

    if (!adminUser || !superAdminUser || !branchUser) {
      console.log(
        '❌ Required users not found. Please run "npm run create-role-users" first.'
      );
      await sequelize.close();
      return;
    }

    console.log(`\n📋 Using users for testing:`);
    console.log(`   Admin: ${adminUser.username} (${adminUser.branch})`);
    console.log(
      `   SuperAdmin: ${superAdminUser.username} (${superAdminUser.branch})`
    );
    console.log(
      `   Branch User: ${branchUser.username} (${branchUser.branch})`
    );

    // Create sample shipments
    const sampleShipments = [
      {
        from_province: "Kabul",
        to_province: "Herat",
        description: "Electronics equipment",
        sender_id: adminUser.id,
        status: "pending",
      },
      {
        from_province: "Herat",
        to_province: "Kandahar",
        description: "Medical supplies",
        sender_id: branchUser.id,
        status: "in_progress",
      },
      {
        from_province: "Kandahar",
        to_province: "Kabul",
        description: "Food supplies",
        sender_id: superAdminUser.id,
        status: "delivered",
      },
    ];

    console.log("\n📦 Creating sample shipments...");

    for (const shipmentData of sampleShipments) {
      // Check if shipment already exists
      const existingShipment = await Shipment.findOne({
        where: {
          from_province: shipmentData.from_province,
          to_province: shipmentData.to_province,
          description: shipmentData.description,
        },
      });

      if (!existingShipment) {
        const shipment = await Shipment.create(shipmentData);
        console.log(
          `✅ Created shipment: ${shipment.from_province} → ${shipment.to_province} (${shipment.status})`
        );
      } else {
        console.log(
          `ℹ️  Shipment already exists: ${existingShipment.from_province} → ${existingShipment.to_province}`
        );
      }
    }

    console.log("\n✅ Sample shipments created successfully!");
    console.log("\n📋 Role-based permissions summary:");
    console.log("   🔴 SuperAdmin: Can do everything");
    console.log("   🟠 Admin: Can manage all shipments and users");
    console.log("   🟢 User (Branch):");
    console.log("      - Can only change status of shipments for their branch");
    console.log("      - Can send products to other branches");
    console.log("      - Can only view their own shipments");

    await sequelize.close();
  } catch (error) {
    console.error("❌ Error creating sample shipments:", error.message);
    console.error("Error name:", error.name);

    if (error.name === "SequelizeConnectionError") {
      console.log(
        "\n💡 Tip: Make sure MySQL is running and your database credentials are correct in .env file."
      );
    } else if (error.name === "SequelizeValidationError") {
      console.log(
        "\n💡 Tip: Validation error - check the data being inserted."
      );
    }

    await sequelize.close();
    process.exit(1);
  }
}

createSampleShipments();
