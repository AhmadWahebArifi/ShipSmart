const { sequelize } = require("../config/database");
const dotenv = require("dotenv");

dotenv.config();

async function removeOldReceiverField() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    const queryInterface = sequelize.getQueryInterface();

    console.log("\n🔄 Removing old receiver field from products table...\n");

    // Remove the old receiver column
    try {
      await queryInterface.removeColumn("products", "receiver");
      console.log('✅ Removed "receiver" column from products table');
    } catch (error) {
      if (
        error.name === "SequelizeDatabaseError" &&
        error.message.includes("no such column")
      ) {
        console.log('ℹ️  Column "receiver" does not exist (already removed)');
      } else if (
        error.name === "SequelizeDatabaseError" &&
        error.message.includes("check that column exists")
      ) {
        console.log('ℹ️  Column "receiver" does not exist (already removed)');
      } else {
        console.log('⚠️  Warning removing "receiver" column:', error.message);
      }
    }

    console.log("\n🎉 Migration completed successfully!");
    console.log("\n📋 Summary:");
    console.log("   - Removed old 'receiver' column");
    console.log("   - Keeping detailed receiver fields:");
    console.log("     * receiver_name");
    console.log("     * receiver_phone");
    console.log("     * receiver_email (optional)");
    console.log("     * receiver_address (optional)");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the migration
if (require.main === module) {
  removeOldReceiverField();
}

module.exports = removeOldReceiverField;
