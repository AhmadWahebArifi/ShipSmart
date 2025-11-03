const { sequelize } = require('../config/database');
const { User } = require('../models');
const { Op } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

async function createUser() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Sync models (create tables if they don't exist)
    await sequelize.sync({ alter: false });
    console.log('✅ Database models synchronized');

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: 'admin@test.com' },
          { username: 'admin' }
        ]
      }
    });

    if (existingUser) {
      console.log('❌ User already exists with email admin@test.com or username admin');
      await sequelize.close();
      return;
    }

    // Create user (password will be hashed by Sequelize hook)
    const user = await User.create({
      username: 'admin',
      email: 'admin@test.com',
      password: 'admin123', // Will be hashed automatically
      role: 'admin'
    });

    console.log('✅ User created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Email: admin@test.com');
    console.log('   Password: admin123');
    console.log('   Role: admin');
    console.log(`   User ID: ${user.id}`);

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    console.error('Error name:', error.name);
    
    if (error.name === 'SequelizeConnectionError') {
      console.log('\n💡 Tip: Make sure MySQL is running and your database credentials are correct in .env file.');
    } else if (error.name === 'SequelizeValidationError') {
      console.log('\n💡 Tip: Validation error - check the data being inserted.');
    }
    
    await sequelize.close();
    process.exit(1);
  }
}

createUser();
