const axios = require("axios");

async function testProductsAPI() {
  try {
    console.log("🔍 Testing Products API response...\n");

    // Test the API endpoint
    const response = await axios.get("http://localhost:3001/api/products");

    console.log("✅ API Response Status:", response.status);
    console.log("📦 Products found:", response.data.products?.length || 0);

    if (response.data.products && response.data.products.length > 0) {
      console.log("\n📋 First product data structure:");
      const product = response.data.products[0];

      console.log("   ID:", product.id);
      console.log("   Name:", product.name);
      console.log("   Receiver Name:", product.receiver_name || "NULL");
      console.log("   Receiver Phone:", product.receiver_phone || "NULL");
      console.log("   Receiver Email:", product.receiver_email || "NULL");
      console.log("   Receiver Address:", product.receiver_address || "NULL");

      // Check all products for receiver data
      console.log("\n🔍 Checking all products for receiver data:");
      response.data.products.forEach((product, index) => {
        console.log(`\n📦 Product ${index + 1} (${product.name}):`);
        console.log(`   receiver_name: ${product.receiver_name || "NULL"}`);
        console.log(`   receiver_phone: ${product.receiver_phone || "NULL"}`);
        console.log(`   receiver_email: ${product.receiver_email || "NULL"}`);
        console.log(
          `   receiver_address: ${product.receiver_address || "NULL"}`
        );
      });

      // Count products with receiver data
      const withReceiverData = response.data.products.filter(
        (p) =>
          p.receiver_name ||
          p.receiver_phone ||
          p.receiver_email ||
          p.receiver_address
      );

      console.log(`\n📊 Summary:`);
      console.log(`   Total products: ${response.data.products.length}`);
      console.log(`   With receiver data: ${withReceiverData.length}`);
      console.log(
        `   Without receiver data: ${
          response.data.products.length - withReceiverData.length
        }`
      );
    } else {
      console.log("❌ No products found in API response");
    }
  } catch (error) {
    console.error("❌ API Test Failed:", error.message);
    if (error.response) {
      console.error("   Response Status:", error.response.status);
      console.error("   Response Data:", error.response.data);
    }
  }
}

// Run the test
testProductsAPI();
