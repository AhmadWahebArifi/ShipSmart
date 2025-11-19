import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import axiosInstance from "../config/axios";
import { FiTruck, FiX, FiPlus, FiCheck } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const ShipmentForm = ({ onSubmit, onCancel, shipment }) => {
  const { t } = useTranslation();
  const PROVINCES = t("provinces", { returnObjects: true });
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [vehicles, setVehicles] = useState([]);

  const [formData, setFormData] = useState({
    from_province: "",
    to_province: "",
    tracking_number: "",
    description: "",
    expected_departure_date: "",
    expected_arrival_date: "",
    vehicle_id: "",
  });

  // Fetch vehicles for the dropdown
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axiosInstance.get("/vehicles");
        if (response.data && response.data.success) {
          setVehicles(response.data.vehicles || []);
        }
      } catch (err) {
        console.error("Error fetching vehicles:", err);
      }
    };

    fetchVehicles();
  }, []);

  // Effect to update form values when shipment changes
  useEffect(() => {
    if (shipment) {
      setFormData({
        from_province: shipment.from_province || "",
        to_province: shipment.to_province || "",
        tracking_number: shipment.tracking_number || "",
        description: shipment.description || "",
        expected_departure_date: shipment.expected_departure_date || "",
        expected_arrival_date: shipment.expected_arrival_date || "",
        vehicle_id: shipment.vehicle?.id || "",
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
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validation
      if (
        !formData.from_province ||
        !formData.to_province ||
        !formData.tracking_number
      ) {
        const missingFields = [];
        if (!formData.from_province)
          missingFields.push(t("shipments.fromProvince"));
        if (!formData.to_province)
          missingFields.push(t("shipments.toProvince"));
        if (!formData.tracking_number)
          missingFields.push(t("shipments.trackingNumber"));

        setError(`${t("common.errors.required")}: ${missingFields.join(", ")}`);
        setLoading(false);
        return;
      }

      if (formData.from_province === formData.to_province) {
        setError(t("shipments.errors.validation.provincesSame"));
        setLoading(false);
        return;
      }

      const shipmentData = {
        ...formData,
        vehicle_id: formData.vehicle_id || null, // Send null if no vehicle selected
      };

      if (shipment) {
        // Update existing shipment
        const response = await axiosInstance.put(
          `/shipments/${shipment.id}`,
          shipmentData
        );
        if (response.data.success) {
          setSuccess(t("shipments.success.updated"));
          if (onSubmit) onSubmit(response.data.shipment);
        }
      } else {
        // Create new shipment
        const response = await axiosInstance.post("/shipments", shipmentData);
        if (response.data.success) {
          setSuccess(t("shipments.success.added"));
          // Reset form
          setFormData({
            from_province: "",
            to_province: "",
            tracking_number: "",
            description: "",
            expected_departure_date: "",
            expected_arrival_date: "",
            vehicle_id: "",
          });
          if (onSubmit) onSubmit(response.data.shipment);
        }
      }
    } catch (err) {
      console.error("Error submitting shipment:", err);
      setError(
        err.response?.data?.message ||
          (shipment
            ? t("shipments.errors.updateFailed")
            : t("shipments.errors.addFailed"))
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`rounded-lg p-6 ${isDark ? "bg-gray-800" : "bg-white shadow"}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <FiTruck className="w-5 h-5" />
          {shipment
            ? t("shipments.editShipment")
            : t("shipments.addNewShipment")}
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className={`p-1 rounded-full ${
              isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-md bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100 flex items-center gap-2">
          <FiCheck className="w-5 h-5" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="from_province"
              className={`block text-sm font-medium mb-1 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t("shipments.fromProvince")} *
            </label>
            <select
              id="from_province"
              name="from_province"
              value={formData.from_province}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 rounded-md border ${
                isDark
                  ? "border-gray-600 bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                  : "border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
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
              htmlFor="to_province"
              className={`block text-sm font-medium mb-1 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t("shipments.toProvince")} *
            </label>
            <select
              id="to_province"
              name="to_province"
              value={formData.to_province}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 rounded-md border ${
                isDark
                  ? "border-gray-600 bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                  : "border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
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
        </div>

        <div>
          <label
            htmlFor="tracking_number"
            className={`block text-sm font-medium mb-1 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {t("shipments.trackingNumber")} *
          </label>
          <input
            id="tracking_number"
            type="text"
            name="tracking_number"
            value={formData.tracking_number}
            onChange={handleChange}
            placeholder={t("shipments.form.trackingNumberPlaceholder")}
            required
            className={`w-full px-3 py-2 rounded-md border ${
              isDark
                ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                : "border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
            }`}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className={`block text-sm font-medium mb-1 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {t("shipments.description")}
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder={t("shipments.form.descriptionPlaceholder")}
            rows={3}
            className={`w-full px-3 py-2 rounded-md border ${
              isDark
                ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                : "border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
            }`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="expected_departure_date"
              className={`block text-sm font-medium mb-1 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t("shipments.form.expectedDepartureDate")}
            </label>
            <input
              id="expected_departure_date"
              type="date"
              name="expected_departure_date"
              value={formData.expected_departure_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-md border ${
                isDark
                  ? "border-gray-600 bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                  : "border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="expected_arrival_date"
              className={`block text-sm font-medium mb-1 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t("shipments.form.expectedArrivalDate")}
            </label>
            <input
              id="expected_arrival_date"
              type="date"
              name="expected_arrival_date"
              value={formData.expected_arrival_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-md border ${
                isDark
                  ? "border-gray-600 bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                  : "border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              }`}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="vehicle_id"
            className={`block text-sm font-medium mb-1 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {t("shipments.form.vehicle")} ({t("common.optional")})
          </label>
          <select
            id="vehicle_id"
            name="vehicle_id"
            value={formData.vehicle_id}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-md border ${
              isDark
                ? "border-gray-600 bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                : "border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
            }`}
          >
            <option value="">{t("shipments.form.selectVehicle")}</option>
            {vehicles
              .filter((v) => v.status === "available")
              .map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicle_id} - {vehicle.type}
                  {vehicle.driver_name && ` (${vehicle.driver_name})`}
                </option>
              ))}
          </select>
          <p
            className={`mt-1 text-xs ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {t("shipments.form.vehicleHelpText")}
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {t("common.cancel")}
            </button>
          )}
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t("common.saving")}
              </>
            ) : (
              <>
                <FiPlus className="-ml-1 mr-2 h-4 w-4" />
                {shipment
                  ? t("common.update")
                  : t("shipments.form.addShipment")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShipmentForm;
