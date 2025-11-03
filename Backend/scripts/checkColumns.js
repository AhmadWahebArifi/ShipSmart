const { sequelize } = require('../config/database');
const dotenv = require('dotenv');

dotenv.config();

async function checkColumns() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Check if columns exist
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME IN ('name', 'address', 'profile_pic')
    `);

    const existingColumns = results.map(row => row.COLUMN_NAME);
    const requiredColumns = ['name', 'address', 'profile_pic'];
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));

    if (missingColumns.length === 0) {
      console.log('✅ All profile columns exist!');
    } else {
      console.log('❌ Missing columns:', missingColumns.join(', '));
      console.log('\n💡 Run: npm run add-profile-columns');
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error checking columns:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

checkColumns();

