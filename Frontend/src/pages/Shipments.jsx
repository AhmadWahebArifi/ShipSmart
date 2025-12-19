import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import { useLoader } from "../context/LoaderContext";
import Sidebar from "../components/Sidebar";
import MobileMenuButton from "../components/MobileMenuButton";
import Header from "../components/Header";
import ShipmentForm from "../components/ShipmentForm";
import EditShipmentModal from "../components/EditShipmentModal";
import ShipmentDetailPopup from "../components/ShipmentDetailPopup";
import ShipmentPrint from "../components/ShipmentPrint";
import axiosInstance from "../config/axios";
import { exportShipmentsToExcel } from "../utils/exportToExcel";
import {
  HiCube,
  HiPencil,
  HiTrash,
  HiRefresh,
  HiCheck,
  HiX,
  HiTruck,
  HiEye,
  HiMap,
  HiPrinter,
  HiDocumentArrowDown,
} from "react-icons/hi2";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

// Afghanistan provinces list
const PROVINCES = [
  "Kabul",
  "Herat",
  "Kandahar",
  "Balkh",
  "Nangarhar",
  "Badghis",
  "Badakhshan",
  "Baghlan",
  "Bamyan",
  "Daykundi",
  "Farah",
  "Faryab",
  "Ghazni",
  "Ghor",
  "Helmand",
  "Jowzjan",
  "Kapisa",
  "Khost",
  "Kunar",
  "Kunduz",
  "Laghman",
  "Logar",
  "Nimruz",
  "Nuristan",
  "Paktia",
  "Paktika",
  "Panjshir",
  "Parwan",
  "Samangan",
  "Sar-e Pol",
  "Takhar",
  "Uruzgan",
  "Wardak",
  "Zabul",
];

