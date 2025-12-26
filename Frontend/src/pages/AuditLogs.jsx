import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import Sidebar from "../components/Sidebar";
import MobileMenuButton from "../components/MobileMenuButton";
import Header from "../components/Header";
import { HiMagnifyingGlass, HiFunnel, HiChevronLeft, HiChevronRight, HiXMark, HiCheckCircle, HiXCircle } from "react-icons/hi2";
import axios from "axios";

const AuditLogs = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const {
    sidebarOpen,
    sidebarCollapsed,
    toggleSidebar,
    closeSidebar,
    toggleSidebarCollapse,
  } = useSidebar();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, count: 0 });
  const [filters, setFilters] = useState({
    action: "",
    entity_type: "",
    actor_user_id: "",
    success: "",
    from: "",
    to: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = { page, limit: 50, ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)) };
      const res = await axios.get("/api/admin/audit-logs", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setLogs(res.data.logs);
      setPagination({ page: res.data.currentPage, totalPages: res.data.totalPages, count: res.data.count });
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/admin/audit-logs/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(res.data);
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchSummary();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    fetchLogs(1);
  };

  const handleReset = () => {
    setFilters({ action: "", entity_type: "", actor_user_id: "", success: "", from: "", to: "" });
    fetchLogs(1);
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString();

  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 ${
        isDark ? "bg-gray-950" : "bg-gray-50"
      }`}
    >
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      <MobileMenuButton onClick={toggleSidebar} isDark={isDark} />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen || !sidebarCollapsed ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        <div className="p-3 sm:p-4 lg:p-6 xl:p-8">
          <Header
            title={t("auditLogs.title")}
            subtitle={summary ? `${summary.totalLogs} ${t("auditLogs.totalLogs")}` : ""}
          />

        {/* Filter Button */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm ${
                isDark
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              }`}
            >
              <HiFunnel className="w-4 h-4" />
              {showFilters ? t("common.hideFilters") : t("common.showFilters")}
            </button>
          </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className={`p-3 sm:p-4 rounded-lg ${
            isDark ? "bg-gray-800" : "bg-white shadow"
          }`}>
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <HiMagnifyingGlass className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t("auditLogs.totalLogs")}
                </p>
                <p
                  className={`text-lg sm:text-2xl font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {summary.totalLogs}
                </p>
              </div>
            </div>
          </div>
          <div className={`p-3 sm:p-4 rounded-lg ${
            isDark ? "bg-gray-800" : "bg-white shadow"
          }`}>
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <HiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t("auditLogs.last24h")}
                </p>
                <p
                  className={`text-lg sm:text-2xl font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {summary.last24h}
                </p>
              </div>
            </div>
          </div>
          <div className={`p-3 sm:p-4 rounded-lg ${
            isDark ? "bg-gray-800" : "bg-white shadow"
          }`}>
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <HiXCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t("auditLogs.failedLogins")}
                </p>
                <p
                  className={`text-lg sm:text-2xl font-semibold text-red-500`}
                >
                  {summary.failedLogins}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFilters && (
        <div className={`p-3 sm:p-4 rounded-lg ${isDark ? "bg-gray-800" : "bg-white"} border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <input
              name="action"
              placeholder={t("auditLogs.filterAction")}
              value={filters.action}
              onChange={handleFilterChange}
              className={`px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
            />
            <input
              name="entity_type"
              placeholder={t("auditLogs.filterEntity")}
              value={filters.entity_type}
              onChange={handleFilterChange}
              className={`px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
            />
            <input
              name="actor_user_id"
              placeholder={t("auditLogs.filterUser")}
              value={filters.actor_user_id}
              onChange={handleFilterChange}
              className={`px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
            />
            <select
              name="success"
              value={filters.success}
              onChange={handleFilterChange}
              className={`px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
            >
              <option value="">{t("auditLogs.anyStatus")}</option>
              <option value="true">{t("auditLogs.success")}</option>
              <option value="false">{t("auditLogs.failed")}</option>
            </select>
            <input
              type="datetime-local"
              name="from"
              value={filters.from}
              onChange={handleFilterChange}
              className={`px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
            />
            <input
              type="datetime-local"
              name="to"
              value={filters.to}
              onChange={handleFilterChange}
              className={`px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
            <button
              onClick={handleSearch}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
            >
              <HiMagnifyingGlass className="w-4 h-4" />
              {t("common.search")}
            </button>
            <button
              onClick={handleReset}
              className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm ${isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-900"}`}
            >
              <HiXMark className="w-4 h-4" />
              {t("common.reset")}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className={`rounded-lg border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} overflow-hidden`}>
          {/* Desktop & Large Tablet Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                <tr>
                  <th className={`px-3 sm:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-600"}`}>{t("auditLogs.time", "Time")}</th>
                  <th className={`px-3 sm:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-600"}`}>{t("auditLogs.actor", "Actor")}</th>
                  <th className={`px-3 sm:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-600"}`}>{t("auditLogs.action", "Action")}</th>
                  <th className={`px-3 sm:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-600"}`}>{t("auditLogs.entity", "Entity")}</th>
                  <th className={`px-3 sm:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-600"}`}>{t("auditLogs.status", "Status")}</th>
                  <th className={`px-3 sm:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-600"}`}>{t("auditLogs.message", "Message")}</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
                {logs.map((log) => (
                  <tr key={log.id} className={isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}>
                    <td className={`px-3 sm:px-4 py-3 text-xs sm:text-sm ${isDark ? "text-gray-300" : "text-gray-900"}`}>{formatDate(log.created_at)}</td>
                    <td className={`px-3 sm:px-4 py-3 text-xs sm:text-sm ${isDark ? "text-gray-300" : "text-gray-900"}`}>
                      {log.actor ? `${log.actor.username} (${log.actor.role})` : `${log.actor_role || "N/A"}`}
                    </td>
                    <td className={`px-3 sm:px-4 py-3 text-xs sm:text-sm font-mono ${isDark ? "text-gray-300" : "text-gray-900"}`}>{log.action}</td>
                    <td className={`px-3 sm:px-4 py-3 text-xs sm:text-sm ${isDark ? "text-gray-300" : "text-gray-900"}`}>{log.entity_type && log.entity_id ? `${log.entity_type}:${log.entity_id}` : log.entity_type || "-"}</td>
                    <td className={`px-3 sm:px-4 py-3 text-xs sm:text-sm`}>
                      {log.success ? <HiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" /> : <HiXCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />}
                    </td>
                    <td className={`px-3 sm:px-4 py-3 text-xs sm:text-sm ${isDark ? "text-gray-300" : "text-gray-900"}`}>{log.message || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3 p-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`rounded-lg border p-3 transition-all hover:shadow-md ${
                  isDark
                    ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                {/* Header with time and status */}
                <div className="flex items-center justify-between mb-2">
                  <div className={`text-xs font-medium ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}>
                    {formatDate(log.created_at)}
                  </div>
                  <div className="flex items-center">
                    {log.success ? (
                      <HiCheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <HiXCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>

                {/* Actor and Action */}
                <div className="mb-2">
                  <div className={`font-semibold text-xs sm:text-sm mb-1 ${
                    isDark ? "text-gray-200" : "text-gray-900"
                  }`}>
                    {log.actor ? `${log.actor.username} (${log.actor.role})` : `${log.actor_role || "N/A"}`}
                  </div>
                  <div className={`text-xs font-mono ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}>
                    {log.action}
                  </div>
                </div>

                {/* Entity and Message */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-start gap-2">
                    <span className={`font-medium ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}>
                      Entity:
                    </span>
                    <span className={`truncate ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}>
                      {log.entity_type && log.entity_id ? `${log.entity_type}:${log.entity_id}` : log.entity_type || "-"}
                    </span>
                  </div>
                  {log.message && (
                    <div className="flex items-start gap-2">
                      <span className={`font-medium ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}>
                        Message:
                      </span>
                      <span className={`truncate ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}>
                        {log.message}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {pagination.totalPages > 1 && (
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-4 py-3 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              <span className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {t("auditLogs.showing")} {(pagination.page - 1) * 50 + 1}–{Math.min(pagination.page * 50, pagination.count)} {t("auditLogs.of")} {pagination.count}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchLogs(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded transition-colors text-xs sm:text-sm ${pagination.page <= 1 ? "opacity-50 cursor-not-allowed" : isDark ? "hover:bg-gray-700 text-white" : "hover:bg-gray-100 text-gray-900"}`}
                >
                  <HiChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm ${isDark ? "text-gray-300" : "text-gray-900"}`}>{pagination.page} / {pagination.totalPages}</span>
                <button
                  onClick={() => fetchLogs(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded transition-colors text-xs sm:text-sm ${pagination.page >= pagination.totalPages ? "opacity-50 cursor-not-allowed" : isDark ? "hover:bg-gray-700 text-white" : "hover:bg-gray-100 text-gray-900"}`}
                >
                  <HiChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
