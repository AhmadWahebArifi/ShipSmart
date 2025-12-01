import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import { useLoader } from "../context/LoaderContext";
import Sidebar from "../components/Sidebar";
import MobileMenuButton from "../components/MobileMenuButton";
import Header from "../components/Header";
import { LineChart, PieChart, ChartCard } from "../components/Charts";
import axiosInstance from "../config/axios";

function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { showLoaderWithText } = useLoader();
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

  // Chart data states
  const [dailyShipments, setDailyShipments] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

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

    // Fetch chart data
    const fetchChartData = async () => {
      try {
        // Fetch daily shipments data
        const dailyResponse = await axiosInstance.get("/shipments/daily-stats");
        if (dailyResponse.data && dailyResponse.data.success) {
          setDailyShipments(dailyResponse.data.data);
        }

        // Fetch status distribution data
        const statusResponse = await axiosInstance.get(
          "/shipments/status-distribution"
        );
        if (statusResponse.data && statusResponse.data.success) {
          setStatusDistribution(statusResponse.data.data);
        }

        // Fetch recent activity data
        const activityResponse = await axiosInstance.get(
          "/shipments/recent-activity"
        );
        if (activityResponse.data && activityResponse.data.success) {
          setRecentActivities(activityResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
        // Set mock data for demo purposes
        setDailyShipments([
          { date: "Mon", count: 12 },
          { date: "Tue", count: 19 },
          { date: "Wed", count: 15 },
          { date: "Thu", count: 25 },
          { date: "Fri", count: 22 },
          { date: "Sat", count: 18 },
          { date: "Sun", count: 14 },
        ]);

        setStatusDistribution([
          { status: "Pending", count: 15 },
          { status: "In Progress", count: 28 },
          { status: "On Route", count: 12 },
          { status: "Delivered", count: 45 },
        ]);

        // Mock recent activities
        setRecentActivities([
          {
            id: 1,
            type: "New shipment from Kabul to Herat",
            icon: "📦",
            status: "Created",
            color: "blue",
            timeAgo: "2 hours ago",
            user: "Ahmad Waheb",
            tracking_number: "SS123456",
          },
          {
            id: 2,
            type: "Shipment delivered to Kandahar",
            icon: "✅",
            status: "Delivered",
            color: "green",
            timeAgo: "5 hours ago",
            user: "Admin User",
            tracking_number: "SS123457",
          },
          {
            id: 3,
            type: "Shipment on route from Balkh to Nangarhar",
            icon: "🚚",
            status: "On Route",
            color: "purple",
            timeAgo: "1 day ago",
            user: "Branch User",
            tracking_number: "SS123458",
          },
        ]);
      }
    };

    fetchStats();
    fetchChartData();
  }, [t]);

  // Show loader on component mount
  useEffect(() => {
    showLoaderWithText("Loading Dashboard...", 1500);
  }, []);

  // Prepare chart data
  const lineChartData = {
    labels: dailyShipments.map((item) => item.date),
    datasets: [
      {
        label: "Shipments Created",
        data: dailyShipments.map((item) => item.count),
        borderColor: isDark ? "#60a5fa" : "#3b82f6",
        backgroundColor: isDark
          ? "rgba(96, 165, 250, 0.1)"
          : "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const pieChartData = {
    labels: statusDistribution.map((item) => item.status),
    datasets: [
      {
        data: statusDistribution.map((item) => item.count),
        backgroundColor: [
          "#fbbf24", // yellow for pending
          "#a78bfa", // purple for in progress
          "#60a5fa", // blue for on route
          "#34d399", // green for delivered
          "#ef4444", // red for canceled (if present)
        ],
        borderColor: isDark ? "#1f2937" : "#ffffff",
        borderWidth: 2,
      },
    ],
  };

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
                onClick={() =>
                  showLoaderWithText(`Loading ${stat.title}...`, 1500)
                }
                className={`rounded-xl shadow-lg p-6 border transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer ${
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

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard title="Weekly Shipment Trends" isDark={isDark}>
              <LineChart
                data={lineChartData}
                title="Shipments Created Per Day (Last 7 Days)"
                isDark={isDark}
              />
            </ChartCard>

            <ChartCard title="Current Shipment Status Overview" isDark={isDark}>
              <PieChart
                data={pieChartData}
                title="Distribution by Status"
                isDark={isDark}
              />
            </ChartCard>
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
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => {
                  // Map color to Tailwind classes
                  const getColorClasses = (color) => {
                    switch (color) {
                      case "blue":
                        return {
                          bg: isDark ? "bg-blue-600/20" : "bg-blue-100",
                          text: isDark ? "text-blue-400" : "text-blue-700",
                        };
                      case "green":
                        return {
                          bg: isDark ? "bg-green-600/20" : "bg-green-100",
                          text: isDark ? "text-green-400" : "text-green-700",
                        };
                      case "purple":
                        return {
                          bg: isDark ? "bg-purple-600/20" : "bg-purple-100",
                          text: isDark ? "text-purple-400" : "text-purple-700",
                        };
                      case "yellow":
                        return {
                          bg: isDark ? "bg-yellow-600/20" : "bg-yellow-100",
                          text: isDark ? "text-yellow-400" : "text-yellow-700",
                        };
                      case "gray":
                        return {
                          bg: isDark ? "bg-gray-600/20" : "bg-gray-100",
                          text: isDark ? "text-gray-400" : "text-gray-700",
                        };
                      default:
                        return {
                          bg: isDark ? "bg-gray-600/20" : "bg-gray-100",
                          text: isDark ? "text-gray-400" : "text-gray-700",
                        };
                    }
                  };

                  const colorClasses = getColorClasses(activity.color);

                  return (
                    <div
                      key={activity.id}
                      className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                        isDark ? "bg-gray-700/50" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses.bg}`}
                        >
                          {activity.icon}
                        </div>
                        <div>
                          <p
                            className={`font-medium transition-colors ${
                              isDark ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {activity.type}
                          </p>
                          <p
                            className={`text-sm transition-colors ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {activity.user} • {activity.timeAgo}
                          </p>
                          {activity.tracking_number && (
                            <p
                              className={`text-xs transition-colors ${
                                isDark ? "text-gray-500" : "text-gray-500"
                              }`}
                            >
                              Tracking: {activity.tracking_number}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${colorClasses.bg} ${colorClasses.text}`}
                      >
                        {activity.status}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div
                  className={`text-center py-8 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <p className="text-lg">No recent activity</p>
                  <p className="text-sm mt-2">
                    Activity will appear here when shipments are created or
                    updated
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
