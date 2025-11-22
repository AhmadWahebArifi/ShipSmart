// Provincial road connections data for Afghanistan
// Key: Province name (English), Value: Array of directly connected provinces (English)
const PROVINCIAL_CONNECTIONS = {
  Badakhshan: ["Takhar"],
  Badghis: ["Herat", "Ghor", "Faryab"],
  Baghlan: ["Balkh", "Parwan", "Samangan"],
  Balkh: ["Baghlan", "Jowzjan", "Samangan"],
  Bamyan: ["Parwan", "Ghor", "Daykundi", "Wardak"],
  Daykundi: ["Uruzgan", "Ghor", "Bamyan"],
  Farah: ["Nimruz", "Helmand", "Herat"],
  Faryab: ["Jowzjan", "Badghis", "Sar-e Pol"],
  Ghazni: ["Wardak", "Kabul", "Paktia", "Paktika", "Zabul"],
  Ghor: ["Bamyan", "Herat", "Badghis", "Daykundi"],
  Helmand: ["Kandahar", "Nimruz", "Farah"],
  Herat: ["Farah", "Badghis", "Ghor"],
  Jowzjan: ["Balkh", "Faryab", "Sar-e Pol"],
  Kabul: ["Wardak", "Logar", "Nangarhar", "Parwan"],
  Kandahar: ["Helmand", "Ghazni", "Zabul"],
  Kapisa: ["Parwan", "Panjshir", "Laghman"],
  Khost: ["Paktia", "Paktika"],
  Kunar: ["Nangarhar", "Nuristan"],
  Kunduz: ["Baghlan", "Takhar"],
  Laghman: ["Nangarhar", "Kapisa"],
  Logar: ["Kabul", "Paktia", "Wardak"],
  Nangarhar: ["Kabul", "Laghman", "Kunar"],
  Nimruz: ["Farah", "Helmand"],
  Nuristan: ["Kunar"],
  Paktia: ["Logar", "Ghazni", "Paktika", "Khost"],
  Paktika: ["Paktia", "Ghazni", "Zabul", "Khost"],
  Panjshir: ["Parwan", "Kapisa"],
  Parwan: ["Kabul", "Baghlan", "Bamyan", "Wardak", "Panjshir", "Kapisa"],
  Samangan: ["Baghlan", "Balkh"],
  "Sar-e Pol": ["Faryab", "Jowzjan"],
  Takhar: ["Kunduz", "Badakhshan"],
  Uruzgan: ["Kandahar", "Zabul", "Daykundi"],
  Wardak: ["Kabul", "Ghazni", "Bamyan", "Parwan", "Logar"],
  Zabul: ["Kandahar", "Ghazni", "Paktika", "Uruzgan"],
};

