import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/Sidebar";
import MobileMenuButton from "../components/MobileMenuButton";
import axiosInstance from "../config/axios";
import {
  HiMap,
  HiArrowsRightLeft,
  HiMagnifyingGlass,
  HiChevronDown,
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
    فاریاب: "فاریاب",
    غزني: "Ghazni",
    غور: "غور",
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
    سرپل: "سرپل",
    تخار: "تخار",
    ارزګان: "Uruzgan",
    وردګ: "Wardak",
    زابل: "Zabul",
  },
};

const Routes = () => {
  const { isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const {
    sidebarOpen,
    sidebarCollapsed,
    toggleSidebar,
    closeSidebar,
    toggleSidebarCollapse,
  } = useSidebar();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connections, setConnections] = useState({});
  const [provinces, setProvinces] = useState([]);
  const [fromProvince, setFromProvince] = useState("");
  const [toProvince, setToProvince] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [expandedProvince, setExpandedProvince] = useState(null);

  // Fetch provincial connections
  useEffect(() => {
    fetchProvincialConnections();
  }, []);

  const fetchProvincialConnections = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/provincial-connections");
      if (response.data && response.data.success) {
        setConnections(response.data.connections);
        // Get localized province names from the translation files
        const provinceKeys = i18n.exists("provinces")
          ? t("provinces", { returnObjects: true })
          : [];
        setProvinces(provinceKeys);
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
    if (i18n.language === "prs") {
      return PROVINCE_MAPPING.enToPrs[province] || province;
    } else if (i18n.language === "pbt") {
      return PROVINCE_MAPPING.enToPbt[province] || province;
    }
    return province;
  };

  // Get English province name from localized name
  const getEnglishProvinceName = (province) => {
    if (i18n.language === "prs") {
      return PROVINCE_MAPPING.prsToEn[province] || province;
    } else if (i18n.language === "pbt") {
      return PROVINCE_MAPPING.pbtToEn[province] || province;
    }
    return province;
  };

  return (
    <>
      <div
        className={`min-h-screen flex transition-colors duration-300 ${
          isDark ? "bg-gray-900" : "bg-gray-100"
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
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    isDark
                      ? "bg-blue-600/20 text-blue-400"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <HiMap className="w-6 h-6" />
                </div>
                <h1
                  className={`text-3xl font-bold transition-colors ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  🛣️ {t("routes.title")}
                </h1>
              </div>
              <p
                className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                {t("routes.description")}
              </p>
            </div>

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
              className={`mb-8 p-6 rounded-xl shadow-lg border transition-all duration-300 ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h2
                className={`text-xl font-semibold mb-4 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                {t("routes.checkRoute")}
              </h2>

              <form
                onSubmit={checkRoute}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div>
                  <label
                    htmlFor="fromProvince"
                    className={`block text-sm font-medium mb-1 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {t("routes.fromProvince")}
                  </label>
                  <select
                    id="fromProvince"
                    value={fromProvince}
                    onChange={(e) => setFromProvince(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md border ${
                      isDark
                        ? "border-gray-600 bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                        : "border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                  >
                    <option value="">{t("routes.selectProvince")}</option>
                    {provinces.map((province, index) => (
                      <option key={index} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="toProvince"
                    className={`block text-sm font-medium mb-1 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {t("routes.toProvince")}
                  </label>
                  <select
                    id="toProvince"
                    value={toProvince}
                    onChange={(e) => setToProvince(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md border ${
                      isDark
                        ? "border-gray-600 bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                        : "border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                  >
                    <option value="">{t("routes.selectProvince")}</option>
                    {provinces.map((province, index) => (
                      <option key={index} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <HiMagnifyingGlass className="-ml-1 mr-2 h-4 w-4" />
                    {t("routes.check")}
                  </button>
                  <button
                    type="button"
                    onClick={resetSearch}
                    className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${
                      isDark
                        ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                    }`}
                  >
                    {t("common.reset")}
                  </button>
                </div>
              </form>

              {searchResult && (
                <div
                  className={`mt-4 p-4 rounded-lg border ${
                    searchResult.connected
                      ? isDark
                        ? "bg-green-900/30 border-green-700 text-green-300"
                        : "bg-green-50 border-green-200 text-green-700"
                      : isDark
                      ? "bg-yellow-900/30 border-yellow-700 text-yellow-300"
                      : "bg-yellow-50 border-yellow-200 text-yellow-700"
                  }`}
                >
                  <div className="flex items-center">
                    <HiArrowsRightLeft className="w-5 h-5 mr-2" />
                    <span className="font-medium">{searchResult.message}</span>
                  </div>
                </div>
              )}
            </div>

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
