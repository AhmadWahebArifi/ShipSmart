const { sequelize } = require("../config/database");
const dotenv = require("dotenv");

dotenv.config();

async function addShipmentRouteColumns() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Add new columns to shipments table if they don't exist
    const queryInterface = sequelize.getQueryInterface();

    // Check and add 'route_info' column
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
        throw error;
      }
    }

    // Check and add 'route_hops' column
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
        throw error;
      }
    }

    console.log("✅ All shipment route columns added successfully!");
    await sequelize.close();
  } catch (error) {
    console.error("❌ Error adding columns:", error.message);
    console.error("Error name:", error.name);
    await sequelize.close();
    process.exit(1);
  }
}

addShipmentRouteColumns();
