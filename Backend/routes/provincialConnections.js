const {
  PROVINCIAL_CONNECTIONS,
  PROVINCIAL_ROUTES,
} = require("./provincialRoutesData");

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
    "میدان وردک": "Maidan Wardak",
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
    "میدان وردګ": "Maidan Wardak",
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

// Function to convert English province name to localized name
const toLocalizedProvinceName = (provinceName, language = "en") => {
  if (language === "en") {
    return provinceName;
  } else if (language === "prs") {
    // Find the Persian equivalent
    for (const [persian, english] of Object.entries(
      PROVINCE_MAPPINGS.prsToEn
    )) {
      if (english === provinceName) {
        return persian;
      }
    }
  } else if (language === "pbt") {
    // Find the Pashto equivalent
    for (const [pashto, english] of Object.entries(PROVINCE_MAPPINGS.pbtToEn)) {
      if (english === provinceName) {
        return pashto;
      }
    }
  }
  return provinceName;
};

// Function to get the predefined route from Provinces.txt
const getPredefinedRoute = (fromProvince, toProvince) => {
  const from = toEnglishProvinceName(fromProvince);
  const to = toEnglishProvinceName(toProvince);

  // Check both directions
  const routeKey1 = `${from}-${to}`;
  const routeKey2 = `${to}-${from}`;

  if (PROVINCIAL_ROUTES[routeKey1]) {
    return PROVINCIAL_ROUTES[routeKey1];
  } else if (PROVINCIAL_ROUTES[routeKey2]) {
    // Reverse the route for the opposite direction
    const route = PROVINCIAL_ROUTES[routeKey2];
    const steps = route.split(" → ").reverse();
    return steps.join(" → ");
  }

  return null;
};

// Function to format route for display
const formatRoute = (route, language = "en") => {
  if (!route || route.length === 0) {
    return "";
  }

  const localizedRoute = route.map((province) =>
    toLocalizedProvinceName(province, language)
  );
  return localizedRoute.join(" → ");
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
// @desc    Check if there's a road connection between two provinces and return the route
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

    // Get the predefined route
    const route = getPredefinedRoute(fromProvince, toProvince);

    if (route) {
      // Format route for different languages
      const formattedRoute = {
        en: route,
        prs: route
          .split(" → ")
          .map((province) => toLocalizedProvinceName(province, "prs"))
          .join(" → "),
        pbt: route
          .split(" → ")
          .map((province) => toLocalizedProvinceName(province, "pbt"))
          .join(" → "),
      };

      res.json({
        success: true,
        from: fromProvinceParam,
        to: toProvinceParam,
        connected: true,
        route: formattedRoute,
        routeDetails: route.split(" → ").map((step) => step.trim()),
        hops: route.split(" → ").length - 1,
        message: `Route found from ${fromProvinceParam} to ${toProvinceParam}`,
      });
    } else {
      // Check if there's at least a direct connection
      const hasDirectConnection =
        PROVINCIAL_CONNECTIONS[fromProvince].includes(toProvince);

      res.json({
        success: true,
        from: fromProvinceParam,
        to: toProvinceParam,
        connected: hasDirectConnection,
        route: null,
        routeDetails: [],
        hops: 0,
        message: hasDirectConnection
          ? `Direct road connection exists from ${fromProvinceParam} to ${toProvinceParam}, but no detailed route found`
          : `No road connection found from ${fromProvinceParam} to ${toProvinceParam}`,
      });
    }
  } catch (error) {
    console.error("Error checking provincial connection:", error);
    res.status(500).json({
      success: false,
      message: "Error checking provincial road connection",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   GET /api/provincial-connections/find-routes/:from/:to
// @desc    Find all possible routes between two provinces
// @access  Public
router.get("/find-routes/:from/:to", (req, res) => {
  try {
    const fromProvinceParam = decodeURIComponent(req.params.from);
    const toProvinceParam = decodeURIComponent(req.params.to);
    const maxHops = parseInt(req.query.maxHops) || 3;

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

    // Find all routes
    const routes = findRoutes(fromProvince, toProvince, maxHops);

    // Format routes for different languages
    const formattedRoutes = {
      en: routes.map((route) => formatRoute(route, "en")),
      prs: routes.map((route) => formatRoute(route, "prs")),
      pbt: routes.map((route) => formatRoute(route, "pbt")),
    };

    res.json({
      success: true,
      from: fromProvinceParam,
      to: toProvinceParam,
      routes: formattedRoutes,
      routeDetails: routes,
      count: routes.length,
      message:
        routes.length > 0
          ? `Found ${routes.length} possible routes from ${fromProvinceParam} to ${toProvinceParam}`
          : `No routes found from ${fromProvinceParam} to ${toProvinceParam}`,
    });
  } catch (error) {
    console.error("Error finding provincial routes:", error);
    res.status(500).json({
      success: false,
      message: "Error finding provincial routes",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   GET /api/provincial-connections/shortest-route/:from/:to
// @desc    Find the shortest route between two provinces
// @access  Public
router.get("/shortest-route/:from/:to", (req, res) => {
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

    // Get the shortest route
    const shortestRoute = getShortestRoute(fromProvince, toProvince);

    if (!shortestRoute) {
      return res.status(404).json({
        success: false,
        message: `No route found from ${fromProvinceParam} to ${toProvinceParam}`,
      });
    }

    // Format route for different languages
    const formattedRoute = {
      en: formatRoute(shortestRoute, "en"),
      prs: formatRoute(shortestRoute, "prs"),
      pbt: formatRoute(shortestRoute, "pbt"),
    };

    res.json({
      success: true,
      from: fromProvinceParam,
      to: toProvinceParam,
      route: formattedRoute,
      routeDetails: shortestRoute,
      hops: shortestRoute.length - 1,
      message: `Shortest route from ${fromProvinceParam} to ${toProvinceParam} found`,
    });
  } catch (error) {
    console.error("Error finding shortest provincial route:", error);
    res.status(500).json({
      success: false,
      message: "Error finding shortest provincial route",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = {
  router,
  PROVINCIAL_CONNECTIONS,
  PROVINCIAL_ROUTES,
  toEnglishProvinceName,
  toLocalizedProvinceName,
  getPredefinedRoute,
  formatRoute,
};
