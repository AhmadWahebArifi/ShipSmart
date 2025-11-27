import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";

const ProductPrint = ({ product, onClose }) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const componentRef = useRef();

  // 1. Define custom CSS for the print window
  // This forces the body of the print window to flex-center its content
  const pageStyle = `
    @page {
      size: auto;
      margin: 20mm;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        display: flex;
        justify-content: center; /* Horizontally center */
        align-items: flex-start; /* Start from top (better for long receipts than center) */
      }
      /* Force light mode for printing regardless of theme */
      .print-container,
      .print-container * {
        color: black !important;
        background: white !important;
        border-color: #e5e7eb !important;
      }
      .print-container .text-green-600,
      .print-container .text-orange-600 {
        color: inherit !important;
        font-weight: 600 !important;
      }
      .print-container .text-green-600 {
        color: #059669 !important;
      }
      .print-container .text-orange-600 {
        color: #ea580c !important;
      }
    }
  `;

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${t("products.title")} - ${product.name}`,
    pageStyle: pageStyle, // Pass the styles here
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 print:bg-green-100 print:text-green-800 print:text-green-700";
      case "canceled":
        return "bg-red-100 text-red-800 print:bg-red-100 print:text-red-800 print:text-red-700";
      case "on_route":
        return "bg-blue-100 text-blue-800 print:bg-blue-100 print:text-blue-800 print:text-blue-700";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 print:bg-yellow-100 print:text-yellow-800 print:text-yellow-700";
      case "pending":
        return "bg-gray-100 text-gray-800 print:bg-gray-100 print:text-gray-800 print:text-gray-700";
      default:
        return "bg-gray-100 text-gray-800 print:bg-gray-100 print:text-gray-800 print:text-gray-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* 
         CHANGES IN THIS CONTAINER:
         1. print:mx-auto -> Auto margins for horizontal centering
         2. print:w-full -> Ensures it uses available width up to max-w
         3. print:max-w-2xl -> Keeps the card shape instead of stretching full page
         4. print:bg-white print:text-black -> Forces light mode for printing (saves ink/looks better)
         5. print:shadow-none -> Removes drop shadow on paper
         6. print:border-none -> Removes border on paper
      */}
      <div
        ref={componentRef}
        className={`relative rounded-xl shadow-2xl max-w-2xl w-full 
          print:mx-auto print:w-full print:max-w-2xl print:shadow-none print:border-none
          print:bg-white print:text-black
          ${
            isDark
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        style={{ fontSize: "12px" }}
      >
        <div className="print:hidden">
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
        </div>

        <div className="p-4 print:p-0">
          {" "}
          {/* Removed padding for print to let margins handle it */}
          {/* Product Header */}
          <div className="flex items-start justify-between mb-4 print:mb-6">
            <div>
              <h2
                className={`text-xl print:text-2xl font-bold print:text-black ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {product.name}
              </h2>
              {product.description && (
                <p
                  className={`mt-1 text-sm print:text-sm print:text-gray-600 ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {product.description}
                </p>
              )}
            </div>
            <div
              className={`px-2 py-1 print:px-2 print:py-1 rounded-full text-xs font-medium 
                print:bg-blue-100 print:text-blue-800
                ${
                  isDark
                    ? "bg-blue-900/30 text-blue-400"
                    : "bg-blue-100 text-blue-800"
                }`}
            >
              <svg
                className="w-4 h-4 inline mr-1"
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
          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 print:gap-6 mb-4 print:mb-6">
            <div
              className={`p-3 print:p-4 rounded-lg print:bg-gray-50 print:border print:border-gray-200 ${
                isDark ? "bg-gray-700/50" : "bg-gray-50"
              }`}
            >
              <h4
                className={`text-xs font-semibold uppercase tracking-wider mb-2 print:text-gray-500 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {t("products.productDetails")}
              </h4>
              <table className="w-full text-xs print:text-sm">
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-gray-600 print:border-gray-200">
                    <td className="py-1 pr-2 font-medium">
                      {t("products.table.quantity")}:
                    </td>
                    <td className="py-1 text-right">{product.quantity}</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-600 print:border-gray-200">
                    <td className="py-1 pr-2 font-medium">
                      {t("products.table.weight")} (kg):
                    </td>
                    <td className="py-1 text-right">
                      {parseFloat(product.weight).toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-600 print:border-gray-200">
                    <td className="py-1 pr-2 font-medium">
                      {t("products.table.price")} (AFN):
                    </td>
                    <td className="py-1 text-right">
                      {parseFloat(product.price).toFixed(2)}
                    </td>
                  </tr>
                  {product.discount && (
                    <tr className="border-b border-gray-200 dark:border-gray-600 print:border-gray-200">
                      <td className="py-1 pr-2 font-medium">
                        {t("products.form.discount")} (%):
                      </td>
                      <td className="py-1 text-right text-green-600">
                        -{parseFloat(product.discount).toFixed(2)}%
                      </td>
                    </tr>
                  )}
                  {product.remaining && (
                    <tr className="border-b border-gray-200 dark:border-gray-600 print:border-gray-200">
                      <td className="py-1 pr-2 font-medium">
                        {t("products.form.remaining")} (AFN) -{" "}
                        {t("products.form.debt")}:
                      </td>
                      <td className="py-1 text-right text-orange-600">
                        {parseFloat(product.remaining).toFixed(2)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-1 pr-2 font-medium">
                      {t("products.table.total")} (AFN):
                    </td>
                    <td className="py-1 text-right font-bold">
                      {(
                        parseFloat(product.price) * parseInt(product.quantity) -
                        (parseFloat(product.price) *
                          parseInt(product.quantity) *
                          (parseFloat(product.discount) || 0)) /
                          100
                      ).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Shipment Information */}
            <div
              className={`p-3 print:p-4 rounded-lg print:bg-gray-50 print:border print:border-gray-200 ${
                isDark ? "bg-gray-700/50" : "bg-gray-50"
              }`}
            >
              <h4
                className={`text-xs font-semibold uppercase tracking-wider mb-2 print:text-gray-500 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {t("shipments.title")}
              </h4>
              {product.shipment ? (
                <table className="w-full text-xs print:text-sm">
                  <tbody>
                    <tr className="border-b border-gray-200 dark:border-gray-600 print:border-gray-200">
                      <td className="py-1 pr-2 font-medium">
                        {t("shipments.trackingNumber")}:
                      </td>
                      <td className="py-1 text-right">
                        {product.shipment_tracking_number}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-600 print:border-gray-200">
                      <td className="py-1 pr-2 font-medium">
                        {t("shipments.fromProvince")}:
                      </td>
                      <td className="py-1 text-right">
                        {product.shipment.from_province}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-600 print:border-gray-200">
                      <td className="py-1 pr-2 font-medium">
                        {t("shipments.toProvince")}:
                      </td>
                      <td className="py-1 text-right">
                        {product.shipment.to_province}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-2 font-medium">
                        {t("shipments.table.status")}:
                      </td>
                      <td className="py-1 text-right">
                        <span
                          className={`px-1 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColor(
                            product.shipment.status
                          )}`}
                        >
                          {t(`shipmentStatus.${product.shipment.status}`) ||
                            product.shipment.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p
                  className={`text-xs ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {t("products.noShipmentInfo")}
                </p>
              )}
            </div>
          </div>
          {/* Sender Information */}
          {(product.sender ||
            product.sender_phone ||
            product.sender_email ||
            product.sender_address) && (
            <div
              className={`p-3 print:p-4 rounded-lg mb-4 print:mb-6 print:bg-gray-50 print:border print:border-gray-200 ${
                isDark ? "bg-gray-700/50" : "bg-gray-50"
              }`}
            >
              <h4
                className={`text-xs font-semibold uppercase tracking-wider mb-2 print:text-gray-500 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {t("products.form.sender")} Information
              </h4>
              <table className="w-full text-xs print:text-sm">
                <tbody>
                  {product.sender && (
                    <tr className="border-b border-gray-200 dark:border-gray-600 print:border-gray-200">
                      <td className="py-1 pr-2 font-medium">
                        {t("products.form.sender")}:
                      </td>
                      <td className="py-1 text-right">{product.sender}</td>
                    </tr>
                  )}
                  {product.sender_phone && (
                    <tr className="border-b border-gray-200 dark:border-gray-600 print:border-gray-200">
                      <td className="py-1 pr-2 font-medium">
                        {t("products.form.senderPhone")}:
                      </td>
                      <td className="py-1 text-right">
                        {product.sender_phone}
                      </td>
                    </tr>
                  )}
                  {product.sender_email && (
                    <tr className="border-b border-gray-200 dark:border-gray-600 print:border-gray-200">
                      <td className="py-1 pr-2 font-medium">
                        {t("products.form.senderEmail")}:
                      </td>
                      <td className="py-1 text-right">
                        {product.sender_email}
                      </td>
                    </tr>
                  )}
                  {product.sender_address && (
                    <tr>
                      <td className="py-1 pr-2 font-medium">
                        {t("products.form.senderAddress")}:
                      </td>
                      <td className="py-1 text-right">
                        {product.sender_address}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {/* Receiver Information */}
          {(product.receiver_name ||
            product.receiver_phone ||
            product.receiver_email ||
            product.receiver_address) && (
            <div
              className={`p-3 print:p-4 rounded-lg mb-4 print:mb-0 print:bg-gray-50 print:border print:border-gray-200 ${
                isDark ? "bg-gray-700/50" : "bg-gray-50"
              }`}
            >
              <h4
                className={`text-xs font-semibold uppercase tracking-wider mb-2 print:text-gray-500 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {t("products.receiverInfo")}
              </h4>
              <table className="w-full text-xs print:text-sm">
                <tbody>
                  {product.receiver_name && (
                    <tr className="border-b border-gray-200 dark:border-gray-600 print:border-gray-200">
                      <td className="py-1 pr-2 font-medium">
                        {t("products.receiverName")}:
                      </td>
                      <td className="py-1">{product.receiver_name}</td>
                    </tr>
                  )}
                  {product.receiver_phone && (
                    <tr className="border-b border-gray-200 dark:border-gray-600 print:border-gray-200">
                      <td className="py-1 pr-2 font-medium">
                        {t("products.receiverPhone")}:
                      </td>
                      <td className="py-1">{product.receiver_phone}</td>
                    </tr>
                  )}
                  {product.receiver_email && (
                    <tr className="border-b border-gray-200 dark:border-gray-600 print:border-gray-200">
                      <td className="py-1 pr-2 font-medium">
                        {t("products.receiverEmail")}:
                      </td>
                      <td className="py-1">{product.receiver_email}</td>
                    </tr>
                  )}
                  {product.receiver_address && (
                    <tr>
                      <td className="py-1 pr-2 font-medium align-top">
                        {t("products.receiverAddress")}:
                      </td>
                      <td className="py-1">{product.receiver_address}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end space-x-3 print:hidden">
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
