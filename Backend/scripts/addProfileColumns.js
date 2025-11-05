const { sequelize } = require('../config/database');
const dotenv = require('dotenv');

dotenv.config();

async function addProfileColumns() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Add new columns to users table if they don't exist
    const queryInterface = sequelize.getQueryInterface();
    
    // Check and add 'name' column
    try {
      await queryInterface.addColumn('users', 'name', {
        type: require('sequelize').DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null
      });
      console.log('✅ Added "name" column to users table');
    } catch (error) {
      if (error.name === 'SequelizeDatabaseError' && error.message.includes('Duplicate column')) {
        console.log('ℹ️  Column "name" already exists');
      } else {
        throw error;
      }
    }

    // Check and add 'address' column
    try {
      await queryInterface.addColumn('users', 'address', {
        type: require('sequelize').DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
      });
      console.log('✅ Added "address" column to users table');
    } catch (error) {
      if (error.name === 'SequelizeDatabaseError' && error.message.includes('Duplicate column')) {
        console.log('ℹ️  Column "address" already exists');
      } else {
        throw error;
      }
    }

    // Check and add 'profile_pic' column
    try {
      // Check if column exists first
      const [results] = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'profile_pic'
      `);
      
      if (results.length > 0) {
        // Column exists, check if it needs to be altered to TEXT('long')
        const [columnInfo] = await sequelize.query(`
          SELECT DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'users' 
          AND COLUMN_NAME = 'profile_pic'
        `);
        
        if (columnInfo[0].DATA_TYPE === 'varchar' || columnInfo[0].DATA_TYPE === 'char') {
          // Alter column to TEXT('long')
          await queryInterface.changeColumn('users', 'profile_pic', {
            type: require('sequelize').DataTypes.TEXT('long'),
            allowNull: true,
            defaultValue: null
          });
          console.log('✅ Updated "profile_pic" column to TEXT(\'long\')');
        } else {
          console.log('ℹ️  Column "profile_pic" already exists with correct type');
        }
      } else {
        // Column doesn't exist, add it
        await queryInterface.addColumn('users', 'profile_pic', {
          type: require('sequelize').DataTypes.TEXT('long'),
          allowNull: true,
          defaultValue: null
        });
        console.log('✅ Added "profile_pic" column to users table');
      }
    } catch (error) {
      if (error.name === 'SequelizeDatabaseError' && error.message.includes('Duplicate column')) {
        console.log('ℹ️  Column "profile_pic" already exists');
      } else {
        throw error;
      }
    }

    console.log('✅ All profile columns added successfully!');
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error adding columns:', error.message);
    console.error('Error name:', error.name);
    await sequelize.close();
    process.exit(1);
  }
}

addProfileColumns();

