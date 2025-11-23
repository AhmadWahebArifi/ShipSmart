import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import Sidebar from "../components/Sidebar";
import MobileMenuButton from "../components/MobileMenuButton";
import Header from "../components/Header";
import axiosInstance from "../config/axios";

function Analytics() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const {
    sidebarOpen,
    sidebarCollapsed,
    toggleSidebar,
    closeSidebar,
    toggleSidebarCollapse,
  } = useSidebar();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [shipmentsRes, vehiclesRes] = await Promise.all([
          axiosInstance.get("/shipments"),
          axiosInstance.get("/vehicles"),
        ]);

        if (shipmentsRes.data?.success) {
          setShipments(shipmentsRes.data.shipments || []);
        }
        if (vehiclesRes.data?.success) {
          setVehicles(vehiclesRes.data.vehicles || []);
        }
      } catch (err) {
        console.error("Error loading analytics data", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load analytics data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Derived shipment metrics
  const routeStatsMap = shipments.reduce((acc, s) => {
    const from = s.from_province || "Unknown";
    const to = s.to_province || "Unknown";
    const key = `${from} → ${to}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const routesArray = Object.entries(routeStatsMap).map(([route, count]) => ({
    route,
    count,
  }));

  const sortedRoutes = [...routesArray].sort((a, b) => b.count - a.count);
  const topRoutes = sortedRoutes.slice(0, 10);
  const maxRouteCount = topRoutes.reduce(
    (max, r) => (r.count > max ? r.count : max),
    0
  );

  // Delivery time metrics (in hours)
  const deliveriesWithTime = shipments.filter(
    (s) => s.shipped_at && s.delivered_at
  );

  const deliveryTimesHours = deliveriesWithTime
    .map((s) => {
      const shipped = new Date(s.shipped_at).getTime();
      const delivered = new Date(s.delivered_at).getTime();
      const diffMs = delivered - shipped;
      return diffMs > 0 ? diffMs / (1000 * 60 * 60) : null;
    })
    .filter((v) => v !== null);

  const avgDeliveryTimeHours =
    deliveryTimesHours.length > 0
      ? deliveryTimesHours.reduce((sum, v) => sum + v, 0) /
        deliveryTimesHours.length
      : null;

  // Vehicle utilization metrics
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(
    (v) => v.status === "not_available"
  ).length;
  const availableVehicles = vehicles.filter(
    (v) => v.status === "available"
  ).length;
  const utilizationRate =
    totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0;

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
        <main className="p-4 sm:p-6 lg:p-8">
          <Header
            title={t("analytics.title", "Analytics Overview")}
            subtitle={t(
              "analytics.subtitle",
              "Deep-dive KPIs for routes, vehicles, customers, and operations. Real-time metrics are available on the Dashboard."
            )}
          />
          {loading && (
            <p className="mt-2 text-sm text-blue-500">
              {t("analytics.loading", "Loading analytics data...")}
            </p>
          )}
          {error && (
            <p className="mt-2 text-sm text-red-500">
              {t("analytics.error", "Failed to load analytics data:")} {error}
            </p>
          )}

          <div className="space-y-8">
            <section>
              <h3
                className={`text-lg font-semibold mb-4 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                1. {t("analytics.shipmentFlow", "Shipment Flow Analytics")}
              </h3>
              <div
                className={`rounded-xl p-4 border ${
                  isDark
                    ? "bg-gray-900 border-gray-800"
                    : "bg-white border-gray-200"
                }`}
              >
                <p className="text-sm font-medium mb-3">
                  {t(
                    "analytics.shipmentsPerRouteChart",
                    "Shipments per route (top 10)"
                  )}
                </p>
                {topRoutes.length === 0 && !loading && (
                  <p className="text-xs text-gray-500">
                    {t("analytics.noRouteData", "No shipment route data yet.")}
                  </p>
                )}
                <div className="space-y-2 mt-2">
                  {topRoutes.map((r) => {
                    const widthPercent =
                      maxRouteCount > 0 ? (r.count / maxRouteCount) * 100 : 0;
                    return (
                      <div key={r.route}>
                        <div className="flex justify-between text-xs mb-1">
                          <span
                            className={
                              isDark ? "text-gray-300" : "text-gray-700"
                            }
                          >
                            {r.route}
                          </span>
                          <span
                            className={
                              isDark ? "text-gray-400" : "text-gray-500"
                            }
                          >
                            {r.count}
                          </span>
                        </div>
                        <div
                          className={
                            isDark
                              ? "w-full bg-gray-800 h-2 rounded"
                              : "w-full bg-gray-100 h-2 rounded"
                          }
                        >
                          <div
                            className="h-2 rounded bg-blue-500"
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section>
              <h3
                className={`text-lg font-semibold mb-4 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                2.{" "}
                {t(
                  "analytics.vehicleUtilization",
                  "Vehicle Utilization Analytics"
                )}
              </h3>
              <div
                className={`rounded-xl p-4 border ${
                  isDark
                    ? "bg-gray-900 border-gray-800"
                    : "bg-white border-gray-200"
                }`}
              >
                <p className="text-sm font-medium mb-3">
                  {t(
                    "analytics.vehicleUtilizationBar",
                    "Vehicle utilization (active vs available)"
                  )}
                </p>
                <div className="flex justify-between text-xs mb-2">
                  <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                    {t("analytics.totalVehicles", "Total vehicles")}:{" "}
                    {totalVehicles}
                  </span>
                  <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                    {utilizationRate.toFixed(1)}%{" "}
                    {t("analytics.active", "active")}
                  </span>
                </div>
                <div
                  className={
                    isDark
                      ? "w-full bg-gray-800 h-3 rounded flex"
                      : "w-full bg-gray-100 h-3 rounded flex"
                  }
                >
                  <div
                    className="h-3 rounded-l bg-green-500"
                    style={{
                      width:
                        totalVehicles > 0
                          ? `${(availableVehicles / totalVehicles) * 100}%`
                          : "0%",
                    }}
                    title={t("analytics.available", "Available")}
                  />
                  <div
                    className="h-3 rounded-r bg-red-500"
                    style={{
                      width:
                        totalVehicles > 0
                          ? `${(activeVehicles / totalVehicles) * 100}%`
                          : "0%",
                    }}
                    title={t("analytics.active", "Active")}
                  />
                </div>
                <div className="flex justify-between text-[11px] mt-2">
                  <span
                    className={isDark ? "text-green-300" : "text-green-700"}
                  >
                    {t("analytics.availableVehicles", "Available: {{count}}", {
                      count: availableVehicles,
                    })}
                  </span>
                  <span className={isDark ? "text-red-300" : "text-red-700"}>
                    {t(
                      "analytics.activeVehicles",
                      "Active vehicles (on route)"
                    )}
                    : {activeVehicles}
                  </span>
                </div>
              </div>
            </section>

            <section>
              <h3
                className={`text-lg font-semibold mb-4 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                3. {t("analytics.deliveryTime", "Delivery Time Performance")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`rounded-xl p-4 border ${
                    isDark
                      ? "bg-gray-900 border-gray-800"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <p className="text-sm font-medium mb-1">
                    {t(
                      "analytics.avgDeliveryTime",
                      "Average delivery time (hours)"
                    )}
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {avgDeliveryTimeHours !== null
                      ? avgDeliveryTimeHours.toFixed(1)
                      : "-"}
                  </p>
                </div>
                <div
                  className={`rounded-xl p-4 border ${
                    isDark
                      ? "bg-gray-900 border-gray-800"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <p className="text-sm font-medium mb-1">
                    {t(
                      "analytics.completedDeliveries",
                      "Completed deliveries with time data"
                    )}
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {deliveryTimesHours.length}
                  </p>
                </div>
                <div
                  className={`rounded-xl p-4 border ${
                    isDark
                      ? "bg-gray-900 border-gray-800"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <p className="text-sm font-medium mb-1">
                    {t(
                      "analytics.totalShipmentsCount",
                      "Total shipments in dataset"
                    )}
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {shipments.length}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Analytics;
