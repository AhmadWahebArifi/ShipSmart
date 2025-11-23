const { sequelize } = require("../config/database");
const Product = require("../models/Product");
const dotenv = require("dotenv");

dotenv.config();

async function checkProductReceiverData() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    console.log("\n🔍 Checking product receiver data...\n");

    // Get all products
    const products = await Product.findAll({
      attributes: [
        "id",
        "name",
        "receiver_name",
        "receiver_phone",
        "receiver_email",
        "receiver_address",
      ],
      limit: 10,
    });

    console.log(`Found ${products.length} products:\n`);

    products.forEach((product, index) => {
      console.log(`\n📦 Product ${index + 1}:`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Name: ${product.name}`);
      console.log(`   Receiver Name: ${product.receiver_name || "NULL"}`);
      console.log(`   Receiver Phone: ${product.receiver_phone || "NULL"}`);
      console.log(`   Receiver Email: ${product.receiver_email || "NULL"}`);
      console.log(`   Receiver Address: ${product.receiver_address || "NULL"}`);
    });

    // Check if any products have receiver data
    const productsWithReceiverData = products.filter(
      (p) =>
        p.receiver_name ||
        p.receiver_phone ||
        p.receiver_email ||
        p.receiver_address
    );

    console.log(`\n📊 Summary:`);
    console.log(`   Total products: ${products.length}`);
    console.log(
      `   Products with receiver data: ${productsWithReceiverData.length}`
    );
    console.log(
      `   Products without receiver data: ${
        products.length - productsWithReceiverData.length
      }`
    );

    if (productsWithReceiverData.length === 0) {
      console.log(
        `\n💡 All products show "Not Available" because they don't have receiver data yet.`
      );
      console.log(
        `   You need to add receiver information to products through the form.`
      );
    }
  } catch (error) {
    console.error("❌ Error checking product data:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the check
if (require.main === module) {
  checkProductReceiverData();
}

module.exports = checkProductReceiverData;
