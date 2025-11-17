const { sequelize } = require("../config/database");
const { User, Shipment } = require("../models");

async function diagnoseDatabase() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Check users table
    console.log("\n=== Users Table ===");
    const users = await User.findAll();
    console.log(`Found ${users.length} users:`);
    users.forEach((user) => {
      console.log(
        `  - ID: ${user.id}, Username: ${user.username}, Role: ${user.role}`
      );
    });

    // Check shipments table
    console.log("\n=== Shipments Table ===");
    const shipments = await Shipment.findAll({
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username"],
          required: false,
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "username"],
          required: false,
        },
      ],
    });

    console.log(`Found ${shipments.length} shipments:`);
    shipments.forEach((shipment) => {
      console.log(
        `  - ID: ${shipment.id}, Tracking: ${shipment.tracking_number}`
      );
      console.log(
        `    Sender ID: ${shipment.sender_id} (${
          shipment.sender ? shipment.sender.username : "NOT FOUND"
        })`
      );
      console.log(
        `    Receiver ID: ${shipment.receiver_id} (${
          shipment.receiver ? shipment.receiver.username : "NULL"
        })`
      );
      console.log(`    Status: ${shipment.status}`);
    });

    // Check for orphaned shipments (with invalid sender_id)
    console.log("\n=== Checking for Orphaned Shipments ===");
    const orphanedShipments = await sequelize.query(
      `
      SELECT s.id, s.tracking_number, s.sender_id
      FROM shipments s
      LEFT JOIN users u ON s.sender_id = u.id
      WHERE u.id IS NULL
    `,
      { type: sequelize.QueryTypes.SELECT }
    );

    if (orphanedShipments.length > 0) {
      console.log(`Found ${orphanedShipments.length} orphaned shipments:`);
      orphanedShipments.forEach((shipment) => {
        console.log(
          `  - ID: ${shipment.id}, Tracking: ${shipment.tracking_number}, Invalid Sender ID: ${shipment.sender_id}`
        );
      });
    } else {
      console.log("No orphaned shipments found.");
    }

    // Check foreign key constraints
    console.log("\n=== Foreign Key Constraints ===");
    const foreignKeys = await sequelize.query(
      `
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE
        REFERENCED_TABLE_SCHEMA = 'shipsmart_db'
        AND TABLE_NAME = 'shipments'
    `,
      { type: sequelize.QueryTypes.SELECT }
    );

    foreignKeys.forEach((fk) => {
      console.log(
        `  ${fk.TABLE_NAME}.${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME} (${fk.CONSTRAINT_NAME})`
      );
    });

    await sequelize.close();
  } catch (error) {
    console.error("❌ Error diagnosing database:", error.message);
    if (error.parent) {
      console.error("Database error details:", error.parent.message);
    }
    await sequelize.close();
    process.exit(1);
  }
}

diagnoseDatabase();
