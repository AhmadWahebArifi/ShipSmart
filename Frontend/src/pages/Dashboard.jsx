import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import Sidebar from "../components/Sidebar";
import MobileMenuButton from "../components/MobileMenuButton";
import Header from "../components/Header";
import axiosInstance from "../config/axios";

function Dashboard() {
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

  const [stats, setStats] = useState([
    {
      title: t("dashboard.totalShipments"),
      value: "0",
      icon: "📦",
      color: "bg-blue-500",
    },
    {
      title: t("dashboard.pendingShipments"),
      value: "0",
      icon: "⏳",
      color: "bg-yellow-500",
    },
    {
      title: t("dashboard.inProgress"),
      value: "0",
      icon: "🚚",
      color: "bg-purple-500",
    },
    {
      title: t("dashboard.deliveriesToday"),
      value: "0",
      icon: "✅",
      color: "bg-green-500",
    },
  ]);

  // Fetch shipment statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get("/shipments/stats");
        if (response.data && response.data.success) {
          const { totalShipments, statusStats, deliveredToday } =
            response.data.stats;

          setStats([
            {
              title: t("dashboard.totalShipments"),
              value: totalShipments.toString(),
              icon: "📦",
              color: "bg-blue-500",
            },
            {
              title: t("dashboard.pendingShipments"),
              value: (
                statusStats.pending +
                statusStats.in_progress +
                statusStats.on_route
              ).toString(),
              icon: "⏳",
              color: "bg-yellow-500",
            },
            {
              title: t("dashboard.inProgress"),
              value: (
                statusStats.in_progress + statusStats.on_route
              ).toString(),
              icon: "🚚",
              color: "bg-purple-500",
            },
            {
              title: t("dashboard.deliveriesToday"),
              value: deliveredToday.toString(),
              icon: "✅",
              color: "bg-green-500",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchStats();
  }, [t]);

  return (
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
        {/* Main Content Area */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Top header with welcome + notifications */}
          <Header subtitle={t("dashboard.overview")} />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`rounded-xl shadow-lg p-6 border transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium mb-1 transition-colors ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {stat.title}
                    </p>
                    <p
                      className={`text-3xl font-bold transition-colors ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}
                  >
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div
            className={`rounded-xl shadow-lg border p-6 transition-all duration-300 ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 transition-colors ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              {t("dashboard.recentActivity")}
            </h3>
            <div className="space-y-4">
              <div
                className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                  isDark ? "bg-gray-700/50" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isDark ? "bg-blue-600/20" : "bg-blue-100"
                    }`}
                  >
                    📦
                  </div>
                  <div>
                    <p
                      className={`font-medium transition-colors ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {t("dashboard.newShipment")}
                    </p>
                    <p
                      className={`text-sm transition-colors ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {t("dashboard.hoursAgo", { count: 2 })}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    isDark
                      ? "bg-blue-600/20 text-blue-400"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {t("dashboard.active")}
                </span>
              </div>

              <div
                className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                  isDark ? "bg-gray-700/50" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isDark ? "bg-green-600/20" : "bg-green-100"
                    }`}
                  >
                    ✅
                  </div>
                  <div>
                    <p
                      className={`font-medium transition-colors ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {t("dashboard.deliveryCompleted")}
                    </p>
                    <p
                      className={`text-sm transition-colors ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {t("dashboard.hoursAgo", { count: 5 })}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    isDark
                      ? "bg-green-600/20 text-green-400"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {t("dashboard.delivered")}
                </span>
              </div>

              <div
                className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                  isDark ? "bg-gray-700/50" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isDark ? "bg-purple-600/20" : "bg-purple-100"
                    }`}
                  >
                    🗺️
                  </div>
                  <div>
                    <p
                      className={`font-medium transition-colors ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {t("dashboard.routeUpdated")}
                    </p>
                    <p
                      className={`text-sm transition-colors ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {t("dashboard.dayAgo", { count: 1 })}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    isDark
                      ? "bg-purple-600/20 text-purple-400"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {t("dashboard.updated")}
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
