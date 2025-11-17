const { sequelize } = require("../config/database");

async function checkForeignKeyConstraints() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Check the actual foreign key constraints in the database
    console.log("\n=== Actual Foreign Key Constraints in Database ===");
    const constraints = await sequelize.query(
      `
      SELECT 
        rc.CONSTRAINT_NAME,
        rc.TABLE_NAME,
        kcu.COLUMN_NAME,
        rc.REFERENCED_TABLE_NAME,
        kcu.REFERENCED_COLUMN_NAME,
        rc.UPDATE_RULE,
        rc.DELETE_RULE
      FROM
        INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
      JOIN
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
      ON
        rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
      WHERE
        rc.CONSTRAINT_SCHEMA = 'shipsmart_db'
        AND rc.TABLE_NAME = 'shipments'
    `,
      { type: sequelize.QueryTypes.SELECT }
    );

    constraints.forEach((constraint) => {
      console.log(`Constraint: ${constraint.CONSTRAINT_NAME}`);
      console.log(
        `  Table: ${constraint.TABLE_NAME}.${constraint.COLUMN_NAME}`
      );
      console.log(
        `  References: ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}`
      );
      console.log(`  On Update: ${constraint.UPDATE_RULE}`);
      console.log(`  On Delete: ${constraint.DELETE_RULE}`);
      console.log("");
    });

    // Check if there are any users
    console.log("=== Users in Database ===");
    const [users] = await sequelize.query(
      `
      SELECT id, username, role FROM users
    `,
      { type: sequelize.QueryTypes.SELECT }
    );

    if (users.length > 0) {
      console.log(`Found ${users.length} users:`);
      users.forEach((user) => {
        console.log(
          `  - ID: ${user.id}, Username: ${user.username}, Role: ${user.role}`
        );
      });
    } else {
      console.log("No users found in database");
    }

    // Check if there are any shipments
    console.log("\n=== Shipments in Database ===");
    const [shipments] = await sequelize.query(
      `
      SELECT id, tracking_number, sender_id, receiver_id FROM shipments
    `,
      { type: sequelize.QueryTypes.SELECT }
    );

    if (shipments.length > 0) {
      console.log(`Found ${shipments.length} shipments:`);
      shipments.forEach((shipment) => {
        console.log(
          `  - ID: ${shipment.id}, Tracking: ${shipment.tracking_number}, Sender ID: ${shipment.sender_id}, Receiver ID: ${shipment.receiver_id}`
        );
      });
    } else {
      console.log("No shipments found in database");
    }

    await sequelize.close();
  } catch (error) {
    console.error("❌ Error checking constraints:", error.message);
    if (error.parent) {
      console.error("Database error details:", error.parent.message);
    }
    await sequelize.close();
    process.exit(1);
  }
}

checkForeignKeyConstraints();
