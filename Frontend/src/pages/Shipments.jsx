import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import Sidebar from "../components/Sidebar";
import MobileMenuButton from "../components/MobileMenuButton";
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

  const [shipments, setShipments] = useState([
    {
      id: 1,
      trackingId: "TRK123456",
      destination: "New York, USA",
      status: "In Transit",
      date: "2025-11-05",
    },
    {
      id: 2,
      trackingId: "TRK987654",
      destination: "Berlin, Germany",
      status: "Delivered",
      date: "2025-11-03",
    },
  ]);

  const [newShipment, setNewShipment] = useState({
    trackingId: "",
    destination: "",
    status: "",
    date: "",
  });

  const handleChange = (e) => {
    setNewShipment({ ...newShipment, [e.target.name]: e.target.value });
  };

  const handleAddShipment = (e) => {
    e.preventDefault();
    if (!newShipment.trackingId || !newShipment.destination) return;
    setShipments([...shipments, { ...newShipment, id: shipments.length + 1 }]);
    setNewShipment({ trackingId: "", destination: "", status: "", date: "" });
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                name="trackingId"
                value={newShipment.trackingId}
                onChange={handleChange}
                placeholder="Tracking ID"
                className={`border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
              <input
                type="text"
                name="destination"
                value={newShipment.destination}
                onChange={handleChange}
                placeholder="Destination"
                className={`border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
              <select
                name="status"
                value={newShipment.status}
                onChange={handleChange}
                className={`border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
              </select>
              <input
                type="date"
                name="date"
                value={newShipment.date}
                onChange={handleChange}
                className={`border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
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
            <table className="min-w-full border-collapse">
              <thead
                className={`uppercase text-sm ${
                  isDark
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Tracking ID</th>
                  <th className="p-3 text-left">Destination</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Date</th>
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
                      className={`p-3 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {shipment.id}
                    </td>
                    <td
                      className={`p-3 font-medium ${
                        isDark ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      {shipment.trackingId}
                    </td>
                    <td
                      className={`p-3 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {shipment.destination}
                    </td>
                    <td
                      className={`p-3 font-semibold ${
                        shipment.status === "Delivered"
                          ? isDark
                            ? "text-green-400"
                            : "text-green-600"
                          : shipment.status === "Pending"
                          ? isDark
                            ? "text-yellow-400"
                            : "text-yellow-600"
                          : isDark
                          ? "text-blue-400"
                          : "text-blue-600"
                      }`}
                    >
                      {shipment.status}
                    </td>
                    <td
                      className={`p-3 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {shipment.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipment;
