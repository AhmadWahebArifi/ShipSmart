import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import Sidebar from "../components/Sidebar";
import MobileMenuButton from "../components/MobileMenuButton";
import axiosInstance from "../config/axios";
import {
  HiCube,
  HiPencil,
  HiTrash,
  HiRefresh,
  HiCheck,
  HiX,
} from "react-icons/hi";
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

// Edit Shipment Modal Component
const EditShipmentModal = ({ isOpen, onClose, shipment, onSave, isDark }) => {
  const [formData, setFormData] = useState({
    from_province: shipment?.from_province || "",
    to_province: shipment?.to_province || "",
    description: shipment?.description || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (shipment) {
      setFormData({
        from_province: shipment.from_province || "",
        to_province: shipment.to_province || "",
        description: shipment.description || "",
      });
    }
  }, [shipment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const result = await onSave(shipment.id, formData);
      if (result.success) {
        onClose();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-xl shadow-lg w-full max-w-md ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div
          className={`px-6 py-4 border-b ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex justify-between items-center">
            <h3
              className={`text-lg font-semibold ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              Edit Shipment
            </h3>
            <button
              onClick={onClose}
              className={`p-1 rounded-full ${
                isDark
                  ? "text-gray-400 hover:bg-gray-700"
                  : "text-gray-500 hover:bg-gray-200"
              }`}
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div
              className={`mb-4 p-3 rounded-lg ${
                isDark ? "bg-red-900/30 text-red-300" : "bg-red-50 text-red-700"
              }`}
            >
              {error}
            </div>
          )}

          <div className="mb-4">
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t("shipments.fromProvince")}
            </label>
            <select
              name="from_province"
              value={formData.from_province}
              onChange={handleChange}
              required
              className={`border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="">Select Province</option>
              {PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t("shipments.toProvince")}
            </label>
            <select
              name="to_province"
              value={formData.to_province}
              onChange={handleChange}
              required
              className={`border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="">Select Province</option>
              {PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t("shipments.description")}
            </label>
            <textarea
              name="description"
              value={formData.description}
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

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium ${
                isDark
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Shipment = () => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
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
  const [newShipment, setNewShipment] = useState({
    from_province: "",
    to_province: "",
    tracking_number: "",
    description: "",
  });

  // State for edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentShipment, setCurrentShipment] = useState(null);

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

  // Fetch shipments when component mounts
  useEffect(() => {
    fetchShipments();
  }, []);

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

  const handleChange = (e) => {
    console.log(
      "Updating field:",
      e.target.name,
      "with value:",
      e.target.value
    );
    setNewShipment((prev) => {
      const updated = { ...prev, [e.target.name]: e.target.value };
      console.log("New state:", updated);
      return updated;
    });
  };

  const handleAddShipment = async (e) => {
    e.preventDefault();

    // Debug log the current form state
    console.log("Form state before submission:", newShipment);

    // Client-side validation
    if (
      !newShipment.from_province ||
      !newShipment.to_province ||
      !newShipment.tracking_number
    ) {
      const missingFields = [];
      if (!newShipment.from_province)
        missingFields.push(t("shipments.fromProvince"));
      if (!newShipment.to_province)
        missingFields.push(t("shipments.toProvince"));
      if (!newShipment.tracking_number)
        missingFields.push(t("shipments.trackingNumber"));

      showAlert(
        t("common.errors.generic"),
        `${t("common.errors.required")}: ${missingFields.join(", ")}`,
        "error"
      );
      return;
    }

    // Ensure from and to provinces are different
    if (newShipment.from_province === newShipment.to_province) {
      showAlert(
        t("common.errors.generic"),
        t("shipments.errors.validation.provincesSame"),
        "error"
      );
      return;
    }

    try {
      setError(""); // Clear any previous errors

      // Create URLSearchParams to send as form data
      const formData = new URLSearchParams();
      formData.append(
        "from_province",
        String(newShipment.from_province || "").trim()
      );
      formData.append(
        "to_province",
        String(newShipment.to_province || "").trim()
      );
      formData.append(
        "tracking_number",
        String(newShipment.tracking_number || "").trim()
      );
      formData.append(
        "description",
        String(newShipment.description || "").trim()
      );

      console.log("Sending form data to server:", formData.toString());

      // Send as form data instead of JSON
      const config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      };

      const response = await axiosInstance.post("/shipments", formData, config);

      if (response.data && response.data.success) {
        // Reset form
        setNewShipment({
          from_province: "",
          to_province: "",
          tracking_number: "",
          description: "",
        });
        // Show success message
        showAlert(t("common.success"), t("shipments.success.added"), "success");
        // Refresh the shipments list
        fetchShipments();
      } else {
        showAlert(
          t("common.errors.generic"),
          response.data?.message || t("shipments.errors.addFailed"),
          "error"
        );
      }
    } catch (err) {
      console.error("Error creating shipment:", err);
      console.error("Error response:", err.response?.data);
      if (err.response?.data) {
        // Handle validation errors from the server
        const errorMessage =
          typeof err.response.data === "object"
            ? Object.values(err.response.data).flat().join("\n")
            : err.response.data.message || t("shipments.errors.addFailed");
        showAlert(t("common.errors.generic"), errorMessage, "error");
      } else {
        showAlert(
          t("common.errors.generic"),
          t("shipments.errors.addFailed"),
          "error"
        );
      }
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
                  <HiCube className="w-6 h-6" />
                </div>
                <h1
                  className={`text-3xl font-bold transition-colors ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  📦 {t("shipments.title")}
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
                {t("shipments.addNewShipment")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {t("shipments.fromProvince")}
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
                    <option value="">
                      {t("shipments.form.fromProvincePlaceholder")}
                    </option>
                    {PROVINCES.map((province) => (
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
                    {t("shipments.toProvince")}
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
                    <option value="">
                      {t("shipments.form.toProvincePlaceholder")}
                    </option>
                    {PROVINCES.map((province) => (
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
                    {t("shipments.trackingNumber")}
                  </label>
                  <input
                    type="text"
                    name="tracking_number"
                    value={newShipment.tracking_number || ""}
                    onChange={(e) => {
                      console.log("Tracking number changed:", e.target.value);
                      handleChange(e);
                    }}
                    placeholder={t("shipments.form.trackingNumberPlaceholder")}
                    required
                    className={`border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>
                <div className="md:col-span-3">
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {t("shipments.description")}
                  </label>
                  <textarea
                    name="description"
                    value={newShipment.description}
                    onChange={handleChange}
                    placeholder={t("shipments.form.descriptionPlaceholder")}
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
                {t("shipments.form.addShipment")}
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
                    <h2
                      className={`text-lg font-semibold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {t("shipments.title")} ({shipments.length})
                    </h2>
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
                              {t("shipments.table.status")}
                            </th>
                            <th className="p-3 text-left">
                              {t("shipments.table.created")}
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

                                  {/* Edit Button */}
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
    </>
  );
};

export default Shipment;
