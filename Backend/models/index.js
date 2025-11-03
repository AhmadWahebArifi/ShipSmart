const { sequelize } = require('../config/database');
const User = require('./User');

// Initialize models
const models = {
  User,
  sequelize
};

// Sync models with database (adds missing columns without dropping data)
sequelize.sync({ alter: true }).then(() => {
  console.log('✅ Database models synchronized');
}).catch((error) => {
  console.error('❌ Error syncing database:', error);
});

module.exports = models;

