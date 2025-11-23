import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { HiXMark } from "react-icons/hi2";

const ShipmentDetailPopup = ({ shipment, isOpen, onClose }) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();

  if (!isOpen || !shipment) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return isDark ? "text-yellow-400" : "text-yellow-600";
      case "in_transit":
        return isDark ? "text-blue-400" : "text-blue-600";
      case "delivered":
        return isDark ? "text-green-400" : "text-green-600";
      case "cancelled":
        return isDark ? "text-red-400" : "text-red-600";
      default:
        return isDark ? "text-gray-400" : "text-gray-600";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h2
            className={`text-xl font-semibold ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            📦 Shipment Details
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? "text-gray-400 hover:text-white hover:bg-gray-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tracking Number */}
          <div
            className={`p-4 rounded-lg border ${
              isDark
                ? "bg-gray-900 border-gray-700"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Tracking Number
                </p>
                <p
                  className={`text-lg font-semibold ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  {shipment.tracking_number}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-medium ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Status
                </p>
                <p
                  className={`text-lg font-semibold ${getStatusColor(
                    shipment.status
                  )}`}
                >
                  {t(`shipments.status.${shipment.status}`)}
                </p>
              </div>
            </div>
          </div>

          {/* Route Information */}
          <div>
            <h3
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              🛣️ Route Information
            </h3>
            <div
              className={`p-4 rounded-lg border ${
                isDark
                  ? "bg-gray-900 border-gray-700"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    From
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {shipment.from_province}
                  </p>
                </div>
                <div className="flex-1 px-4">
                  <div
                    className={`h-1 rounded-full ${
                      isDark ? "bg-gray-700" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`h-1 rounded-full ${
                        shipment.status === "delivered"
                          ? "bg-green-500"
                          : shipment.status === "in_transit"
                          ? "bg-blue-500"
                          : "bg-gray-400"
                      }`}
                      style={{
                        width:
                          shipment.status === "delivered"
                            ? "100%"
                            : shipment.status === "in_transit"
                            ? "50%"
                            : "0%",
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    To
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {shipment.to_province}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <h3
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              👤 Customer Information
            </h3>
            <div
              className={`p-4 rounded-lg border ${
                isDark
                  ? "bg-gray-900 border-gray-700"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Customer Name
                  </p>
                  <p
                    className={`text-lg ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {shipment.customer_name}
                  </p>
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Phone Number
                  </p>
                  <p
                    className={`text-lg ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {shipment.customer_phone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div>
            <h3
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              📦 Product Information
            </h3>
            <div
              className={`p-4 rounded-lg border ${
                isDark
                  ? "bg-gray-900 border-gray-700"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Product Type
                  </p>
                  <p
                    className={`text-lg ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {shipment.product_type}
                  </p>
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Weight
                  </p>
                  <p
                    className={`text-lg ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {shipment.weight} kg
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p
                  className={`text-sm font-medium ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Description
                </p>
                <p
                  className={`text-lg ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  {shipment.description || "No description provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div>
            <h3
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              📅 Important Dates
            </h3>
            <div
              className={`p-4 rounded-lg border ${
                isDark
                  ? "bg-gray-900 border-gray-700"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Created At
                  </p>
                  <p
                    className={`text-lg ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {new Date(shipment.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Updated At
                  </p>
                  <p
                    className={`text-lg ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {new Date(shipment.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetailPopup;
