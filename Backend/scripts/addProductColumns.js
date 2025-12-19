const { sequelize } = require("../config/database");
const dotenv = require("dotenv");

dotenv.config();

async function addProductColumns() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'products'
    `);

    const existing = new Set(columns.map((c) => c.COLUMN_NAME));

    const desiredColumns = [
      { name: "sender", sql: "ALTER TABLE products ADD COLUMN sender VARCHAR(255) NULL DEFAULT NULL" },
      {
        name: "sender_phone",
        sql: "ALTER TABLE products ADD COLUMN sender_phone VARCHAR(50) NULL DEFAULT NULL",
      },
      {
        name: "sender_email",
        sql: "ALTER TABLE products ADD COLUMN sender_email VARCHAR(100) NULL DEFAULT NULL",
      },
      {
        name: "sender_address",
        sql: "ALTER TABLE products ADD COLUMN sender_address TEXT NULL DEFAULT NULL",
      },
      {
        name: "receiver_name",
        sql: "ALTER TABLE products ADD COLUMN receiver_name VARCHAR(255) NULL DEFAULT NULL",
      },
      {
        name: "receiver_phone",
        sql: "ALTER TABLE products ADD COLUMN receiver_phone VARCHAR(50) NULL DEFAULT NULL",
      },
      {
        name: "receiver_email",
        sql: "ALTER TABLE products ADD COLUMN receiver_email VARCHAR(100) NULL DEFAULT NULL",
      },
      {
        name: "receiver_address",
        sql: "ALTER TABLE products ADD COLUMN receiver_address TEXT NULL DEFAULT NULL",
      },
      {
        name: "discount",
        sql: "ALTER TABLE products ADD COLUMN discount DECIMAL(10,2) NULL DEFAULT NULL",
      },
      {
        name: "remaining",
        sql: "ALTER TABLE products ADD COLUMN remaining DECIMAL(10,2) NULL DEFAULT NULL",
      },
    ];

    const missing = desiredColumns.filter((c) => !existing.has(c.name));

    if (missing.length === 0) {
      console.log("✅ Products table already has all required columns");
      await sequelize.close();
      return;
    }

    console.log(`🔧 Adding ${missing.length} missing column(s) to products table...`);

    for (const col of missing) {
      try {
        await sequelize.query(col.sql);
        console.log(`✅ Added column: ${col.name}`);
      } catch (err) {
        // If column already exists or has been added concurrently, ignore.
        const msg = err?.original?.sqlMessage || err?.message || "";
        if (/Duplicate column name/i.test(msg)) {
          console.log(`ℹ️  Column already exists: ${col.name}`);
        } else {
          console.error(`❌ Failed to add column ${col.name}:`, msg);
          throw err;
        }
      }
    }

    console.log("✅ Product columns migration completed");
    await sequelize.close();
  } catch (error) {
    console.error("❌ Error adding product columns:", error?.message || error);
    if (error?.original?.sqlMessage) {
      console.error("SQL error:", error.original.sqlMessage);
    }
    try {
      await sequelize.close();
    } catch (_) {
      // ignore
    }
    process.exit(1);
  }
}

addProductColumns();
