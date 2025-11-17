// This is a simple test to verify form submission data
const testData = {
  name: "Test Product",
  description: "Test Description",
  quantity: 5,
  weight: 10.5,
  price: 100.0,
  shipment_tracking_number: "TEST001",
};

console.log("Test form data:");
console.log(JSON.stringify(testData, null, 2));

// Simulate what the backend would receive
console.log("\nBackend would receive:");
console.log("name:", testData.name);
console.log("description:", testData.description);
console.log("quantity:", testData.quantity);
console.log("weight:", testData.weight);
console.log("price:", testData.price);
console.log("shipment_tracking_number:", testData.shipment_tracking_number);
