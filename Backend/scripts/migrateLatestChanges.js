const { sequelize } = require("../config/database");
const dotenv = require("dotenv");

dotenv.config();

async function migrateLatestChanges() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    const queryInterface = sequelize.getQueryInterface();

    console.log("\n🔄 Migrating latest changes...\n");

    // 1. Add route_info column to shipments table
    try {
      await queryInterface.addColumn("shipments", "route_info", {
        type: require("sequelize").DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        comment:
          "Route information for multi-hop shipments (e.g., Kabul → Wardak → Ghazni)",
      });
      console.log('✅ Added "route_info" column to shipments table');
    } catch (error) {
      if (
        error.name === "SequelizeDatabaseError" &&
        error.message.includes("Duplicate column")
      ) {
        console.log('ℹ️  Column "route_info" already exists');
      } else {
        console.log('⚠️  Warning adding "route_info" column:', error.message);
      }
    }

    // 2. Add route_hops column to shipments table
    try {
      await queryInterface.addColumn("shipments", "route_hops", {
        type: require("sequelize").DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        comment:
          "Number of hops in the route (0 for direct connection, null if not calculated)",
      });
      console.log('✅ Added "route_hops" column to shipments table');
    } catch (error) {
      if (
        error.name === "SequelizeDatabaseError" &&
        error.message.includes("Duplicate column")
      ) {
        console.log('ℹ️  Column "route_hops" already exists');
      } else {
        console.log('⚠️  Warning adding "route_hops" column:', error.message);
      }
    }

    // 3. Fix unique constraint for vehicle_id column in vehicles table
    try {
      // Check if the unique constraint exists
      const [results] = await sequelize.query(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'vehicles' 
        AND CONSTRAINT_TYPE = 'UNIQUE'
        AND CONSTRAINT_NAME LIKE '%vehicle_id%'
      `);

      // If there's already a unique constraint on vehicle_id, we don't need to add another one
      if (results.length > 0) {
        console.log("ℹ️  Unique constraint for vehicle_id already exists");
      } else {
        // Add unique constraint for vehicle_id column
        await queryInterface.addConstraint("vehicles", {
          fields: ["vehicle_id"],
          type: "unique",
          name: "vehicles_vehicle_id_unique",
        });
        console.log(
          '✅ Added unique constraint for "vehicle_id" column in vehicles table'
        );
      }
    } catch (error) {
      console.log(
        "⚠️  Could not add unique constraint for vehicle_id (might already exist):",
        error.message
      );
    }

    // 4. Fix unique constraint for tracking_number column in shipments table
    try {
      // Check if the unique constraint exists
      const [results] = await sequelize.query(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'shipments' 
        AND CONSTRAINT_TYPE = 'UNIQUE'
        AND CONSTRAINT_NAME LIKE '%tracking_number%'
      `);

      // If there's already a unique constraint on tracking_number, we don't need to add another one
      if (results.length > 0) {
        console.log("ℹ️  Unique constraint for tracking_number already exists");
      } else {
        // Add unique constraint for tracking_number column
        await queryInterface.addConstraint("shipments", {
          fields: ["tracking_number"],
          type: "unique",
          name: "shipments_tracking_number_unique",
        });
        console.log(
          '✅ Added unique constraint for "tracking_number" column in shipments table'
        );
      }
    } catch (error) {
      console.log(
        "⚠️  Could not add unique constraint for tracking_number (might already exist):",
        error.message
      );
    }

    // 5. Fix unique constraints for username and email columns in users table
    try {
      // Check if the unique constraint exists for username
      const [usernameResults] = await sequelize.query(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND CONSTRAINT_TYPE = 'UNIQUE'
        AND CONSTRAINT_NAME LIKE '%username%'
      `);

      if (usernameResults.length > 0) {
        console.log("ℹ️  Unique constraint for username already exists");
      } else {
        // Add unique constraint for username column
        await queryInterface.addConstraint("users", {
          fields: ["username"],
          type: "unique",
          name: "users_username_unique",
        });
        console.log(
          '✅ Added unique constraint for "username" column in users table'
        );
      }

      // Check if the unique constraint exists for email
      const [emailResults] = await sequelize.query(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND CONSTRAINT_TYPE = 'UNIQUE'
        AND CONSTRAINT_NAME LIKE '%email%'
      `);

      if (emailResults.length > 0) {
        console.log("ℹ️  Unique constraint for email already exists");
      } else {
        // Add unique constraint for email column
        await queryInterface.addConstraint("users", {
          fields: ["email"],
          type: "unique",
          name: "users_email_unique",
        });
        console.log(
          '✅ Added unique constraint for "email" column in users table'
        );
      }
    } catch (error) {
      console.log(
        "⚠️  Could not add unique constraints for username/email (might already exist):",
        error.message
      );
    }

    console.log("\n✅ All migrations completed successfully!");
    console.log("\n💡 To verify the changes, you can run:");
    console.log("   node scripts/checkColumns.js");
    await sequelize.close();
  } catch (error) {
    console.error("❌ Error during migration:", error.message);
    console.error("Error name:", error.name);
    await sequelize.close();
    process.exit(1);
  }
}

migrateLatestChanges();
