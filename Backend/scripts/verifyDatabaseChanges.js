const { sequelize } = require("../config/database");
const Product = require("../models/Product");
const dotenv = require("dotenv");

dotenv.config();

async function verifyDatabaseChanges() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    console.log("\n🔍 Verifying database changes...\n");

    // Get all products with receiver fields
    const products = await Product.findAll({
      attributes: [
        "id",
        "name",
        "receiver_name",
        "receiver_phone",
        "receiver_email",
        "receiver_address",
      ],
      limit: 5,
    });

    console.log(`Found ${products.length} products:\n`);

    products.forEach((product, index) => {
      console.log(`📦 Product ${index + 1}:`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Name: ${product.name}`);
      console.log(`   Receiver Name: ${product.receiver_name || "NULL"}`);
      console.log(`   Receiver Phone: ${product.receiver_phone || "NULL"}`);
      console.log(`   Receiver Email: ${product.receiver_email || "NULL"}`);
      console.log(`   Receiver Address: ${product.receiver_address || "NULL"}`);
      console.log("");
    });

    console.log(`✅ Database changes verified successfully!`);
    console.log(`\n📋 Next Steps:`);
    console.log(`   1. Restart the backend server: npm start`);
    console.log(`   2. Refresh the frontend Products page`);
    console.log(`   3. The receiver data should now display correctly`);
  } catch (error) {
    console.error("❌ Error verifying database:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the verification
if (require.main === module) {
  verifyDatabaseChanges();
}

module.exports = verifyDatabaseChanges;
