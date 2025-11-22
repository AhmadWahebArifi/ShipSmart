const express = require("express");
const router = express.Router();

// Afghanistan Provincial Road Connections
// Based on major highways and road maps

// Define provincial road connections
const PROVINCIAL_CONNECTIONS = {
  Badakhshan: ["Takhar"],
  Badghis: ["Herat", "Ghor", "Faryab"],
  Baghlan: ["Balkh", "Parwan"],
  Balkh: ["Baghlan", "Jowzjan"],
  Bamyan: ["Parwan", "Ghor"],
  Daykundi: ["Uruzgan", "Ghor"],
  Farah: ["Nimruz", "Helmand"],
  Faryab: ["Jowzjan", "Badghis"],
  Ghazni: ["Wardak", "Kandahar"],
  Ghor: ["Bamyan", "Herat", "Badghis"],
  Helmand: ["Kandahar", "Nimruz"],
  Herat: ["Farah", "Badghis"],
  Jowzjan: ["Balkh", "Faryab"],
  Kabul: ["Wardak", "Parwan", "Nangarhar"],
  Kandahar: ["Ghazni", "Zabul", "Uruzgan"],
  Kapisa: ["Parwan", "Panjshir"],
  Khost: ["Paktia", "Paktika"],
  Kunar: ["Nangarhar", "Nuristan"],
  Kunduz: ["Baghlan", "Takhar"],
  Laghman: ["Nangarhar", "Kapisa"],
  Logar: ["Kabul", "Paktia"],
  Nangarhar: ["Kabul", "Laghman"],
  Nimruz: ["Farah", "Helmand"],
  Nuristan: ["Kunar"],
  Paktia: ["Logar", "Ghazni", "Paktika", "Khost"],
  Paktika: ["Paktia", "Ghazni", "Zabul"],
  Panjshir: ["Parwan", "Kapisa"],
  Parwan: ["Kabul", "Baghlan"],
  Samangan: ["Baghlan", "Balkh"],
  "Sar-e Pol": ["Faryab", "Jowzjan"],
  Takhar: ["Kunduz", "Badakhshan"],
  Uruzgan: ["Kandahar", "Zabul", "Daykundi"],
  Wardak: ["Kabul", "Ghazni"],
  Zabul: ["Kandahar", "Ghazni", "Paktika"],
};

// @route   GET /api/provincial-connections
// @desc    Get all provincial road connections
// @access  Public
router.get("/", (req, res) => {
  try {
    res.json({
      success: true,
      connections: PROVINCIAL_CONNECTIONS,
      message: "Provincial road connections retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching provincial connections:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching provincial road connections",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   GET /api/provincial-connections/:province
// @desc    Get neighboring provinces for a specific province
// @access  Public
router.get("/:province", (req, res) => {
  try {
    const province = req.params.province;
    const connections = PROVINCIAL_CONNECTIONS[province];

    if (!connections) {
      return res.status(404).json({
        success: false,
        message: `No road connections found for province: ${province}`,
      });
    }

    res.json({
      success: true,
      province: province,
      neighbors: connections,
      message: `Road connections for ${province} retrieved successfully`,
    });
  } catch (error) {
    console.error("Error fetching provincial connection:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching provincial road connection",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   GET /api/provincial-connections/check-route/:from/:to
// @desc    Check if there's a direct road connection between two provinces
// @access  Public
router.get("/check-route/:from/:to", (req, res) => {
  try {
    const fromProvince = req.params.from;
    const toProvince = req.params.to;

    // Check if both provinces exist in our data
    if (!PROVINCIAL_CONNECTIONS[fromProvince]) {
      return res.status(404).json({
        success: false,
        message: `Province not found: ${fromProvince}`,
      });
    }

    if (!PROVINCIAL_CONNECTIONS[toProvince]) {
      return res.status(404).json({
        success: false,
        message: `Province not found: ${toProvince}`,
      });
    }

    // Check if there's a direct connection
    const hasDirectConnection =
      PROVINCIAL_CONNECTIONS[fromProvince].includes(toProvince);

    res.json({
      success: true,
      from: fromProvince,
      to: toProvince,
      connected: hasDirectConnection,
      message: hasDirectConnection
        ? `Direct road connection exists from ${fromProvince} to ${toProvince}`
        : `No direct road connection from ${fromProvince} to ${toProvince}`,
    });
  } catch (error) {
    console.error("Error checking provincial connection:", error);
    res.status(500).json({
      success: false,
      message: "Error checking provincial road connection",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
