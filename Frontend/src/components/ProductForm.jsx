import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import axiosInstance from "../config/axios";
import { FiPackage, FiTruck, FiX, FiPlus, FiCheck } from "react-icons/fi";

const ProductForm = ({ onSubmit, onCancel, shipmentTrackNumber }) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      quantity: 1,
      weight: "",
      price: "",
      shipment_tracking_number: shipmentTrackNumber || "",
    },
  });

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        console.log("Fetching shipments...");
        const response = await axiosInstance.get("/shipments");
        console.log("Shipments response:", response.data);
        if (response.data && response.data.success) {
          console.log("Setting shipments:", response.data.shipments);
          setShipments(response.data.shipments || []);
        } else {
          console.error("Failed to fetch shipments:", response.data?.message);
        }
      } catch (err) {
        console.error("Error fetching shipments:", err);
        if (err.response) {
          console.error("Response data:", err.response.data);
          console.error("Response status:", err.response.status);
        }
      }
    };

    fetchShipments();
  }, []);

  const handleFormSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Convert string values to numbers
      const productData = {
        ...data,
        quantity: Number(data.quantity),
        weight: Number(data.weight),
        price: Number(data.price),
        // The field name now matches the backend
      };

      console.log("Submitting product data:", productData);

      const response = await axiosInstance.post("/products", productData);

      if (response.data.success) {
        setSuccess("Product added successfully");
        reset();
        if (onSubmit) onSubmit(response.data.product);
      }
    } catch (err) {
      console.error("Error submitting product:", err);
      setError(err.response?.data?.message || "Error adding product");
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
          <FiPackage className="w-5 h-5" />
          {t("products.addProduct")}
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

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              {t("products.form.name")} *
            </label>
            <input
              id="name"
              type="text"
              {...register("name", { required: t("validation.required") })}
              className={`w-full px-3 py-2 rounded-md border ${
                errors.name
                  ? "border-red-500"
                  : isDark
                  ? "border-gray-700 bg-gray-700"
                  : "border-gray-300"
              }`}
              placeholder={t("products.form.namePlaceholder")}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="shipmentTrackNumber"
              className="block text-sm font-medium mb-1"
            >
              {t("products.form.shipmentTrackNumber")} *
            </label>
            <div className="relative">
              <select
                id="shipment_tracking_number"
                className={`w-full p-2 border rounded ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
                {...register("shipment_tracking_number", {
                  required: "Shipment is required",
                })}
                disabled={!!shipmentTrackNumber}
              >
                {shipments.map((shipment) => (
                  <option key={shipment.id} value={shipment.tracking_number}>
                    {shipment.tracking_number} - {shipment.from_province} →{" "}
                    {shipment.to_province}
                  </option>
                ))}
              </select>
              <FiTruck className="absolute right-3 top-2.5 text-gray-400" />
            </div>
            {errors.shipment_tracking_number && (
              <p className="text-red-500 text-sm mt-1">
                {errors.shipment_tracking_number.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-1"
          >
            {t("products.form.description")}
          </label>
          <textarea
            id="description"
            {...register("description")}
            rows={3}
            className={`w-full px-3 py-2 rounded-md border ${
              isDark ? "border-gray-700 bg-gray-700" : "border-gray-300"
            }`}
            placeholder={t("products.form.descriptionPlaceholder")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium mb-1"
            >
              {t("products.form.quantity")} *
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              {...register("quantity", {
                required: t("validation.required"),
                min: { value: 1, message: t("validation.min", { min: 1 }) },
              })}
              className={`w-full px-3 py-2 rounded-md border ${
                errors.quantity
                  ? "border-red-500"
                  : isDark
                  ? "border-gray-700 bg-gray-700"
                  : "border-gray-300"
              }`}
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.quantity.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium mb-1">
              {t("products.form.weight")} (kg) *
            </label>
            <input
              id="weight"
              type="number"
              step="0.01"
              min="0.01"
              {...register("weight", {
                required: t("validation.required"),
                min: {
                  value: 0.01,
                  message: t("validation.min", { min: 0.01 }),
                },
              })}
              className={`w-full px-3 py-2 rounded-md border ${
                errors.weight
                  ? "border-red-500"
                  : isDark
                  ? "border-gray-700 bg-gray-700"
                  : "border-gray-300"
              }`}
              placeholder="0.00"
            />
            {errors.weight && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.weight.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-1">
              {t("products.form.price")} (AFN) *
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              {...register("price", {
                required: t("validation.required"),
                min: { value: 0, message: t("validation.min", { min: 0 }) },
              })}
              className={`w-full px-3 py-2 rounded-md border ${
                errors.price
                  ? "border-red-500"
                  : isDark
                  ? "border-gray-700 bg-gray-700"
                  : "border-gray-300"
              }`}
              placeholder="0.00"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.price.message}
              </p>
            )}
          </div>
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
                {t("products.addProduct")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
