const cron = require("node-cron");
const axios = require("axios");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Create axios instance for internal API calls
const baseURL = process.env.BASE_URL || "http://localhost:5000";
const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
});

// Function to update shipment statuses
const updateShipmentStatuses = async () => {
  try {
    console.log(`Running scheduled shipment status update on ${baseURL}...`);

    // Call the auto-update endpoint
    const response = await api.put("/api/shipments/auto-update-status");

    if (response.data.success) {
      console.log(`Shipment status update completed successfully:`);
      console.log(
        `- Shipments updated to on_route: ${response.data.updated_on_route}`
      );
      console.log(
        `- Shipments updated to delivered: ${response.data.updated_delivered}`
      );
    } else {
      console.error(
        "Failed to update shipment statuses:",
        response.data.message
      );
    }
  } catch (error) {
    console.error(
      "Error during scheduled shipment status update:",
      error.message
    );
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
};

// Schedule the task to run every hour
const scheduleShipmentStatusUpdates = () => {
  // Run every hour at minute 0
  cron.schedule("0 * * * *", updateShipmentStatuses);
  console.log("Shipment status updater scheduled to run every hour");

  // Also run immediately on startup
  updateShipmentStatuses();
};

module.exports = { scheduleShipmentStatusUpdates };
