import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import { useTranslation } from "react-i18next";
import { useLoader } from "../context/LoaderContext";
import { usePermission } from "../context/PermissionContext";
import Sidebar from "../components/Sidebar";
import MobileMenuButton from "../components/MobileMenuButton";
import Header from "../components/Header";
import VehicleForm from "../components/VehicleForm";
import {
  FiTruck,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiFilter,
  FiSearch,
} from "react-icons/fi";
import axiosInstance from "../config/axios";
import Swal from "sweetalert2";

const Vehicles = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { showLoaderWithText } = useLoader();
  const { hasPermission } = usePermission();
  const { sidebarOpen, closeSidebar, sidebarCollapsed, toggleSidebar } =
    useSidebar();

  // State
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    showLoaderWithText("Loading Vehicles...", 1500);
    fetchVehicles();
  }, []); // Empty dependency array to run only once

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/vehicles");
      if (response.data && response.data.success) {
        setVehicles(response.data.vehicles || []);
      }
    } catch (err) {
      setError(t("vehicles.errors.fetchFailed"));
      console.error("Error fetching vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = (newVehicle) => {
    // Check if user has permission to create vehicles
    if (!hasPermission('create_vehicle')) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: t("common.noPermission"),
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }
    
    setVehicles([newVehicle, ...vehicles]);
    setShowAddForm(false);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: t("vehicles.success.added"),
      showConfirmButton: false,
      timer: 3000,
    });
  };

  const handleUpdateVehicle = async (updatedVehicle) => {
    // Check if user has permission to update vehicles
    if (!hasPermission('update_vehicle')) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: t("common.noPermission"),
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }
    
    try {
      const response = await axiosInstance.put(
        `/vehicles/${updatedVehicle.id}`,
        updatedVehicle
      );
      if (response.data && response.data.success) {
        setVehicles(
          vehicles.map((v) =>
            v.id === updatedVehicle.id ? response.data.vehicle : v
          )
        );
        setEditingVehicle(null);
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: t("vehicles.success.updated"),
          showConfirmButton: false,
          timer: 3000,
        });
      }
    } catch (err) {
      console.error("Error updating vehicle:", err);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: err.response?.data?.message || t("common.errors.generic"),
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    // Check if user has permission to delete vehicles
    if (!hasPermission('delete_vehicle')) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: t("common.noPermission"),
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }
    
    const result = await Swal.fire({
      title: t("vehicles.confirmDeleteTitle"),
      text: t("vehicles.confirmDelete"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("common.delete"),
      cancelButtonText: t("common.cancel"),
    });

    if (!result.isConfirmed) return;

    try {
      await axiosInstance.delete(`/vehicles/${vehicleId}`);
      setVehicles(vehicles.filter((v) => v.id !== vehicleId));
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: t("vehicles.success.deleted"),
        showConfirmButton: false,
        timer: 3000,
      });
    } catch (err) {
      console.error("Error deleting vehicle:", err);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: err.response?.data?.message || t("common.errors.generic"),
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      searchTerm === "" ||
      vehicle.vehicle_id.toLowerCase().includes(searchLower) ||
      vehicle.type.toLowerCase().includes(searchLower) ||
      (vehicle.driver_name &&
        vehicle.driver_name.toLowerCase().includes(searchLower))
    );
  });

  // Calculate totals
  const totalVehicles = filteredVehicles.length;
  const availableVehicles = filteredVehicles.filter(
    (v) => v.status === "available"
  ).length;
  const totalCapacity = filteredVehicles.reduce(
    (sum, v) => sum + (parseFloat(v.capacity) || 0),
    0
  );

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "not_available":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

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
        onToggleCollapse={toggleSidebar}
      />

      <MobileMenuButton onClick={toggleSidebar} isDark={isDark} />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen || !sidebarCollapsed ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          <Header
            title={t("vehicles.title")}
            subtitle={`${totalVehicles} ${t("vehicles.items")}`}
          />

          {/* Add/Edit Vehicle Form */}
          {(showAddForm || editingVehicle) && (
            <div className="mb-4 sm:mb-6">
              <VehicleForm
                onSubmit={
                  editingVehicle ? handleUpdateVehicle : handleAddVehicle
                }
                onCancel={() => {
                  setShowAddForm(false);
                  setEditingVehicle(null);
                }}
                vehicle={editingVehicle}
              />
            </div>
          )}

          {/* Search */}
          <div
            className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg ${
              isDark ? "bg-gray-800" : "bg-white shadow"
            }`}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`block w-full pl-9 sm:pl-10 pr-3 py-2 border text-sm ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    : "border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                } rounded-md`}
                placeholder={t("vehicles.searchPlaceholder")}
              />
            </div>
          </div>

          {/* Add Vehicle Button Above List */}
          {!showAddForm && !editingVehicle && hasPermission('create_vehicle') && (
            <div className="mb-4 sm:mb-6">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus className="-ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">{t("vehicles.addVehicle")}</span>
                <span className="xs:hidden">Add</span>
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div
              className={`p-3 sm:p-4 rounded-lg ${
                isDark ? "bg-gray-800" : "bg-white shadow"
              }`}
            >
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <FiTruck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("vehicles.stats.totalVehicles")}
                  </p>
                  <p
                    className={`text-lg sm:text-2xl font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {totalVehicles}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-3 sm:p-4 rounded-lg ${
                isDark ? "bg-gray-800" : "bg-white shadow"
              }`}
            >
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <FiTruck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("vehicles.stats.availableVehicles")}
                  </p>
                  <p
                    className={`text-lg sm:text-2xl font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {availableVehicles}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-3 sm:p-4 rounded-lg ${
                isDark ? "bg-gray-800" : "bg-white shadow"
              }`}
            >
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <FiTruck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("vehicles.stats.totalCapacity")}
                  </p>
                  <p
                    className={`text-lg sm:text-2xl font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {totalCapacity.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Add/Edit Vehicle Form */}
          {(showAddForm || editingVehicle) && (
            <div className="mb-6">
              <VehicleForm
                onSubmit={
                  editingVehicle ? handleUpdateVehicle : handleAddVehicle
                }
                onCancel={() => {
                  setShowAddForm(false);
                  setEditingVehicle(null);
                }}
                vehicle={editingVehicle}
              />
            </div>
          )}

          {/* Search */}
          <div
            className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg ${
              isDark ? "bg-gray-800" : "bg-white shadow"
            }`}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`block w-full pl-9 sm:pl-10 pr-3 py-2 border text-sm ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    : "border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                } rounded-md`}
                placeholder={t("vehicles.searchPlaceholder")}
              />
            </div>
          </div>

          {/* Vehicles Table */}
          <div
            className={`overflow-hidden rounded-lg shadow ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {t("common.loading")}...
                </p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-600 dark:text-red-400">
                {error}
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="p-8 text-center">
                <FiTruck className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  {t("vehicles.noVehicles")}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t("vehicles.getStarted")}
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiPlus className="-ml-1 mr-2 h-4 w-4" />
                    {t("vehicles.addVehicle")}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop & Large Tablet Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead
                      className={`${
                        isDark
                          ? "bg-gray-800 text-gray-200"
                          : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      <tr>
                        <th
                          scope="col"
                          className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDark ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          {t("vehicles.table.vehicleId")}
                        </th>
                        <th
                          scope="col"
                          className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDark ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          {t("vehicles.table.type")}
                        </th>
                        <th
                          scope="col"
                          className={`hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDark ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          {t("vehicles.table.driverName")}
                        </th>
                        <th
                          scope="col"
                          className={`px-3 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                            isDark ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          {t("vehicles.table.capacity")} (kg)
                        </th>
                        <th
                          scope="col"
                          className={`px-3 sm:px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                            isDark ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          {t("vehicles.table.status")}
                        </th>
                        <th scope="col" className="relative px-3 sm:px-6 py-3">
                          <span className="sr-only">{t("common.actions")}</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y ${
                        isDark
                          ? "divide-gray-700 bg-gray-900"
                          : "divide-gray-200 bg-white"
                      }`}
                    >
                      {filteredVehicles.map((vehicle) => (
                        <tr
                          key={vehicle.id}
                          className={
                            isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"
                          }
                        >
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className={`flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-md flex items-center justify-center ${
                                  isDark
                                    ? "bg-blue-900/30 text-blue-400"
                                    : "bg-blue-100 text-blue-600"
                                }`}
                              >
                                <FiTruck className="h-4 w-4 sm:h-5 sm:w-5" />
                              </div>
                              <div className="ml-2 sm:ml-4">
                                <div
                                  className={`text-xs sm:text-sm font-medium ${
                                    isDark ? "text-gray-200" : "text-gray-900"
                                  }`}
                                >
                                  {vehicle.vehicle_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td
                            className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${
                              isDark ? "text-gray-200" : "text-gray-900"
                            }`}
                          >
                            {vehicle.type}
                          </td>
                          <td
                            className={`hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${
                              isDark ? "text-gray-200" : "text-gray-900"
                            }`}
                          >
                            {vehicle.driver_name || "-"}
                          </td>
                          <td
                            className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm ${
                              isDark ? "text-gray-200" : "text-gray-900"
                            }`}
                          >
                            {parseFloat(vehicle.capacity).toFixed(2)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                vehicle.status
                              )}`}
                            >
                              {t(`vehicles.status.${vehicle.status}`) ||
                                vehicle.status.replace("_", " ")}
                            </span>
                          </td>
                          <td
                            className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium ${
                              isDark ? "text-gray-200" : "text-gray-900"
                            }`}
                          >
                            <div className="flex justify-end space-x-1 sm:space-x-2">
                              {hasPermission('update_vehicle') && (
                                <button
                                  onClick={() => setEditingVehicle(vehicle)}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                  title={t("common.edit")}
                                >
                                  <FiEdit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                              )}
                              {hasPermission('delete_vehicle') && (
                                <button
                                  onClick={() => handleDeleteVehicle(vehicle.id)}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  title={t("common.delete")}
                                >
                                  <FiTrash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tablet & Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {filteredVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className={`rounded-lg border p-4 transition-all hover:shadow-md ${
                        isDark
                          ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {/* Header with vehicle ID and status */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div
                            className={`flex-shrink-0 h-8 w-8 rounded-md flex items-center justify-center ${
                              isDark
                                ? "bg-blue-900/30 text-blue-400"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            <FiTruck className="h-4 w-4" />
                          </div>
                          <span className={`font-semibold text-sm truncate ${
                            isDark ? "text-gray-200" : "text-gray-900"
                          }`}>
                            {vehicle.vehicle_id}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${getStatusColor(
                            vehicle.status
                          )}`}
                        >
                          {t(`vehicles.status.${vehicle.status}`) ||
                            vehicle.status.replace("_", " ")}
                        </span>
                      </div>

                      {/* Vehicle Details - Responsive Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                        <div className="min-w-0">
                          <span className={`block ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {t("vehicles.table.type")}
                          </span>
                          <span className={`block font-medium truncate ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}>
                            {vehicle.type}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className={`block ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {t("vehicles.table.capacity")} (kg)
                          </span>
                          <span className={`block font-medium truncate ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}>
                            {parseFloat(vehicle.capacity).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Driver Name */}
                      {vehicle.driver_name && (
                        <div className="mb-3">
                          <span className={`block text-xs ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {t("vehicles.table.driverName")}
                          </span>
                          <span className={`block text-xs sm:text-sm font-medium ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}>
                            {vehicle.driver_name}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                        {/* Edit Button */}
                        {hasPermission('update_vehicle') && (
                          <button
                            onClick={() => setEditingVehicle(vehicle)}
                            className={`flex-1 flex items-center justify-center gap-1 p-2 rounded text-xs ${
                              isDark
                                ? "text-blue-400 hover:bg-gray-600"
                                : "text-blue-600 hover:bg-gray-200"
                            }`}
                            title={t("common.edit")}
                          >
                            <FiEdit2 className="w-4 h-4" />
                            <span>{t("common.edit")}</span>
                          </button>
                        )}

                        {/* Delete Button */}
                        {hasPermission('delete_vehicle') && (
                          <button
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            className={`flex-1 flex items-center justify-center gap-1 p-2 rounded text-xs ${
                              isDark
                                ? "text-red-400 hover:bg-gray-600"
                                : "text-red-600 hover:bg-gray-200"
                            }`}
                            title={t("common.delete")}
                          >
                            <FiTrash2 className="w-4 h-4" />
                            <span>{t("common.delete")}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vehicles;
