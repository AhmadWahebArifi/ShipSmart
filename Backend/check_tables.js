const { sequelize } = require('./config/database');

async function checkTables() {
  try {
    console.log('Checking database tables...');
    
    // Get all tables
    const [tables] = await sequelize.query("SHOW TABLES");
    console.log('Tables in database:', tables.map(t => Object.values(t)[0]));
    
    // Check if audit_logs table exists
    const [auditLogTable] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'audit_logs'
    `);
    
    console.log('Audit logs table exists:', auditLogTable[0].count > 0);
    
    if (auditLogTable[0].count > 0) {
      // Check audit_logs table structure
      const [structure] = await sequelize.query("DESCRIBE audit_logs");
      console.log('Audit logs table structure:');
      structure.forEach(col => console.log(`- ${col.Field}: ${col.Type}`));
      
      // Check if there are any records
      const [count] = await sequelize.query("SELECT COUNT(*) as total FROM audit_logs");
      console.log('Total audit log records:', count[0].total);
      
      // Show sample records if any exist
      if (count[0].total > 0) {
        const [sample] = await sequelize.query("SELECT * FROM audit_logs LIMIT 5");
        console.log('Sample audit log records:');
        console.log(JSON.stringify(sample, null, 2));
      }
    }
    
  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    await sequelize.close();
  }
}

checkTables();