// Province name mappings for localization
const PROVINCE_MAPPINGS = {
  // Persian to English
  prsToEn: {
    کابل: "Kabul",
    هرات: "Herat",
    قندهار: "Kandahar",
    بلخ: "Balkh",
    ننگرهار: "Nangarhar",
    بادغیس: "Badghis",
    بدخشان: "Badakhshan",
    بغلان: "Baghlan",
    بامیان: "Bamyan",
    دایکندی: "Daykundi",
    فراه: "Farah",
    فاریاب: "Faryab",
    غزنی: "Ghazni",
    غور: "Ghor",
    هلمند: "Helmand",
    جوزجان: "Jowzjan",
    کاپیسا: "Kapisa",
    خوست: "Khost",
    کنر: "Kunar",
    کندز: "Kunduz",
    لغمان: "Laghman",
    لوگر: "Logar",
    نیمروز: "Nimruz",
    نورستان: "Nuristan",
    پکتیا: "Paktia",
    پکتیکا: "Paktika",
    پنجشیر: "Panjshir",
    پروان: "Parwan",
    سمنگان: "Samangan",
    سرپل: "Sar-e Pol",
    تخار: "Takhar",
    ارزگان: "Uruzgan",
    وردک: "Wardak",
    زابل: "Zabul",
  },
  // Pashto to English
  pbtToEn: {
    کابل: "Kabul",
    هرات: "Herat",
    کندهار: "Kandahar",
    بلخ: "Balkh",
    ننگرهار: "Nangarhar",
    بادغیس: "Badghis",
    بدخشان: "Badakhshan",
    بغلان: "Baghlan",
    بامیان: "Bamyan",
    دایکندی: "Daykundi",
    فراه: "Farah",
    فاریاب: "Faryab",
    غزني: "Ghazni",
    غور: "Ghor",
    هلمند: "Helmand",
    جوزجان: "Jowzjan",
    کاپیسا: "Kapisa",
    خوست: "Khost",
    کنړ: "Kunar",
    کندز: "Kunduz",
    لغمان: "Laghman",
    لوگر: "Logar",
    نیمروز: "Nimruz",
    نورستان: "Nuristan",
    پکتیا: "Paktia",
    پکتیکا: "Paktika",
    پنجشیر: "Panjshir",
    پروان: "Parwan",
    سمنګان: "Samangan",
    سرپل: "Sar-e Pol",
    تخار: "Takhar",
    ارزګان: "Uruzgan",
    وردګ: "Wardak",
    زابل: "Zabul",
  },
};

// Function to convert localized province name to English
const toEnglishProvinceName = (provinceName) => {
  // Check if it's already in English
  if (PROVINCIAL_CONNECTIONS[provinceName]) {
    return provinceName;
  }

  // Try Persian mapping
  const persianMatch = PROVINCE_MAPPINGS.prsToEn[provinceName];
  if (persianMatch && PROVINCIAL_CONNECTIONS[persianMatch]) {
    return persianMatch;
  }

  // Try Pashto mapping
  const pashtoMatch = PROVINCE_MAPPINGS.pbtToEn[provinceName];
  if (pashtoMatch && PROVINCIAL_CONNECTIONS[pashtoMatch]) {
    return pashtoMatch;
  }

  // Return original if no match found
  return provinceName;
};

const express = require("express");
const router = express.Router();

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
    const provinceParam = decodeURIComponent(req.params.province);
    const province = toEnglishProvinceName(provinceParam);
    const connections = PROVINCIAL_CONNECTIONS[province];

    if (!connections) {
      return res.status(404).json({
        success: false,
        message: `No road connections found for province: ${provinceParam}`,
      });
    }

    res.json({
      success: true,
      province: provinceParam,
      neighbors: connections,
      message: `Road connections for ${provinceParam} retrieved successfully`,
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
    const fromProvinceParam = decodeURIComponent(req.params.from);
    const toProvinceParam = decodeURIComponent(req.params.to);

    // Convert localized names to English
    const fromProvince = toEnglishProvinceName(fromProvinceParam);
    const toProvince = toEnglishProvinceName(toProvinceParam);

    // Check if both provinces exist in our data
    if (!PROVINCIAL_CONNECTIONS[fromProvince]) {
      return res.status(404).json({
        success: false,
        message: `Province not found: ${fromProvinceParam}`,
      });
    }

    if (!PROVINCIAL_CONNECTIONS[toProvince]) {
      return res.status(404).json({
        success: false,
        message: `Province not found: ${toProvinceParam}`,
      });
    }

    // Check if there's a direct connection
    const hasDirectConnection =
      PROVINCIAL_CONNECTIONS[fromProvince].includes(toProvince);

    res.json({
      success: true,
      from: fromProvinceParam,
      to: toProvinceParam,
      connected: hasDirectConnection,
      message: hasDirectConnection
        ? `Direct road connection exists from ${fromProvinceParam} to ${toProvinceParam}`
        : `No direct road connection from ${fromProvinceParam} to ${toProvinceParam}`,
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
