import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import axiosInstance from "../config/axios";
import { FiTruck, FiX, FiPlus, FiCheck, FiAlertTriangle } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

const ShipmentForm = ({ onSubmit, onCancel, shipment }) => {
  const { t, i18n } = useTranslation();
  const PROVINCES = t("provinces", { returnObjects: true });
  const { isDark } = useTheme();
  const { user } = useAuth();
  const isAdmin = user && (user.role === "admin" || user.role === "superadmin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const [formData, setFormData] = useState({
    from_province: "",
    to_province: "",
    tracking_number: "",
    description: "",
    expected_departure_date: "",
    expected_arrival_date: "",
    vehicle_id: "",
  });

  // For new shipments, prefill from_province from logged-in user's location for non-admins
  useEffect(() => {
    if (!shipment && user && !isAdmin) {
      let initialFrom = null;

      if (user.province) {
        initialFrom = user.province;
      } else if (user.branch) {
        const lowerBranch = user.branch.toLowerCase();
        if (Array.isArray(PROVINCES)) {
          const matchedProvince = PROVINCES.find((p) =>
            String(p).toLowerCase().includes(lowerBranch)
          );
          initialFrom = matchedProvince || user.branch;
        } else {
          initialFrom = user.branch;
        }
      }

      if (initialFrom) {
        setFormData((prev) => ({
          ...prev,
          from_province: initialFrom,
        }));
      }
    }
  }, [shipment, user, isAdmin, PROVINCES]);

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

  // Check route when provinces change
  useEffect(() => {
    const checkRoute = async () => {
      if (
        formData.from_province &&
        formData.to_province &&
        formData.from_province !== formData.to_province
      ) {
        setRouteLoading(true);
        try {
          const response = await axiosInstance.get(
            `/provincial-connections/check-route/${formData.from_province}/${formData.to_province}`
          );

          if (response.data && response.data.success) {
            setRouteInfo(response.data);
          } else {
            setRouteInfo(null);
          }
        } catch (err) {
          console.error("Error checking route:", err);
          setRouteInfo(null);
        } finally {
          setRouteLoading(false);
        }
      } else {
        setRouteInfo(null);
      }
    };

    // Debounce the route check
    const timeoutId = setTimeout(checkRoute, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.from_province, formData.to_province]);

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
          setRouteInfo(null);
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
        <h3
          className={`text-lg font-medium flex items-center gap-2 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
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

      {/* Route Information */}
      {routeInfo && (
        <div className="mb-4 p-3 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
          <div className="flex items-start gap-2">
            <FiAlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{t("shipments.routeInfo")}</p>
              <p className="text-sm mt-1">
                {routeInfo.route?.[i18n.language] ||
                  routeInfo.route?.en ||
                  t("shipments.routeNotFound")}
              </p>
              {routeInfo.hops > 0 && (
                <p className="text-xs mt-1 opacity-75">
                  {t("shipments.routeHops", { count: routeInfo.hops })}
                </p>
              )}
            </div>
          </div>
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
              disabled={!isAdmin}
              required
              className={`w-full px-3 py-2 rounded-md border ${
                isDark
                  ? "border-gray-600 bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                  : "border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              }`}
            >
              <option value="">{t("shipments.selectProvince")}</option>
              {PROVINCES.map((province, index) => (
                <option key={index} value={province}>
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
              <option value="">{t("shipments.selectProvince")}</option>
              {PROVINCES.map((province, index) => (
                <option key={index} value={province}>
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
            type="text"
            id="tracking_number"
            name="tracking_number"
            value={formData.tracking_number}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 rounded-md border ${
              isDark
                ? "border-gray-600 bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                : "border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
            }`}
            placeholder={t("shipments.trackingNumberPlaceholder")}
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
            rows="3"
            className={`w-full px-3 py-2 rounded-md border ${
              isDark
                ? "border-gray-600 bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                : "border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
            }`}
            placeholder={t("shipments.descriptionPlaceholder")}
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
              {t("shipments.expectedDeparture")}
            </label>
            <input
              type="date"
              id="expected_departure_date"
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
              {t("shipments.expectedArrival")}
            </label>
            <input
              type="date"
              id="expected_arrival_date"
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
            {t("shipments.vehicle")} ({t("shipments.optional")})
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
            <option value="">{t("shipments.selectVehicle")}</option>
            {vehicles
              .filter((vehicle) => vehicle.status === "available")
              .map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicle_id} - {vehicle.type} (
                  {vehicle.driver_name || "No driver"})
                </option>
              ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className={`px-4 py-2 rounded-md border ${
                isDark
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {t("common.cancel")}
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
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
              </span>
            ) : (
              <>
                <FiPlus className="-ml-1 mr-2 h-4 w-4" />
                {shipment ? t("common.update") : t("common.save")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShipmentForm;
