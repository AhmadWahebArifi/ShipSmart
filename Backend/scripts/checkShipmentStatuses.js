const { sequelize } = require("../config/database");
const { Shipment } = require("../models");

async function checkShipmentStatuses() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Get all shipments and their statuses
    const shipments = await Shipment.findAll({
      attributes: [
        "id",
        "tracking_number",
        "status",
        "from_province",
        "to_province",
      ],
    });

    console.log("\n=== All Shipments and Their Statuses ===");
    shipments.forEach((shipment) => {
      console.log(`Shipment ID: ${shipment.id}`);
      console.log(`  Tracking Number: ${shipment.tracking_number}`);
      console.log(`  From: ${shipment.from_province}`);
      console.log(`  To: ${shipment.to_province}`);
      console.log(`  Status: ${shipment.status}`);
      console.log("");
    });

    // Count shipments by status
    console.log("=== Shipment Status Summary ===");
    const statusCounts = {};
    shipments.forEach((shipment) => {
      statusCounts[shipment.status] = (statusCounts[shipment.status] || 0) + 1;
    });

    Object.keys(statusCounts).forEach((status) => {
      console.log(`${status}: ${statusCounts[status]} shipments`);
    });

    await sequelize.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    await sequelize.close();
    process.exit(1);
  }
}

checkShipmentStatuses();
