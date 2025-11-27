// scripts/addNewProductFields.js
// Migration script to add new fields to the products table

const { sequelize } = require("../config/database");

async function addNewProductFields() {
  try {
    console.log("Starting migration to add new product fields...");

    // Check if columns already exist
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'products'
    `);

    const existingColumns = results.map((row) => row.COLUMN_NAME);

    const newFields = [
      {
        name: "sender_phone",
        sql: "ALTER TABLE products ADD COLUMN sender_phone VARCHAR(255) DEFAULT NULL",
      },
      {
        name: "sender_email",
        sql: "ALTER TABLE products ADD COLUMN sender_email VARCHAR(255) DEFAULT NULL",
      },
      {
        name: "sender_address",
        sql: "ALTER TABLE products ADD COLUMN sender_address TEXT DEFAULT NULL",
      },
      {
        name: "discount",
        sql: "ALTER TABLE products ADD COLUMN discount DECIMAL(10, 2) DEFAULT NULL",
      },
      {
        name: "remaining",
        sql: "ALTER TABLE products ADD COLUMN remaining DECIMAL(10, 2) DEFAULT NULL",
      },
    ];

    for (const field of newFields) {
      if (!existingColumns.includes(field.name)) {
        console.log(`Adding column: ${field.name}`);
        await sequelize.query(field.sql);
        console.log(`✓ Added ${field.name} column`);
      } else {
        console.log(`- Column ${field.name} already exists, skipping...`);
      }
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  addNewProductFields()
    .then(() => {
      console.log("Migration completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

module.exports = addNewProductFields;
