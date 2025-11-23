const { sequelize } = require("../config/database");
const Product = require("../models/Product");
const dotenv = require("dotenv");

dotenv.config();

async function addSampleReceiverData() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    console.log("\n🔄 Adding sample receiver data to existing products...\n");

    // Sample receiver data
    const sampleReceivers = [
      {
        receiver_name: "Ahmad Khan",
        receiver_phone: "+93 70 123 4567",
        receiver_email: "ahmad.khan@email.com",
        receiver_address: "Kabul, Afghanistan - District 5",
      },
      {
        receiver_name: "Fatima Rahimi",
        receiver_phone: "+93 79 234 5678",
        receiver_email: "fatima.rahimi@email.com",
        receiver_address: "Herat, Afghanistan - Central Market Area",
      },
      {
        receiver_name: "Mohammad Yousufzai",
        receiver_phone: "+93 78 345 6789",
        receiver_email: null, // Optional field
        receiver_address: "Kandahar, Afghanistan - Business Quarter",
      },
      {
        receiver_name: "Sakina Hussain",
        receiver_phone: "+93 77 456 7890",
        receiver_email: "sakina.h@email.com",
        receiver_address: null, // Optional field
      },
    ];

    // Get all products
    const products = await Product.findAll({
      limit: 4,
    });

    console.log(`Found ${products.length} products to update\n`);

    // Update each product with sample receiver data
    for (let i = 0; i < products.length && i < sampleReceivers.length; i++) {
      const product = products[i];
      const receiverData = sampleReceivers[i];

      await product.update(receiverData);

      console.log(`✅ Updated Product ${product.id} (${product.name}):`);
      console.log(`   Receiver Name: ${receiverData.receiver_name}`);
      console.log(`   Receiver Phone: ${receiverData.receiver_phone}`);
      console.log(
        `   Receiver Email: ${receiverData.receiver_email || "Not provided"}`
      );
      console.log(
        `   Receiver Address: ${
          receiverData.receiver_address || "Not provided"
        }`
      );
      console.log("");
    }

    console.log(`🎉 Sample receiver data added successfully!`);
    console.log(`\n📋 Now you can:`);
    console.log(
      `   1. Refresh the Products page to see the receiver information`
    );
    console.log(
      `   2. Click the Eye icon on shipments to see receiver details`
    );
    console.log(
      `   3. Add new products with receiver information through the form`
    );
  } catch (error) {
    console.error("❌ Error adding sample data:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the script
if (require.main === module) {
  addSampleReceiverData();
}

module.exports = addSampleReceiverData;
