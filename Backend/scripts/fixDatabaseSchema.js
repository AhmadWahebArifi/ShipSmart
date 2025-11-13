const { sequelize } = require("../config/database");
const dotenv = require("dotenv");

dotenv.config();

async function fixDatabaseSchema() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Fix the shipments table schema
    console.log("🔧 Fixing shipments table schema...");

    // Check if the shipments table has the correct columns
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'shipments'
    `);

    console.log("📋 Current shipments table columns:");
    columns.forEach((col) => {
      console.log(
        `   - ${col.COLUMN_NAME} (${col.COLUMN_TYPE}, nullable: ${col.IS_NULLABLE})`
      );
    });

    // Add unique constraint for tracking_number if it doesn't exist
    try {
      await sequelize.query(`
        ALTER TABLE shipments 
        ADD CONSTRAINT IF NOT EXISTS unique_tracking_number UNIQUE (tracking_number)
      `);
      console.log("✅ Added unique constraint on tracking_number");
    } catch (error) {
      if (
        error.message.includes("Duplicate entry") ||
        error.message.includes("already exists")
      ) {
        console.log("ℹ️  Unique constraint on tracking_number already exists");
      } else {
        console.warn(
          "⚠️  Could not add unique constraint on tracking_number:",
          error.message
        );
      }
    }

    // Add missing indexes if they don't exist
    try {
      await sequelize.query(`
        ALTER TABLE shipments 
        ADD INDEX IF NOT EXISTS idx_shipments_sender_id (sender_id)
      `);
      console.log("✅ Added index on sender_id");
    } catch (error) {
      if (error.message.includes("Duplicate key name")) {
        console.log("ℹ️  Index on sender_id already exists");
      } else {
        console.warn("⚠️  Could not add index on sender_id:", error.message);
      }
    }

    try {
      await sequelize.query(`
        ALTER TABLE shipments 
        ADD INDEX IF NOT EXISTS idx_shipments_receiver_id (receiver_id)
      `);
      console.log("✅ Added index on receiver_id");
    } catch (error) {
      if (error.message.includes("Duplicate key name")) {
        console.log("ℹ️  Index on receiver_id already exists");
      } else {
        console.warn("⚠️  Could not add index on receiver_id:", error.message);
      }
    }

    try {
      await sequelize.query(`
        ALTER TABLE shipments 
        ADD INDEX IF NOT EXISTS idx_shipments_status (status)
      `);
      console.log("✅ Added index on status");
    } catch (error) {
      if (error.message.includes("Duplicate key name")) {
        console.log("ℹ️  Index on status already exists");
      } else {
        console.warn("⚠️  Could not add index on status:", error.message);
      }
    }

    try {
      await sequelize.query(`
        ALTER TABLE shipments 
        ADD INDEX IF NOT EXISTS idx_shipments_created_at (created_at)
      `);
      console.log("✅ Added index on created_at");
    } catch (error) {
      if (error.message.includes("Duplicate key name")) {
        console.log("ℹ️  Index on created_at already exists");
      } else {
        console.warn("⚠️  Could not add index on created_at:", error.message);
      }
    }

    // Fix users table
    console.log("\n🔧 Fixing users table schema...");

    // Add unique constraints for username and email if they don't exist
    try {
      await sequelize.query(`
        ALTER TABLE users 
        ADD CONSTRAINT IF NOT EXISTS unique_username UNIQUE (username)
      `);
      console.log("✅ Added unique constraint on username");
    } catch (error) {
      if (
        error.message.includes("Duplicate entry") ||
        error.message.includes("already exists")
      ) {
        console.log("ℹ️  Unique constraint on username already exists");
      } else {
        console.warn(
          "⚠️  Could not add unique constraint on username:",
          error.message
        );
      }
    }

    try {
      await sequelize.query(`
        ALTER TABLE users 
        ADD CONSTRAINT IF NOT EXISTS unique_email UNIQUE (email)
      `);
      console.log("✅ Added unique constraint on email");
    } catch (error) {
      if (
        error.message.includes("Duplicate entry") ||
        error.message.includes("already exists")
      ) {
        console.log("ℹ️  Unique constraint on email already exists");
      } else {
        console.warn(
          "⚠️  Could not add unique constraint on email:",
          error.message
        );
      }
    }

    // Add indexes for users table
    try {
      await sequelize.query(`
        ALTER TABLE users 
        ADD INDEX IF NOT EXISTS idx_users_role (role)
      `);
      console.log("✅ Added index on role");
    } catch (error) {
      if (error.message.includes("Duplicate key name")) {
        console.log("ℹ️  Index on role already exists");
      } else {
        console.warn("⚠️  Could not add index on role:", error.message);
      }
    }

    // Fix vehicles table
    console.log("\n🔧 Fixing vehicles table schema...");

    try {
      await sequelize.query(`
        ALTER TABLE vehicles 
        ADD CONSTRAINT IF NOT EXISTS unique_license_plate UNIQUE (license_plate)
      `);
      console.log("✅ Added unique constraint on license_plate");
    } catch (error) {
      if (
        error.message.includes("Duplicate entry") ||
        error.message.includes("already exists")
      ) {
        console.log("ℹ️  Unique constraint on license_plate already exists");
      } else {
        console.warn(
          "⚠️  Could not add unique constraint on license_plate:",
          error.message
        );
      }
    }

    // Verify users table indexes
    console.log("\n🔧 Checking users table indexes...");
    const [userIndexes] = await sequelize.query(`
      SHOW INDEX FROM users
    `);

    console.log("📋 Current users table indexes:");
    const uniqueIndexes = userIndexes.filter((idx) => idx.Non_unique === 0);
    uniqueIndexes.forEach((idx) => {
      console.log(`   - ${idx.Column_name} (unique index: ${idx.Key_name})`);
    });

    // Check if we're close to the key limit
    console.log(
      `\n📊 Current unique indexes count: ${uniqueIndexes.length}/64`
    );

    if (uniqueIndexes.length > 50) {
      console.warn(
        "⚠️  Approaching MySQL unique key limit (64). Consider removing unused indexes."
      );
    }

    // Check shipments table indexes
    console.log("\n🔧 Checking shipments table indexes...");
    const [shipmentIndexes] = await sequelize.query(`
      SHOW INDEX FROM shipments
    `);

    console.log("📋 Current shipments table indexes:");
    const shipmentUniqueIndexes = shipmentIndexes.filter(
      (idx) => idx.Non_unique === 0
    );
    shipmentUniqueIndexes.forEach((idx) => {
      console.log(`   - ${idx.Column_name} (unique index: ${idx.Key_name})`);
    });

    console.log(
      `\n📊 Current shipments unique indexes count: ${shipmentUniqueIndexes.length}/64`
    );

    console.log("\n✅ Database schema fix completed successfully!");
    await sequelize.close();
  } catch (error) {
    console.error("❌ Error fixing database schema:", error.message);
    console.error("Error name:", error.name);

    if (error.name === "SequelizeConnectionError") {
      console.log(
        "\n💡 Tip: Make sure MySQL is running and your database credentials are correct in .env file."
      );
    }

    await sequelize.close();
    process.exit(1);
  }
}

fixDatabaseSchema();
