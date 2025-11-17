const { sequelize } = require("../config/database");

async function fixShipmentStatusEnum() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Check current ENUM values
    console.log("\n=== Current Shipment Status ENUM Values ===");
    const [results] = await sequelize.query(`
      SHOW CREATE TABLE shipments
    `);

    const createTableStatement = results[0]["Create Table"];
    console.log("Current table definition:");
    console.log(createTableStatement);

    // Look for the status column definition
    const statusColumnMatch = createTableStatement.match(
      /status\s+enum\([^)]+\)/i
    );
    if (statusColumnMatch) {
      console.log("\nCurrent status column definition:");
      console.log(statusColumnMatch[0]);
    }

    // Fix the ENUM values by modifying the column
    console.log("\n=== Updating Shipment Status ENUM Values ===");
    await sequelize.query(`
      ALTER TABLE shipments 
      MODIFY COLUMN status ENUM('pending', 'in_progress', 'on_route', 'delivered', 'canceled') 
      DEFAULT 'pending' 
      NOT NULL
    `);

    console.log("✅ Shipment status ENUM values updated successfully");

    // Verify the update
    console.log("\n=== Verifying Update ===");
    const [verifyResults] = await sequelize.query(`
      SHOW CREATE TABLE shipments
    `);

    const updatedCreateTableStatement = verifyResults[0]["Create Table"];
    const updatedStatusColumnMatch = updatedCreateTableStatement.match(
      /status\s+enum\([^)]+\)/i
    );
    if (updatedStatusColumnMatch) {
      console.log("Updated status column definition:");
      console.log(updatedStatusColumnMatch[0]);
    }

    // Update any shipments with empty status to 'pending'
    console.log("\n=== Fixing Empty Status Values ===");
    const [updateResult] = await sequelize.query(`
      UPDATE shipments 
      SET status = 'pending' 
      WHERE status = '' OR status IS NULL
    `);

    console.log(
      `✅ Fixed ${updateResult.affectedRows} shipments with empty status values`
    );

    await sequelize.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.parent) {
      console.error("Database error details:", error.parent.message);
    }
    await sequelize.close();
    process.exit(1);
  }
}

fixShipmentStatusEnum();
