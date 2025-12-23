const { Shipment, User } = require("./models");

async function checkShipments() {
  try {
    console.log("Checking shipments in database...");

    // Check total shipments
    const totalShipments = await Shipment.count();
    console.log("Total shipments:", totalShipments);

    if (totalShipments > 0) {
      // Get sample shipments
      const shipments = await Shipment.findAll({
        limit: 5,
        include: [
          {
            model: User,
            as: "sender",
            attributes: ["id", "username", "name", "role", "province"],
          },
        ],
      });

      console.log("\nSample shipments:");
      shipments.forEach((s) => {
        const data = s.toJSON();
        console.log(
          `ID: ${data.id}, Tracking: ${data.tracking_number}, Status: ${data.status}, From: ${data.from_province}, To: ${data.to_province}`
        );
        console.log(
          `  Sender: ${
            data.sender?.name || data.sender?.username || "Unknown"
          } (${data.sender?.role})`
        );
        console.log(
          `  Created: ${data.created_at}, Updated: ${data.updated_at}`
        );
        console.log("---");
      });

      // Check status distribution
      const statusStats = await Shipment.findAll({
        attributes: [
          "status",
          [
            require("sequelize").fn("COUNT", require("sequelize").col("id")),
            "count",
          ],
        ],
        group: ["status"],
        raw: true,
      });

      console.log("\nStatus distribution:");
      statusStats.forEach((stat) => {
        console.log(`${stat.status}: ${stat.count}`);
      });
    } else {
      console.log("No shipments found in database.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkShipments();
