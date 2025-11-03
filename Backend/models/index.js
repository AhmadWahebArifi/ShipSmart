const { sequelize } = require('../config/database');
const User = require('./User');

// Initialize models
const models = {
  User,
  sequelize
};

// Sync models with database (optional - can be done manually or via migrations)
// sequelize.sync({ alter: true }).then(() => {
//   console.log('✅ Database models synchronized');
// });

module.exports = models;

