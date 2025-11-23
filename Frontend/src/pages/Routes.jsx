import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import { useTranslation } from "react-i18next";
import { useLoader } from "../context/LoaderContext";
import Sidebar from "../components/Sidebar";
import MobileMenuButton from "../components/MobileMenuButton";
import Header from "../components/Header";
import { PieChart, ChartCard } from "../components/Charts";
import axiosInstance from "../config/axios";
import {
  HiMap,
  HiArrowsRightLeft,
  HiMagnifyingGlass,
  HiChevronDown,
  HiChartBar,
  HiMapPin,
  HiGlobeAlt,
  HiClock,
  HiArrowDownTray,
  HiShare,
  HiStar,
  HiArrowTrendingUp,
  HiUsers,
} from "react-icons/hi2";
import Swal from "sweetalert2";

// Province mapping for different languages
const PROVINCE_MAPPING = {
  // English to Persian mapping
  enToPrs: {
    Kabul: "کابل",
    Herat: "هرات",
    Kandahar: "قندهار",
    Balkh: "بلخ",
    Nangarhar: "ننگرهار",
    Badghis: "بادغیس",
    Badakhshan: "بدخشان",
    Baghlan: "بغلان",
    Bamyan: "بامیان",
    Daykundi: "دایکندی",
    Farah: "فراه",
    Faryab: "فاریاب",
    Ghazni: "غزنی",
    Ghor: "غور",
    Helmand: "هلمند",
    Jowzjan: "جوزجان",
    Kapisa: "کاپیسا",
    Khost: "خوست",
    Kunar: "کنر",
    Kunduz: "کندز",
    Laghman: "لغمان",
    Logar: "لوگر",
    "Maidan Wardak": "میدان وردک",
    Nimruz: "نیمروز",
    Nuristan: "نورستان",
    Paktia: "پکتیا",
    Paktika: "پکتیکا",
    Panjshir: "پنجشیر",
    Parwan: "پروان",
    Samangan: "سمنگان",
    "Sar-e Pol": "سرپل",
    Takhar: "تخار",
    Uruzgan: "ارزگان",
    Wardak: "وردک",
    Zabul: "زابل",
  },
  // Persian to English mapping
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
    "میدان وردک": "Maidan Wardak",
    وردک: "Wardak",
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
    زابل: "Zabul",
  },
  // English to Pashto mapping
  enToPbt: {
    Kabul: "کابل",
    Herat: "هرات",
    Kandahar: "کندهار",
    Balkh: "بلخ",
    Nangarhar: "ننگرهار",
    Badghis: "بادغیس",
    Badakhshan: "بدخشان",
    Baghlan: "بغلان",
    Bamyan: "بامیان",
    Daykundi: "دایکندی",
    Farah: "فراه",
    Faryab: "فاریاب",
    Ghazni: "غزني",
    Ghor: "غور",
    Helmand: "هلمند",
    Jowzjan: "جوزجان",
    Kapisa: "کاپیسا",
    Khost: "خوست",
    Kunar: "کنړ",
    Kunduz: "کندز",
    Laghman: "لغمان",
    Logar: "لوگر",
    "Maidan Wardak": "میدان وردګ",
    Nimruz: "نیمروز",
    Nuristan: "نورستان",
    Paktia: "پکتیا",
    Paktika: "پکتیکا",
    Panjshir: "پنجشیر",
    Parwan: "پروان",
    Samangan: "سمنګان",
    "Sar-e Pol": "سرپل",
    Takhar: "تخار",
    Uruzgan: "ارزګان",
    Wardak: "وردګ",
    Zabul: "زابل",
  },
  // Pashto to English mapping
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
    "میدان وردګ": "Maidan Wardak",
    وردګ: "Wardak",
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
    زابل: "Zabul",
  },
};

