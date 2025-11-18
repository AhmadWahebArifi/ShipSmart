const { sequelize } = require("../config/database");
const User = require("./User");
const Shipment = require("./Shipment");
const Notification = require("./Notification");
const Product = require("./Product");
const Vehicle = require("./Vehicle");

// Define associations
// Shipment associations
Shipment.belongsTo(User, { foreignKey: "sender_id", as: "sender" });
Shipment.belongsTo(User, { foreignKey: "receiver_id", as: "receiver" });
Shipment.belongsTo(Vehicle, { foreignKey: "vehicle_id", as: "vehicle" });
Shipment.hasMany(Product, {
  foreignKey: "shipment_tracking_number",
  sourceKey: "tracking_number",
  as: "products",
});

// User associations
User.hasMany(Shipment, { foreignKey: "sender_id", as: "sentShipments" });
User.hasMany(Shipment, { foreignKey: "receiver_id", as: "receivedShipments" });
User.hasMany(Product, { foreignKey: "created_by", as: "products" });
User.hasMany(Vehicle, { foreignKey: "created_by", as: "vehicles" });

// Product associations
Product.belongsTo(Shipment, {
  foreignKey: "shipment_tracking_number",
  targetKey: "tracking_number",
  as: "shipment",
});
Product.belongsTo(User, {
  foreignKey: "created_by",
  as: "creator",
});

// Vehicle associations
Vehicle.belongsTo(User, {
  foreignKey: "created_by",
  as: "creator",
});

Notification.belongsTo(User, { foreignKey: "user_id", as: "user" });
Notification.belongsTo(Shipment, { foreignKey: "shipment_id", as: "shipment" });
User.hasMany(Notification, { foreignKey: "user_id", as: "notifications" });
Shipment.hasMany(Notification, {
  foreignKey: "shipment_id",
  as: "notifications",
});

// Initialize models
const models = {
  User,
  Shipment,
  Notification,
  Product,
  Vehicle,
  sequelize,
};

// Call associate methods
if (Vehicle.associate) {
  Vehicle.associate(models);
}

// Sync models with database (adds missing columns without dropping data)
// Wrap in async IIFE to handle errors gracefully
(async () => {
  try {
    // Use force: false to avoid dropping tables
    // Use alter: false to avoid modifying existing columns
    // This prevents the key limit issue by not trying to add automatic indexes
    await sequelize.sync({ alter: false, force: false });
    console.log("✅ Database models synchronized");

    // Verify profile columns exist
    try {
      const [results] = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME IN ('name', 'address', 'profile_pic', 'province', 'branch')
      `);

      const existingColumns = results.map((r) => r.COLUMN_NAME);
      const requiredColumns = [
        "name",
        "address",
        "profile_pic",
        "province",
        "branch",
      ];
      const missingColumns = requiredColumns.filter(
        (col) => !existingColumns.includes(col)
      );

      if (missingColumns.length > 0) {
        console.warn(
          `⚠️  Missing profile columns: ${missingColumns.join(", ")}`
        );
        console.warn("💡 Run: npm run add-profile-columns");
      } else {
        console.log("✅ All profile columns verified");
      }
    } catch (verifyError) {
      console.error("⚠️  Could not verify columns:", verifyError.message);
    }
  } catch (error) {
    // Handle connection errors gracefully - don't crash the server
    if (
      error.name === "SequelizeConnectionRefusedError" ||
      error.name === "SequelizeConnectionError"
    ) {
      console.error("❌ Database connection error:");
      console.error("❌ Error syncing database:", error.name);
      if (error.parent) {
        console.error("Error details:", error.parent.message || error.message);
      }
      console.warn(
        "⚠️  Server will continue running without database connection"
      );
      console.warn(
        "💡 Make sure MySQL is running and connection settings are correct"
      );
    } else {
      console.error("❌ Error syncing database:", error);
      console.error("Error details:", error.message);
      console.warn(
        "⚠️  Server will continue running - database sync can be retried later"
      );
    }
    // Continue even if sync fails - the addProfileColumns script can be run manually
  }
})();

module.exports = models;
