const { sequelize } = require("../config/database");
const dotenv = require("dotenv");

dotenv.config();

async function fixVehicleUniqueConstraint() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Fix unique constraint for vehicle_id column in vehicles table
    const queryInterface = sequelize.getQueryInterface();

    // First, check if the unique constraint exists
    try {
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
        "⚠️  Could not add unique constraint (might already exist):",
        error.message
      );
    }

    console.log("✅ Vehicle unique constraint check completed!");
    await sequelize.close();
  } catch (error) {
    console.error("❌ Error fixing vehicle unique constraint:", error.message);
    console.error("Error name:", error.name);
    await sequelize.close();
    process.exit(1);
  }
}

fixVehicleUniqueConstraint();
