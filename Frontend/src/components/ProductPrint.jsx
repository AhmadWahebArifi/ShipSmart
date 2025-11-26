import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";

const ProductPrint = ({ product, onClose }) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${t("products.title")} - ${product.name}`,
  });

  // Function to get status color based on shipment status
  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      case "on_route":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div
        ref={componentRef}
        className={`relative rounded-xl shadow-2xl max-w-2xl w-full ${
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
            {t("products.printProductInfo")}
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-full ${
              isDark
                ? "text-gray-400 hover:text-white hover:bg-gray-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Product Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {product.name}
              </h2>
              {product.description && (
                <p
                  className={`mt-1 ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {product.description}
                </p>
              )}
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isDark
                  ? "bg-blue-900/30 text-blue-400"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              <svg
                className="w-5 h-5 inline mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              {t("products.title")}
            </div>
          </div>

          {/* Product Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div
              className={`p-4 rounded-lg ${
                isDark ? "bg-gray-700/50" : "bg-gray-50"
              }`}
            >
              <h4
                className={`text-sm font-semibold uppercase tracking-wider mb-3 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {t("products.productDetails")}
              </h4>
              <div className="space-y-3">
                <div>
                  <p
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {t("products.table.quantity")}
                  </p>
                  <p
                    className={`text-lg font-medium ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {product.quantity}
                  </p>
                </div>
                <div>
                  <p
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {t("products.table.weight")} (kg)
                  </p>
                  <p
                    className={`text-lg font-medium ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {parseFloat(product.weight).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {t("products.table.price")} (AFN)
                  </p>
                  <p
                    className={`text-lg font-medium ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {parseFloat(product.price).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {t("products.table.total")} (AFN)
                  </p>
                  <p
                    className={`text-lg font-medium ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {(
                      parseFloat(product.price) * parseInt(product.quantity)
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipment Information */}
            <div
              className={`p-4 rounded-lg ${
                isDark ? "bg-gray-700/50" : "bg-gray-50"
              }`}
            >
              <h4
                className={`text-sm font-semibold uppercase tracking-wider mb-3 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {t("shipments.title")}
              </h4>
              {product.shipment ? (
                <div className="space-y-3">
                  <div>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {t("shipments.trackingNumber")}
                    </p>
                    <p
                      className={`text-lg font-medium ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {product.shipment_tracking_number}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {t("shipments.fromProvince")}
                    </p>
                    <p
                      className={`text-lg font-medium ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {product.shipment.from_province}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {t("shipments.toProvince")}
                    </p>
                    <p
                      className={`text-lg font-medium ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {product.shipment.to_province}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {t("shipments.status")}
                    </p>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        product.shipment.status
                      )}`}
                    >
                      {t(`shipmentStatus.${product.shipment.status}`) ||
                        product.shipment.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ) : (
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {t("products.noShipmentInfo")}
                </p>
              )}
            </div>
          </div>

          {/* Receiver Information */}
          {(product.receiver_name ||
            product.receiver_phone ||
            product.receiver_email ||
            product.receiver_address) && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                isDark ? "bg-gray-700/50" : "bg-gray-50"
              }`}
            >
              <h4
                className={`text-sm font-semibold uppercase tracking-wider mb-3 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {t("products.receiverInfo")}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.receiver_name && (
                  <div>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {t("products.receiverName")}
                    </p>
                    <p
                      className={`font-medium ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {product.receiver_name}
                    </p>
                  </div>
                )}
                {product.receiver_phone && (
                  <div>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {t("products.receiverPhone")}
                    </p>
                    <p
                      className={`font-medium ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {product.receiver_phone}
                    </p>
                  </div>
                )}
                {product.receiver_email && (
                  <div>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {t("products.receiverEmail")}
                    </p>
                    <p
                      className={`font-medium ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {product.receiver_email}
                    </p>
                  </div>
                )}
                {product.receiver_address && (
                  <div>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {t("products.receiverAddress")}
                    </p>
                    <p
                      className={`font-medium ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {product.receiver_address}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Print Button */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium ${
                isDark
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              {t("products.print")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPrint;
