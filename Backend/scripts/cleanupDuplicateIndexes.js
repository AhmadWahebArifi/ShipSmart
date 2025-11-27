const { sequelize } = require("../config/database");

async function cleanupDuplicateIndexes() {
  try {
    console.log("🧹 Cleaning up duplicate indexes on vehicles table...");

    // Get all indexes on the vehicles table
    const [indexes] = await sequelize.query("SHOW INDEX FROM vehicles");

    // Find duplicate vehicle_id indexes (keep only the first one)
    const vehicleIdIndexes = indexes.filter(
      (idx) => idx.Column_name === "vehicle_id"
    );
    const duplicateIndexes = vehicleIdIndexes.slice(1); // Keep the first, remove the rest

    console.log(
      `Found ${duplicateIndexes.length} duplicate vehicle_id indexes to remove`
    );

    // Remove duplicate indexes
    for (const index of duplicateIndexes) {
      const dropQuery = `ALTER TABLE vehicles DROP INDEX \`${index.Key_name}\``;
      console.log(`Dropping index: ${index.Key_name}`);
      await sequelize.query(dropQuery);
    }

    console.log("✅ Duplicate indexes cleaned up successfully");

    // Verify the cleanup
    const [remainingIndexes] = await sequelize.query(
      "SHOW INDEX FROM vehicles"
    );
    console.log(`Remaining indexes: ${remainingIndexes.length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error cleaning up indexes:", error.message);
    process.exit(1);
  }
}

cleanupDuplicateIndexes();
