import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import Sidebar from "../components/Sidebar";
import MobileMenuButton from "../components/MobileMenuButton";
import axiosInstance from "../config/axios";
import { HiCube } from "react-icons/hi2";

const Shipment = () => {
  const { isDark } = useTheme();
  const {
    sidebarOpen,
    sidebarCollapsed,
    toggleSidebar,
    closeSidebar,
    toggleSidebarCollapse,
  } = useSidebar();

  const [shipments, setShipments] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newShipment, setNewShipment] = useState({
    from_province: "",
    to_province: "",
    description: "",
  });

  // Fetch shipments and provinces when component mounts
  useEffect(() => {
    fetchShipments();
    fetchProvinces();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/shipments");
      if (response.data && response.data.success) {
        setShipments(response.data.shipments);
      }
    } catch (err) {
      setError("Failed to fetch shipments");
      console.error("Error fetching shipments:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      const response = await axiosInstance.get("/shipments/provinces");
      if (response.data && response.data.success) {
        setProvinces(response.data.provinces);
      }
    } catch (err) {
      setError("Failed to fetch provinces");
      console.error("Error fetching provinces:", err);
    }
  };

  const handleChange = (e) => {
    setNewShipment({ ...newShipment, [e.target.name]: e.target.value });
  };

  const handleAddShipment = async (e) => {
    e.preventDefault();
    if (!newShipment.from_province || !newShipment.to_province) return;

    try {
      const response = await axiosInstance.post("/shipments", newShipment);
      if (response.data && response.data.success) {
        // Refresh the shipments list
        fetchShipments();
        // Reset form
        setNewShipment({ from_province: "", to_province: "", description: "" });
      }
    } catch (err) {
      setError("Failed to create shipment");
      console.error("Error creating shipment:", err);
    }
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
                <HiCube className="w-6 h-6" />
              </div>
              <h1
                className={`text-3xl font-bold transition-colors ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                📦 Shipments
              </h1>
            </div>
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

          {/* Add Shipment Form */}
          <form
            onSubmit={handleAddShipment}
            className={`rounded-xl shadow-lg border p-6 mb-8 transition-all duration-300 ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h2
              className={`text-xl font-semibold mb-4 transition-colors ${
                isDark ? "text-white" : "text-gray-700"
              }`}
            >
              Add New Shipment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  From Province
                </label>
                <select
                  name="from_province"
                  value={newShipment.from_province}
                  onChange={handleChange}
                  required
                  className={`border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="">Select Province</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  To Province
                </label>
                <select
                  name="to_province"
                  value={newShipment.to_province}
                  onChange={handleChange}
                  required
                  className={`border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="">Select Province</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-3">
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Description
                </label>
                <textarea
                  name="description"
                  value={newShipment.description}
                  onChange={handleChange}
                  placeholder="Shipment description"
                  rows={3}
                  className={`border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none resize-none ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
            >
              Add Shipment
            </button>
          </form>

          {/* Shipment Table */}
          <div
            className={`rounded-xl shadow-lg border overflow-hidden transition-all duration-300 ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p
                  className={`mt-4 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Loading shipments...
                </p>
              </div>
            ) : (
              <>
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
                    Shipments ({shipments.length})
                  </h2>
                </div>
                {shipments.length === 0 ? (
                  <div className="p-8 text-center">
                    <p
                      className={`${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      No shipments found. Add a new shipment to get started.
                    </p>
                  </div>
                ) : (
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
                          <th className="p-3 text-left">Tracking #</th>
                          <th className="p-3 text-left">From</th>
                          <th className="p-3 text-left">To</th>
                          <th className="p-3 text-left">Status</th>
                          <th className="p-3 text-left">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shipments.map((shipment) => (
                          <tr
                            key={shipment.id}
                            className={`border-t transition ${
                              isDark
                                ? "border-gray-700 hover:bg-gray-700/50"
                                : "border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <td
                              className={`p-3 font-medium ${
                                isDark ? "text-blue-400" : "text-blue-600"
                              }`}
                            >
                              {shipment.tracking_number}
                            </td>
                            <td
                              className={`p-3 ${
                                isDark ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              {shipment.from_province}
                            </td>
                            <td
                              className={`p-3 ${
                                isDark ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              {shipment.to_province}
                            </td>
                            <td
                              className={`p-3 font-semibold ${
                                shipment.status === "delivered"
                                  ? isDark
                                    ? "text-green-400"
                                    : "text-green-600"
                                  : shipment.status === "in_progress"
                                  ? isDark
                                    ? "text-yellow-400"
                                    : "text-yellow-600"
                                  : isDark
                                  ? "text-blue-400"
                                  : "text-blue-600"
                              }`}
                            >
                              {shipment.status.replace("_", " ")}
                            </td>
                            <td
                              className={`p-3 ${
                                isDark ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              {new Date(
                                shipment.created_at
                              ).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipment;
