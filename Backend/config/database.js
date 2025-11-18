// config/database.js
const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || "shipsmart_db",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    dialectOptions: {
      // Important: Set this to handle empty password correctly
      ssl: false,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully");

    // Sync models
    await sequelize.sync({ alter: true });
    console.log("✅ Database synchronized");
  } catch (error) {
    console.error("❌ Database connection error:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error(
      "Error details:",
      error.original?.sqlMessage || error.message
    );
    console.log("⚠️  Server will continue running without database connection");
    console.log(
      "💡 Make sure MySQL is running and connection settings are correct"
    );
  }
};

module.exports = {
  sequelize,
  testConnection,
};
