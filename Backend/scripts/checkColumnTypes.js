const { sequelize } = require('../config/database');
const dotenv = require('dotenv');

dotenv.config();

async function checkColumnTypes() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Check column details
    const [results] = await sequelize.query(`
      SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE,
        COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME IN ('name', 'address', 'profile_pic')
      ORDER BY COLUMN_NAME
    `);

    console.log('📋 Profile columns in users table:');
    console.log('─'.repeat(80));
    
    if (results.length === 0) {
      console.log('❌ No profile columns found!');
      console.log('💡 Run: npm run add-profile-columns');
    } else {
      results.forEach(col => {
        console.log(`\nColumn: ${col.COLUMN_NAME}`);
        console.log(`  Type: ${col.COLUMN_TYPE}`);
        console.log(`  Data Type: ${col.DATA_TYPE}`);
        console.log(`  Max Length: ${col.CHARACTER_MAXIMUM_LENGTH || 'N/A'}`);
        console.log(`  Nullable: ${col.IS_NULLABLE}`);
      });
      
      // Check if profile_pic is TEXT('long')
      const profilePic = results.find(r => r.COLUMN_NAME === 'profile_pic');
      if (profilePic) {
        if (profilePic.DATA_TYPE === 'varchar' && profilePic.CHARACTER_MAXIMUM_LENGTH === 500) {
          console.log('\n⚠️  WARNING: profile_pic is VARCHAR(500) but should be TEXT (long)');
          console.log('💡 This will truncate large base64 images!');
          console.log('💡 Run: npm run add-profile-columns to update it');
        } else if (profilePic.DATA_TYPE === 'longtext' || profilePic.DATA_TYPE === 'text') {
          console.log('\n✅ profile_pic has correct type for large base64 images');
        }
      }
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking columns:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

checkColumnTypes();