const Routes = () => {
  const { isDark } = useTheme();
  const { showLoaderWithText } = useLoader();
  const { t, i18n } = useTranslation();
  const {
    sidebarOpen,
    sidebarCollapsed,
    toggleSidebar,
    closeSidebar,
    toggleSidebarCollapse,
  } = useSidebar();

  useEffect(() => {
    showLoaderWithText("Loading Routes...", 1500);
  }, []); // Empty dependency array to run only once

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connections, setConnections] = useState({});
  const [provinces, setProvinces] = useState([]);
  const [fromProvince, setFromProvince] = useState("");
  const [toProvince, setToProvince] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [expandedProvince, setExpandedProvince] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [routeStats, setRouteStats] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [routeDistribution, setRouteDistribution] = useState([]);

  // Fetch provincial connections
  useEffect(() => {
    fetchProvincialConnections();
    loadSearchHistory();
  }, []);

  // Calculate route statistics
  const calculateRouteStats = () => {
    const stats = {
      totalProvinces: provinces.length,
      provincesWithRoutes: Object.keys(connections).filter(
        (p) => connections[p].length > 0
      ).length,
      totalConnections: Object.values(connections).reduce(
        (sum, neighbors) => sum + neighbors.length,
        0
      ),
      averageConnections: 0,
      mostConnected: "",
      leastConnected: "",
      longestRoute: 0,
      shortestRoute: 0,
    };

    if (stats.provincesWithRoutes > 0) {
      stats.averageConnections = (
        stats.totalConnections / stats.provincesWithRoutes
      ).toFixed(1);

      const connectionCounts = Object.entries(connections).map(
        ([province, neighbors]) => ({
          province,
          count: neighbors.length,
        })
      );

      connectionCounts.sort((a, b) => b.count - a.count);
      stats.mostConnected = connectionCounts[0]?.province || "";
      stats.leastConnected =
        connectionCounts[connectionCounts.length - 1]?.province || "";
    }

    setRouteStats(stats);
  };

  // Load search history from localStorage
  const loadSearchHistory = () => {
    const history = localStorage.getItem("routeSearchHistory");
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  };

  // Save search to history
  const saveToSearchHistory = (from, to, route) => {
    const newSearch = {
      from,
      to,
      route: route?.route?.en || "No route found",
      timestamp: new Date().toISOString(),
      hops: route?.hops || 0,
    };

    const updatedHistory = [newSearch, ...searchHistory.slice(0, 9)]; // Keep last 10 searches
    setSearchHistory(updatedHistory);
    localStorage.setItem("routeSearchHistory", JSON.stringify(updatedHistory));
  };

  // Generate suggestions based on input
  const generateSuggestions = (input, type) => {
    if (!input) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = provinces
      .filter((province) =>
        province.toLowerCase().includes(input.toLowerCase())
      )
      .slice(0, 5);

    setSuggestions(filtered);
    setShowSuggestions(true);
  };

  const fetchProvincialConnections = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/provincial-connections");
      if (response.data && response.data.success) {
        setConnections(response.data.connections);

        // Build province list from backend connections so all provinces appear,
        // even those without neighbors (e.g. Bamyan)
        const englishProvinces = Object.keys(response.data.connections).sort();
        const localizedProvinces = englishProvinces.map((province) =>
          getLocalizedProvinceName(province)
        );

        setProvinces(localizedProvinces);
        calculateRouteStats();

        // Prepare route distribution data for pie chart
        const distribution = [];
        Object.entries(response.data.connections).forEach(
          ([province, neighbors]) => {
            distribution.push({
              province: getLocalizedProvinceName(province),
              connections: neighbors.length,
            });
          }
        );
        setRouteDistribution(
          distribution.sort((a, b) => b.connections - a.connections).slice(0, 8)
        ); // Top 8 provinces
      }
    } catch (err) {
      console.error("Error fetching provincial connections:", err);
      setError(t("routes.errors.fetchFailed"));
      Swal.fire({
        icon: "error",
        title: t("common.errors.generic"),
        text: t("routes.errors.fetchFailed"),
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Export route data to CSV
  const exportToCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Province,Neighbors,Connection Count\n" +
      Object.entries(connections)
        .map(
          ([province, neighbors]) =>
            `"${province}","${neighbors.join("; ")}",${neighbors.length}`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "afghanistan_provincial_routes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      icon: "success",
      title: "Export Successful",
      text: "Route data has been exported to CSV",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
    });
  };

  // Share route
  const shareRoute = (from, to, route) => {
    const routeText = `Route from ${from} to ${to}: ${
      route?.route?.en || "No route found"
    }`;

    if (navigator.share) {
      navigator.share({
        title: "Afghanistan Provincial Route",
        text: routeText,
      });
    } else {
      navigator.clipboard.writeText(routeText);
      Swal.fire({
        icon: "success",
        title: "Copied to Clipboard",
        text: "Route information has been copied",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  // Check route between two provinces
  const checkRoute = async (e) => {
    e.preventDefault();

    if (!fromProvince || !toProvince) {
      Swal.fire({
        icon: "warning",
        title: t("common.warning"),
        text: t("routes.errors.selectProvinces"),
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    try {
      // Convert localized province names to English for API call
      let fromProvinceEn = fromProvince;
      let toProvinceEn = toProvince;

      // Check current language and convert if needed
      if (i18n.language === "prs") {
        fromProvinceEn = PROVINCE_MAPPING.prsToEn[fromProvince] || fromProvince;
        toProvinceEn = PROVINCE_MAPPING.prsToEn[toProvince] || toProvince;
      } else if (i18n.language === "pbt") {
        fromProvinceEn = PROVINCE_MAPPING.pbtToEn[fromProvince] || fromProvince;
        toProvinceEn = PROVINCE_MAPPING.pbtToEn[toProvince] || toProvince;
      }

      const response = await axiosInstance.get(
        `/provincial-connections/check-route/${encodeURIComponent(
          fromProvinceEn
        )}/${encodeURIComponent(toProvinceEn)}`
      );

      if (response.data && response.data.success) {
        setSearchResult(response.data);
        saveToSearchHistory(fromProvince, toProvince, response.data);
        setShowSuggestions(false);
        Swal.fire({
          icon: response.data.connected ? "success" : "info",
          title: response.data.connected
            ? t("routes.connected")
            : t("routes.notConnected"),
          text: response.data.message,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        });
      }
    } catch (err) {
      console.error("Error checking route:", err);
      setError(t("routes.errors.checkFailed"));
      Swal.fire({
        icon: "error",
        title: t("common.errors.generic"),
        text: t("routes.errors.checkFailed"),
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  // Toggle province details
  const toggleProvinceDetails = (province) => {
    setExpandedProvince(expandedProvince === province ? null : province);
  };

  // Reset search
  const resetSearch = () => {
    setFromProvince("");
    setToProvince("");
    setSearchResult(null);
  };

  // Get localized province name
  const getLocalizedProvinceName = (province) => {
    if (t && i18n.language === "prs") {
      return PROVINCE_MAPPING.enToPrs[province] || province;
    } else if (t && i18n.language === "pbt") {
      return PROVINCE_MAPPING.enToPbt[province] || province;
    } else {
      return province;
    }
  };

  // Get English province name from localized name
  const getEnglishProvinceName = (province) => {
    if (i18n && i18n.language === "prs") {
      return PROVINCE_MAPPING.prsToEn[province] || province;
    } else if (i18n && i18n.language === "pbt") {
      return PROVINCE_MAPPING.pbtToEn[province] || province;
    }
    return province;
  };

  // Prepare chart data for route distribution
  const routeChartData = {
    labels: routeDistribution.map((item) => item.province),
    datasets: [
      {
        data: routeDistribution.map((item) => item.connections),
        backgroundColor: [
          "#3b82f6",
          "#ef4444",
          "#10b981",
          "#f59e0b",
          "#8b5cf6",
          "#ec4899",
          "#06b6d4",
          "#84cc16",
        ],
        borderColor: isDark ? "#1f2937" : "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  return (
    <>
      <div
        className={`min-h-screen flex transition-colors duration-300 ${
          isDark ? "bg-gray-950" : "bg-gray-50"
        }`}
      >
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />

        {/* Mobile Menu Button */}
        <MobileMenuButton onClick={toggleSidebar} isDark={isDark} />

        {/* Main Content */}
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen || !sidebarCollapsed ? "lg:ml-64" : "lg:ml-20"
          }`}
        >
          <div className="p-4 sm:p-6 lg:p-8">
            <Header
              title={`🛣️ ${t("routes.title")}`}
              subtitle={t("routes.description")}
            />

            {/* Action Buttons */}
            <div className="mb-6">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    isDark
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  <HiChartBar className="w-4 h-4" />
                  {showAnalytics ? "Hide Analytics" : "Show Analytics"}
                </button>
                <button
                  onClick={exportToCSV}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    isDark
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  <HiArrowDownTray className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Analytics Dashboard */}
            {showAnalytics && (
              <div className="mb-8">
                <h2
                  className={`text-xl font-semibold mb-4 ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  📊 Route Analytics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div
                    className={`p-4 rounded-lg border ${
                      isDark
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Total Provinces
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            isDark ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {routeStats.totalProvinces || 0}
                        </p>
                      </div>
                      <HiGlobeAlt
                        className={`w-8 h-8 ${
                          isDark ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-lg border ${
                      isDark
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Provinces with Routes
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            isDark ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {routeStats.provincesWithRoutes || 0}
                        </p>
                      </div>
                      <HiMapPin
                        className={`w-8 h-8 ${
                          isDark ? "text-green-400" : "text-green-600"
                        }`}
                      />
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-lg border ${
                      isDark
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Total Connections
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            isDark ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {routeStats.totalConnections || 0}
                        </p>
                      </div>
                      <HiArrowsRightLeft
                        className={`w-8 h-8 ${
                          isDark ? "text-purple-400" : "text-purple-600"
                        }`}
                      />
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-lg border ${
                      isDark
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Avg Connections
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            isDark ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {routeStats.averageConnections || 0}
                        </p>
                      </div>
                      <HiArrowTrendingUp
                        className={`w-8 h-8 ${
                          isDark ? "text-orange-400" : "text-orange-600"
                        }`}
                      />
                    </div>
                  </div>
                </div>
                {showAnalytics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div
                      className={`p-4 rounded-lg border ${
                        isDark
                          ? "bg-gray-800 border-gray-700"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <h3
                        className={`font-medium mb-2 ${
                          isDark ? "text-white" : "text-gray-800"
                        }`}
                      >
                        🏆 Most Connected
                      </h3>
                      <p
                        className={`text-lg ${
                          isDark ? "text-blue-400" : "text-blue-600"
                        }`}
                      >
                        {routeStats.mostConnected || "N/A"}
                      </p>
                    </div>

                    <div
                      className={`p-4 rounded-lg border ${
                        isDark
                          ? "bg-gray-800 border-gray-700"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <h3
                        className={`font-medium mb-2 ${
                          isDark ? "text-white" : "text-gray-800"
                        }`}
                      >
                        📍 Least Connected
                      </h3>
                      <p
                        className={`text-lg ${
                          isDark ? "text-orange-400" : "text-orange-600"
                        }`}
                      >
                        {routeStats.leastConnected || "N/A"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div
                className={`mb-6 p-4 rounded-lg border ${
                  isDark
                    ? "bg-red-900/30 border-red-700 text-red-300"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {error}
              </div>
            )}

            {/* Search Form */}
            <div
              className={`rounded-xl shadow-lg border p-6 mb-8 transition-all duration-300 ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <HiMagnifyingGlass
                  className={`w-6 h-6 ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <h2
                  className={`text-xl font-semibold ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  {t("routes.checkRoute")}
                </h2>
              </div>

              <form onSubmit={checkRoute} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* From Province */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {t("routes.fromProvince")}
                    </label>
                    <select
                      value={fromProvince}
                      onChange={(e) => setFromProvince(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                          : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    >
                      <option value="">{t("routes.selectProvince")}</option>
                      {provinces.map((province, index) => (
                        <option key={index} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* To Province */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {t("routes.toProvince")}
                    </label>
                    <select
                      value={toProvince}
                      onChange={(e) => setToProvince(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                          : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    >
                      <option value="">{t("routes.selectProvince")}</option>
                      {provinces.map((province, index) => (
                        <option key={index} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      isDark
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    <HiArrowsRightLeft className="w-4 h-4" />
                    {t("routes.check")}
                  </button>
                  <button
                    type="button"
                    onClick={resetSearch}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isDark
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    {t("common.reset")}
                  </button>
                </div>
              </form>
            </div>

            {/* Search History */}
            {searchHistory.length > 0 && (
              <div
                className={`rounded-xl shadow-lg border p-6 mb-8 transition-all duration-300 ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className={`text-lg font-semibold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    <HiClock className="inline w-5 h-5 mr-2" />
                    Recent Searches
                  </h3>
                  <button
                    onClick={() => {
                      setSearchHistory([]);
                      localStorage.removeItem("routeSearchHistory");
                    }}
                    className={`text-sm px-3 py-1 rounded ${
                      isDark
                        ? "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                        : "bg-red-100 text-red-600 hover:bg-red-200"
                    }`}
                  >
                    Clear History
                  </button>
                </div>
                <div className="space-y-2">
                  {searchHistory.map((search, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isDark ? "bg-gray-700/50" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex-1">
                        <div
                          className={`font-medium ${
                            isDark ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {search.from} → {search.to}
                        </div>
                        <div
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {search.route} ({search.hops} stops)
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setFromProvince(search.from);
                            setToProvince(search.to);
                          }}
                          className={`p-2 rounded ${
                            isDark
                              ? "bg-blue-900/30 text-blue-400 hover:bg-blue-900/50"
                              : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                          }`}
                        >
                          <HiMagnifyingGlass className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            shareRoute(search.from, search.to, {
                              route: { en: search.route },
                              hops: search.hops,
                            })
                          }
                          className={`p-2 rounded ${
                            isDark
                              ? "bg-green-900/30 text-green-400 hover:bg-green-900/50"
                              : "bg-green-100 text-green-600 hover:bg-green-200"
                          }`}
                        >
                          <HiShare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchResult && (
              <div
                className={`rounded-xl shadow-lg border p-6 mb-8 transition-all duration-300 ${
                  searchResult.connected
                    ? isDark
                      ? "bg-green-900/30 border-green-700 text-green-300"
                      : "bg-green-50 border-green-200 text-green-700"
                    : isDark
                    ? "bg-yellow-900/30 border-yellow-700 text-yellow-300"
                    : "bg-yellow-50 border-yellow-200 text-yellow-700"
                }`}
              >
                <div className="flex items-center mb-3">
                  <HiArrowsRightLeft className="w-5 h-5 mr-2" />
                  <span className="font-medium">{searchResult.message}</span>
                </div>

                {searchResult.route && (
                  <div className="mt-3">
                    <div
                      className={`text-sm font-medium mb-2 ${
                        isDark ? "text-green-300" : "text-green-700"
                      }`}
                    >
                      {t("routes.routeDetails")} ({searchResult.hops}{" "}
                      {t("routes.stops")}):
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        isDark ? "bg-green-900/20" : "bg-green-100/50"
                      }`}
                    >
                      <div
                        className={`text-sm font-mono ${
                          isDark ? "text-green-200" : "text-green-800"
                        }`}
                      >
                        {searchResult.route[i18n.language] ||
                          searchResult.route.en}
                      </div>
                    </div>
                  </div>
                )}

                {searchResult.routeDetails &&
                  searchResult.routeDetails.length > 0 && (
                    <div className="mt-3">
                      <div
                        className={`text-sm font-medium mb-2 ${
                          isDark ? "text-green-300" : "text-green-700"
                        }`}
                      >
                        {t("routes.routeStops")}:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {searchResult.routeDetails.map((stop, index) => (
                          <div key={index} className="flex items-center">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                isDark
                                  ? "bg-green-900/30 text-green-300"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {index === 0 && "📍 "}
                              {index === searchResult.routeDetails.length - 1 &&
                                "🎯 "}
                              {stop}
                            </span>
                            {index < searchResult.routeDetails.length - 1 && (
                              <span
                                className={`mx-1 ${
                                  isDark ? "text-green-400" : "text-green-600"
                                }`}
                              >
                                →
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Share buttons */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() =>
                      shareRoute(fromProvince, toProvince, searchResult)
                    }
                    className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${
                      isDark
                        ? "bg-green-900/30 text-green-400 hover:bg-green-900/50"
                        : "bg-green-100 text-green-600 hover:bg-green-200"
                    }`}
                  >
                    <HiShare className="w-3 h-3" />
                    Share Route
                  </button>
                  <button
                    onClick={() => {
                      const routeText = `${fromProvince} → ${toProvince}: ${
                        searchResult.route[i18n.language] ||
                        searchResult.route.en
                      }`;
                      navigator.clipboard.writeText(routeText);
                      Swal.fire({
                        icon: "success",
                        title: "Copied!",
                        text: "Route copied to clipboard",
                        toast: true,
                        position: "top-end",
                        showConfirmButton: false,
                        timer: 2000,
                      });
                    }}
                    className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${
                      isDark
                        ? "bg-blue-900/30 text-blue-400 hover:bg-blue-900/50"
                        : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                    }`}
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p
                    className={`mt-4 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {t("common.loading")}...
                  </p>
                </div>
              </div>
            )}

            {/* Route Distribution Chart */}
            <div className="mt-6">
              <ChartCard
                title="Top Provinces by Route Connections"
                isDark={isDark}
              >
                <PieChart
                  data={routeChartData}
                  title="Provincial Route Distribution"
                  isDark={isDark}
                />
              </ChartCard>
            </div>

            {/* Provincial Connections */}
            {!loading && provinces.length > 0 && (
              <div
                className={`rounded-xl shadow-lg border overflow-hidden transition-all duration-300 ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div
                  className={`px-6 py-4 border-b ${
                    isDark ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <h2
                    className={`text-lg font-semibold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {t("routes.provincialConnections")} ({provinces.length})
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead
                      className={`uppercase text-sm ${
                        isDark
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      <tr>
                        <th className="p-3 text-left">
                          {t("routes.province")}
                        </th>
                        <th className="p-3 text-left">
                          {t("routes.neighbors")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {provinces.map((province, index) => {
                        // Get English name for backend lookup
                        const englishProvinceName =
                          getEnglishProvinceName(province);
                        // Get neighbors from backend data
                        const neighbors =
                          connections[englishProvinceName] || [];
                        // Localize neighbor names
                        const localizedNeighbors = neighbors.map((neighbor) =>
                          getLocalizedProvinceName(neighbor)
                        );

                        return (
                          <React.Fragment key={index}>
                            <tr
                              className={`border-t transition ${
                                isDark
                                  ? "border-gray-700 hover:bg-gray-700/50"
                                  : "border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              <td className="p-3 font-medium">
                                <div className="flex items-center">
                                  <button
                                    onClick={() =>
                                      toggleProvinceDetails(province)
                                    }
                                    className={`mr-2 p-1 rounded ${
                                      isDark
                                        ? "text-gray-400 hover:text-white hover:bg-gray-600"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                                    }`}
                                  >
                                    <HiChevronDown
                                      className={`w-4 h-4 transition-transform ${
                                        expandedProvince === province
                                          ? "rotate-180"
                                          : ""
                                      }`}
                                    />
                                  </button>
                                  <span
                                    className={
                                      isDark ? "text-blue-400" : "text-blue-600"
                                    }
                                  >
                                    {province}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex flex-wrap gap-2">
                                  {localizedNeighbors.map(
                                    (neighbor, neighborIndex) => (
                                      <span
                                        key={neighborIndex}
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          isDark
                                            ? "bg-blue-900/30 text-blue-300"
                                            : "bg-blue-100 text-blue-800"
                                        }`}
                                      >
                                        {neighbor}
                                      </span>
                                    )
                                  )}
                                </div>
                              </td>
                            </tr>
                            {expandedProvince === province && (
                              <tr
                                className={`border-t ${
                                  isDark ? "border-gray-700" : "border-gray-200"
                                }`}
                              >
                                <td colSpan="2" className="p-3">
                                  <div
                                    className={`p-3 rounded-lg ${
                                      isDark ? "bg-gray-700/50" : "bg-gray-100"
                                    }`}
                                  >
                                    <h4
                                      className={`font-medium mb-2 ${
                                        isDark ? "text-white" : "text-gray-800"
                                      }`}
                                    >
                                      {t("routes.neighborsOf", { province })}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {localizedNeighbors.map(
                                        (neighbor, neighborIndex) => (
                                          <span
                                            key={neighborIndex}
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                              isDark
                                                ? "bg-blue-900/30 text-blue-300"
                                                : "bg-blue-100 text-blue-800"
                                            }`}
                                          >
                                            {neighbor}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* No Data State */}
            {!loading && provinces.length === 0 && (
              <div
                className={`rounded-xl shadow-lg border p-8 text-center ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <HiMap className="mx-auto h-12 w-12 text-gray-400" />
                <h3
                  className={`mt-2 text-sm font-medium ${
                    isDark ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  {t("routes.noConnections")}
                </h3>
                <p
                  className={`mt-1 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {t("routes.getStarted")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Routes;