const Shipments = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { showLoaderWithText } = useLoader(); // Added loader hook
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    sidebarOpen,
    sidebarCollapsed,
    toggleSidebar,
    closeSidebar,
    toggleSidebarCollapse,
  } = useSidebar();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentShipment, setCurrentShipment] = useState(null);
  const [detailPopupOpen, setDetailPopupOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [routePopupShipment, setRoutePopupShipment] = useState(null); // New state for route popup
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedShipmentForPrint, setSelectedShipmentForPrint] = useState(null);

  const showAlert = (title, message, type = "success") => {
    MySwal.fire({
      title: title,
      text: message,
      icon: type,
      confirmButtonText: t("common.ok"),
      customClass: {
        confirmButton:
          "bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md",
      },
      buttonsStyling: false,
    });
  };

  // Handle adding a new shipment from the form
  const handleAddShipmentFromForm = (newShipment) => {
    setShipments([newShipment, ...shipments]);
    setShowAddForm(false);
    showAlert(t("common.success"), t("shipments.success.added"), "success");
  };

  // Handle opening shipment detail popup
  const handleViewShipment = (shipment) => {
    setSelectedShipment(shipment);
    setDetailPopupOpen(true);
  };

  // Handle opening print modal
  const handlePrintShipment = (shipment) => {
    setSelectedShipmentForPrint(shipment);
    setPrintModalOpen(true);
  };

  // Handle closing print modal
  const handleClosePrintModal = () => {
    setPrintModalOpen(false);
    setSelectedShipmentForPrint(null);
  };

  // Handle Excel export
  const handleExportToExcel = () => {
    try {
      exportShipmentsToExcel(shipments, t);
      showAlert(t("common.success"), t("shipments.excelExportSuccess"), "success");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      showAlert(t("common.errors.generic"), t("shipments.excelExportError"), "error");
    }
  };

  // Handle updating a shipment
  const handleUpdateShipment = async (updatedShipment) => {
    try {
      setShipments(
        shipments.map((s) =>
          s.id === updatedShipment.id ? updatedShipment : s
        )
      );
      setEditingShipment(null);
      showAlert(t("common.success"), t("shipments.success.updated"), "success");
    } catch (err) {
      console.error("Error updating shipment:", err);
      showAlert(
        t("common.errors.generic"),
        err.response?.data?.message || t("shipments.errors.updateFailed"),
        "error"
      );
    }
  };

  // Fetch shipments when component mounts
  useEffect(() => {
    showLoaderWithText("Loading Shipments...", 1500);
    fetchShipments();
  }, []); // Empty dependency array to run only once

  // Handle URL parameter for specific shipment
  useEffect(() => {
    if (id && shipments.length > 0 && !loading) {
      const shipment = shipments.find((s) => s.id === parseInt(id));

      if (shipment) {
        // Just highlight the shipment by adding a temporary class or state
        setCurrentShipment(shipment);
        // Scroll to the shipment after a short delay
        setTimeout(() => {
          const element = document.getElementById(`shipment-${shipment.id}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            // Add highlight effect
            element.classList.add("ring-2", "ring-blue-500");
            setTimeout(() => {
              element.classList.remove("ring-2", "ring-blue-500");
            }, 3000);
          }
        }, 500);
        // Clear the URL parameter after highlighting
        navigate("/shipments", { replace: true });
      }
    }
  }, [id, shipments, navigate, loading]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/shipments");
      if (response.data && response.data.success) {
        setShipments(response.data.shipments);
      }
    } catch (err) {
      setError(t("shipments.errors.fetchFailed"));
      console.error("Error fetching shipments:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (shipmentId, newStatus) => {
    try {
      const result = await MySwal.fire({
        title: t("shipments.confirmStatusChangeTitle"),
        text: t("shipments.confirmStatusChange", {
          status: t(`shipments.status.${newStatus}`),
        }),
        icon: "question",
        showCancelButton: true,
        confirmButtonText: t("shipments.confirmStatusChangeTitle"),
        cancelButtonText: t("shipments.form.cancel"),
        customClass: {
          confirmButton:
            "bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md mr-2",
          cancelButton:
            "bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md",
        },
        buttonsStyling: false,
      });

      if (!result.isConfirmed) return;

      const response = await axiosInstance.put(
        `/shipments/${shipmentId}/status`,
        {
          status: newStatus,
        }
      );

      if (response.data && response.data.success) {
        // Update the shipment in the state
        setShipments((prevShipments) =>
          prevShipments.map((shipment) =>
            shipment.id === shipmentId
              ? { ...shipment, status: newStatus }
              : shipment
          )
        );
        setError(""); // Clear any previous errors
        showAlert(
          t("common.success"),
          t("shipments.success.statusUpdated"),
          "success"
        );
      } else {
        setError(
          response.data.message || t("shipments.errors.statusUpdateFailed")
        );
        showAlert(
          t("common.errors.generic"),
          response.data.message || t("shipments.errors.statusUpdateFailed"),
          "error"
        );
      }
    } catch (err) {
      console.error("Error updating shipment status:", err);
      if (err.response && err.response.data) {
        setError(
          err.response.data.message || t("shipments.errors.statusUpdateFailed")
        );
        showAlert(
          t("common.errors.generic"),
          err.response.data.message || t("shipments.errors.statusUpdateFailed"),
          "error"
        );
      } else {
        setError(t("shipments.errors.statusUpdateFailed"));
        showAlert(
          t("common.errors.generic"),
          t("shipments.errors.statusUpdateFailed"),
          "error"
        );
      }
    }
  };

  // Handle edit shipment
  const handleEditShipment = async (shipmentId, updatedData) => {
    try {
      const response = await axiosInstance.put(
        `/shipments/${shipmentId}`,
        updatedData
      );

      if (response.data && response.data.success) {
        // Update the shipment in the state
        setShipments((prevShipments) =>
          prevShipments.map((shipment) =>
            shipment.id === shipmentId
              ? { ...shipment, ...updatedData }
              : shipment
          )
        );
        setError(""); // Clear any previous errors
        showAlert(
          t("common.success"),
          t("shipments.success.updated"),
          "success"
        );
        return { success: true };
      } else {
        setError(response.data.message || t("shipments.errors.updateFailed"));
        showAlert(
          t("common.errors.generic"),
          response.data.message || t("shipments.errors.updateFailed"),
          "error"
        );
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error updating shipment:", err);
      if (err.response && err.response.data) {
        setError(
          err.response.data.message || t("shipments.errors.updateFailed")
        );
        showAlert(
          t("common.errors.generic"),
          err.response.data.message || t("shipments.errors.updateFailed"),
          "error"
        );
        return { success: false, message: err.response.data.message };
      } else {
        setError(t("shipments.errors.updateFailed"));
        showAlert(
          t("common.errors.generic"),
          t("shipments.errors.updateFailed"),
          "error"
        );
        return {
          success: false,
          message: t("shipments.errors.updateFailed"),
        };
      }
    }
  };

  // Handle delete shipment
  const handleDeleteShipment = async (shipmentId) => {
    try {
      const result = await MySwal.fire({
        title: t("shipments.confirmDeleteTitle"),
        text: t("shipments.confirmDelete"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("shipments.confirmDeleteTitle"),
        cancelButtonText: t("shipments.form.cancel"),
        customClass: {
          confirmButton:
            "bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md mr-2",
          cancelButton:
            "bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md",
        },
        buttonsStyling: false,
      });

      if (!result.isConfirmed) return;

      const response = await axiosInstance.delete(`/shipments/${shipmentId}`);

      if (response.data && response.data.success) {
        // Remove the shipment from the state
        setShipments((prevShipments) =>
          prevShipments.filter((shipment) => shipment.id !== shipmentId)
        );
        setError(""); // Clear any previous errors
        showAlert(
          t("common.success"),
          t("shipments.success.deleted"),
          "success"
        );
      } else {
        setError(response.data.message || t("shipments.errors.deleteFailed"));
        showAlert(
          t("common.errors.generic"),
          response.data.message || t("shipments.errors.deleteFailed"),
          "error"
        );
      }
    } catch (err) {
      console.error("Error deleting shipment:", err);
      if (err.response && err.response.data) {
        setError(
          err.response.data.message || t("shipments.errors.deleteFailed")
        );
        showAlert(
          t("common.errors.generic"),
          err.response.data.message || t("shipments.errors.deleteFailed"),
          "error"
        );
      } else {
        setError(t("shipments.errors.deleteFailed"));
        showAlert(
          t("common.errors.generic"),
          t("shipments.errors.deleteFailed"),
          "error"
        );
      }
    }
  };

  // Open edit modal
  const openEditModal = (shipment) => {
    setCurrentShipment(shipment);
    setEditModalOpen(true);
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditModalOpen(false);
    setCurrentShipment(null);
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
            <Header title={`📦 ${t("shipments.title")}`} />

            {/* Add Shipment Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <HiCube className="-ml-1 mr-2 h-4 w-4" />
                {t("shipments.addNewShipment")}
              </button>
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

            {/* Add/Edit Shipment Form */}
            {(showAddForm || editingShipment) && (
              <div className="mb-6">
                <ShipmentForm
                  onSubmit={
                    editingShipment
                      ? handleUpdateShipment
                      : handleAddShipmentFromForm
                  }
                  onCancel={() => {
                    setShowAddForm(false);
                    setEditingShipment(null);
                  }}
                  shipment={editingShipment}
                />
              </div>
            )}

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
                    {t("common.loading")}...
                  </p>
                </div>
              ) : (
                <>
                  <div
                    className={`px-6 py-4 border-b ${
                      isDark ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h2
                        className={`text-lg font-semibold ${
                          isDark ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {t("shipments.title")} ({shipments.length})
                      </h2>
                      <div className="flex items-center space-x-3">
                        {/* Excel Export Button */}
                        <button
                          onClick={handleExportToExcel}
                          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                            isDark
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-green-600 hover:bg-green-700 text-white"
                          }`}
                          title={t("shipments.exportToExcel")}
                        >
                          <HiDocumentArrowDown className="w-4 h-4 mr-2" />
                          {t("common.export")}
                        </button>
                      </div>
                    </div>
                  </div>
                  {shipments.length === 0 ? (
                    <div className="p-8 text-center">
                      <p
                        className={`${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {t("shipments.noShipments")} {t("shipments.getStarted")}
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
                            <th className="p-3 text-left">
                              {t("shipments.table.trackingNumber")}
                            </th>
                            <th className="p-3 text-left">
                              {t("shipments.table.from")}
                            </th>
                            <th className="p-3 text-left">
                              {t("shipments.table.to")}
                            </th>
                            <th className="p-3 text-left">
                              {t("shipments.table.route")}
                            </th>
                            <th className="p-3 text-left">
                              {t("shipments.table.expectedDeparture")}
                            </th>
                            <th className="p-3 text-left">
                              {t("shipments.table.expectedArrival")}
                            </th>
                            <th className="p-3 text-left">
                              {t("shipments.table.status")}
                            </th>
                            <th className="p-3 text-left">
                              {t("shipments.table.created")}
                            </th>
                            <th className="p-3 text-left">
                              {t("shipments.table.vehicle")}
                            </th>
                            <th className="p-3 text-left">
                              {t("shipments.table.actions")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {shipments.map((shipment) => (
                            <tr
                              key={shipment.id}
                              id={`shipment-${shipment.id}`}
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
                                className={`p-3 ${
                                  isDark ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                {shipment.route_info ? (
                                  <button
                                    onClick={() =>
                                      setRoutePopupShipment(shipment)
                                    }
                                    className={`flex items-center gap-1 p-1 rounded ${
                                      isDark
                                        ? "text-blue-400 hover:bg-gray-600"
                                        : "text-blue-600 hover:bg-gray-200"
                                    }`}
                                    title={t("shipments.viewRoute")}
                                  >
                                    <HiMap className="w-4 h-4" />
                                    <span className="text-xs">
                                      {t("shipments.routeHopsCount", {
                                        count: shipment.route_hops || 0,
                                      })}
                                    </span>
                                  </button>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td
                                className={`p-3 ${
                                  isDark ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                {shipment.expected_departure_date
                                  ? new Date(
                                      shipment.expected_departure_date
                                    ).toLocaleDateString()
                                  : "-"}
                              </td>
                              <td
                                className={`p-3 ${
                                  isDark ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                {shipment.expected_arrival_date
                                  ? new Date(
                                      shipment.expected_arrival_date
                                    ).toLocaleDateString()
                                  : "-"}
                              </td>
                              <td
                                className={`p-3 font-semibold ${
                                  shipment.status === "delivered"
                                    ? isDark
                                      ? "text-green-400"
                                      : "text-green-600"
                                    : shipment.status === "in_progress" ||
                                      shipment.status === "on_route"
                                    ? isDark
                                      ? "text-yellow-400"
                                      : "text-yellow-600"
                                    : shipment.status === "canceled"
                                    ? isDark
                                      ? "text-red-400"
                                      : "text-red-600"
                                    : isDark
                                    ? "text-blue-400"
                                    : "text-blue-600"
                                }`}
                              >
                                {t(`shipments.status.${shipment.status}`)}
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
                              <td
                                className={`p-3 ${
                                  isDark ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                {shipment.vehicle ? (
                                  <div className="flex items-center gap-1">
                                    <HiTruck className="w-4 h-4" />
                                    <span>{shipment.vehicle.vehicle_id}</span>
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="p-3">
                                <div className="flex space-x-2">
                                  {/* Status Change Dropdown */}
                                  <select
                                    value={shipment.status}
                                    onChange={(e) =>
                                      handleStatusChange(
                                        shipment.id,
                                        e.target.value
                                      )
                                    }
                                    className={`border rounded px-2 py-1 text-sm ${
                                      isDark
                                        ? "bg-gray-700 border-gray-600 text-white"
                                        : "bg-white border-gray-300 text-gray-900"
                                    }`}
                                  >
                                    <option value="pending">
                                      {t("shipments.status.pending")}
                                    </option>
                                    <option value="in_progress">
                                      {t("shipments.status.in_progress")}
                                    </option>
                                    <option value="on_route">
                                      {t("shipments.status.on_route")}
                                    </option>
                                    <option value="delivered">
                                      {t("shipments.status.delivered")}
                                    </option>
                                    <option value="canceled">
                                      {t("shipments.status.canceled")}
                                    </option>
                                  </select>

                                  {/* View Button */}
                                  <button
                                    onClick={() => handleViewShipment(shipment)}
                                    className={`p-1 rounded ${
                                      isDark
                                        ? "text-green-400 hover:bg-gray-600"
                                        : "text-green-600 hover:bg-gray-200"
                                    }`}
                                    title="View Details"
                                  >
                                    <HiEye className="w-4 h-4" />
                                  </button>

                                  {/* Print Button */}
                                  <button
                                    onClick={() => handlePrintShipment(shipment)}
                                    className={`p-1 rounded ${
                                      isDark
                                        ? "text-purple-400 hover:bg-gray-600"
                                        : "text-purple-600 hover:bg-gray-200"
                                    }`}
                                    title={t("common.print")}
                                  >
                                    <HiPrinter className="w-4 h-4" />
                                  </button>

                                  {/* Edit Button */}
                                  {shipment.status !== "delivered" &&
                                    shipment.status !== "on_route" &&
                                    shipment.status !== "canceled" && (
                                      <button
                                        onClick={() => openEditModal(shipment)}
                                        className={`p-1 rounded ${
                                          isDark
                                            ? "text-blue-400 hover:bg-gray-600"
                                            : "text-blue-600 hover:bg-gray-200"
                                        }`}
                                        title={t("common.edit")}
                                      >
                                        <HiPencil className="w-4 h-4" />
                                      </button>
                                    )}

                                  {/* Delete Button */}
                                  <button
                                    onClick={() =>
                                      handleDeleteShipment(shipment.id)
                                    }
                                    className={`p-1 rounded ${
                                      isDark
                                        ? "text-red-400 hover:bg-gray-600"
                                        : "text-red-600 hover:bg-gray-200"
                                    }`}
                                    title={t("common.delete")}
                                  >
                                    <HiTrash className="w-4 h-4" />
                                  </button>
                                </div>
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

      {/* Edit Shipment Modal */}
      <EditShipmentModal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        shipment={currentShipment}
        onSave={handleEditShipment}
        isDark={isDark}
      />
      <ShipmentDetailPopup
        shipment={selectedShipment}
        isOpen={detailPopupOpen}
        onClose={() => setDetailPopupOpen(false)}
      />

      {/* Shipment Print Modal */}
      {selectedShipmentForPrint && (
        <ShipmentPrint
          shipment={selectedShipmentForPrint}
          isOpen={printModalOpen}
          onClose={handleClosePrintModal}
        />
      )}

      {/* Route Popup */}
      {routePopupShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setRoutePopupShipment(null)}
          ></div>
          <div
            className={`relative rounded-xl shadow-2xl max-w-md w-full ${
              isDark
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"
            }`}
          >
            <div
              className={`flex items-center justify-between p-4 border-b ${
                isDark ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <h3
                className={`text-lg font-semibold ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                {t("shipments.routeInfo")}
              </h3>
              <button
                onClick={() => setRoutePopupShipment(null)}
                className={`p-1 rounded-full ${
                  isDark
                    ? "text-gray-400 hover:text-white hover:bg-gray-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div
                className={`p-3 rounded-lg ${
                  isDark ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <p
                  className={`font-medium ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  {routePopupShipment.route_info}
                </p>
                {routePopupShipment.route_hops > 0 && (
                  <p
                    className={`text-sm mt-2 ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {t("shipments.routeHopsCount", {
                      count: routePopupShipment.route_hops,
                    })}
                  </p>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setRoutePopupShipment(null)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    isDark
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  {t("common.close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Shipments;
