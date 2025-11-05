const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Create Sequelize connection
const sequelize = new Sequelize(
  process.env.DB_NAME || 'shipsmart_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Database connected successfully (Sequelize)');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:');
    console.error('❌ Error syncing database:', error);
    if (error.parent) {
      console.error('Error details:', error.parent.message || error.message);
    }
    console.warn('⚠️  Server will continue running without database connection');
    console.warn('💡 Make sure MySQL is running and connection settings are correct');
    return false;
  }
};

module.exports = { sequelize, testConnection };
