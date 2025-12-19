const dotenv = require("dotenv");
const { sequelize } = require("../config/database");

dotenv.config();

const requiredColumns = [
  "sender",
  "sender_phone",
  "sender_email",
  "sender_address",
  "receiver_name",
  "receiver_phone",
  "receiver_email",
  "receiver_address",
  "discount",
  "remaining",
];

async function checkProductColumns() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'products'
      ORDER BY ORDINAL_POSITION
    `);

    const existing = new Set(columns.map((c) => c.COLUMN_NAME));

    console.log("\n📋 Existing products columns:");
    columns.forEach((c) => console.log(` - ${c.COLUMN_NAME}`));

    const missing = requiredColumns.filter((c) => !existing.has(c));
    console.log("\n🔎 Required product columns:");
    requiredColumns.forEach((c) => console.log(` - ${c}`));

    if (missing.length === 0) {
      console.log("\n✅ All required product columns exist");
    } else {
      console.log("\n❌ Missing product columns:");
      missing.forEach((c) => console.log(` - ${c}`));
      console.log("\n💡 Run: npm run add-product-columns");
    }

    await sequelize.close();
  } catch (error) {
    console.error("❌ Error checking product columns:", error.message);
    if (error.original?.sqlMessage) {
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

checkProductColumns();
