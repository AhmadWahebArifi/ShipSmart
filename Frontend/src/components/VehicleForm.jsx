import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import axiosInstance from "../config/axios";
import { FiTruck, FiX, FiPlus, FiCheck } from "react-icons/fi";

const VehicleForm = ({ onSubmit, onCancel, vehicle }) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  // Effect to update form value when vehicle changes
  useEffect(() => {
    if (vehicle) {
      setValue("vehicle_id", vehicle.vehicle_id || "");
      setValue("type", vehicle.type || "");
      setValue("driver_name", vehicle.driver_name || "");
      setValue("capacity", vehicle.capacity || "");
      setValue("status", vehicle.status || "available");
    }
  }, [vehicle, setValue]);

  const handleFormSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Convert string values to numbers
      const vehicleData = {
        ...data,
        capacity: Number(data.capacity),
      };

      if (vehicle) {
        // Update existing vehicle
        const response = await axiosInstance.put(
          `/vehicles/${vehicle.id}`,
          vehicleData
        );
        if (response.data.success) {
          setSuccess(t("vehicles.success.updated"));
          if (onSubmit) onSubmit(response.data.vehicle);
        }
      } else {
        // Create new vehicle
        const response = await axiosInstance.post("/vehicles", vehicleData);
        if (response.data.success) {
          setSuccess(t("vehicles.success.added"));
          reset();
          if (onSubmit) onSubmit(response.data.vehicle);
        }
      }
    } catch (err) {
      console.error("Error submitting vehicle:", err);
      setError(err.response?.data?.message || t("common.errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`rounded-lg p-4 sm:p-6 ${isDark ? "bg-gray-800" : "bg-white shadow"}`}
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-medium flex items-center gap-2">
          <FiTruck className="w-4 h-4 sm:w-5 sm:h-5" />
          {vehicle ? t("vehicles.editVehicle") : t("vehicles.addVehicle")}
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className={`p-1 rounded-full ${
              isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-md bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-md bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100 flex items-center gap-2 text-xs sm:text-sm">
          <FiCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label
              htmlFor="vehicle_id"
              className={`block text-xs sm:text-sm font-medium mb-1 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t("vehicles.form.vehicleId")} *
            </label>
            <input
              id="vehicle_id"
              type="text"
              {...register("vehicle_id", {
                required: t("validation.required"),
              })}
              className={`w-full px-3 py-2 rounded-md border text-sm ${
                errors.vehicle_id
                  ? "border-red-500"
                  : isDark
                  ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  : "border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
              }`}
              placeholder={t("vehicles.form.vehicleIdPlaceholder")}
            />
            {errors.vehicle_id && (
              <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">
                {errors.vehicle_id.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="type"
              className={`block text-xs sm:text-sm font-medium mb-1 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t("vehicles.form.type")} *
            </label>
            <input
              id="type"
              type="text"
              {...register("type", { required: t("validation.required") })}
              className={`w-full px-3 py-2 rounded-md border text-sm ${
                errors.type
                  ? "border-red-500"
                  : isDark
                  ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  : "border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
              }`}
              placeholder={t("vehicles.form.typePlaceholder")}
            />
            {errors.type && (
              <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">
                {errors.type.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label
              htmlFor="driver_name"
              className={`block text-xs sm:text-sm font-medium mb-1 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t("vehicles.form.driverName")}
            </label>
            <input
              id="driver_name"
              type="text"
              {...register("driver_name")}
              className={`w-full px-3 py-2 rounded-md border text-sm ${
                isDark
                  ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  : "border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
              }`}
              placeholder={t("vehicles.form.driverNamePlaceholder")}
            />
          </div>

          <div>
            <label
              htmlFor="capacity"
              className={`block text-xs sm:text-sm font-medium mb-1 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t("vehicles.form.capacity")} (kg) *
            </label>
            <input
              id="capacity"
              type="number"
              step="0.01"
              min="0.01"
              {...register("capacity", {
                required: t("validation.required"),
                min: {
                  value: 0.01,
                  message: t("validation.min", { min: 0.01 }),
                },
              })}
              className={`w-full px-3 py-2 rounded-md border text-sm ${
                errors.capacity
                  ? "border-red-500"
                  : isDark
                  ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  : "border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
              }`}
              placeholder="0.00"
            />
            {errors.capacity && (
              <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">
                {errors.capacity.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="status"
            className={`block text-xs sm:text-sm font-medium mb-1 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {t("vehicles.form.status")} *
          </label>
          <select
            id="status"
            {...register("status", { required: t("validation.required") })}
            className={`w-full px-3 py-2 rounded-md border text-sm ${
              errors.status
                ? "border-red-500"
                : isDark
                ? "border-gray-600 bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                : "border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
            }`}
          >
            <option value="available">{t("vehicles.status.available")}</option>
            <option value="not_available">
              {t("vehicles.status.not_available")}
            </option>
          </select>
          {errors.status && (
            <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">
              {errors.status.message}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {t("common.cancel")}
            </button>
          )}
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
                {vehicle ? t("common.update") : t("vehicles.addVehicle")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
