import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { HiTruck, HiMap, HiInbox } from "react-icons/hi2";

const ShipmentPrint = ({ shipment, onClose }) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const componentRef = useRef();

  // Custom CSS for the print window
  const pageStyle = `
    @page {
      size: auto;
      margin: 20mm;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        display: flex;
        justify-content: center;
        align-items: flex-start;
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
    documentTitle: `${t("shipments.title")} - ${shipment.tracking_number}`,
    pageStyle: pageStyle,
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
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
      isDark ? "bg-gray-900/80" : "bg-black/50"
    }`}>
      <div
        className={`absolute inset-0 backdrop-blur-sm ${
          isDark ? "bg-gray-900/60" : "bg-black/50"
        }`}
        onClick={onClose}
      ></div>

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
              {t("shipments.printShipmentInfo")}
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
          {/* Shipment Header */}
          <div className="flex items-start justify-between mb-4 print:mb-6">
            <div>
              <h2
                className={`text-xl print:text-2xl font-bold print:text-black ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {shipment.tracking_number}
              </h2>
              <p
                className={`mt-1 text-sm print:text-sm print:text-gray-600 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {t("shipments.title")} #{shipment.id}
              </p>
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
              <HiTruck className="w-4 h-4 inline mr-1" />
              {t("shipments.title")}
            </div>
          </div>

          {/* Shipment Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 print:gap-6 mb-4 print:mb-6">
            {/* Route Information */}
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
                {t("shipments.routeInfo")}
              </h4>
              <table className="w-full text-xs print:text-sm">
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-gray-600 print:border-gray-200">
                    <td className={`py-1 pr-2 font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}>
                      {t("shipments.fromProvince")}:
                    </td>
                    <td className={`py-1 text-right ${
                      isDark ? "text-gray-200" : "text-gray-900"
                    }`}>
                      {shipment.from_province}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-600 print:border-gray-200">
                    <td className={`py-1 pr-2 font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}>
                      {t("shipments.toProvince")}:
                    </td>
                    <td className={`py-1 text-right ${
                      isDark ? "text-gray-200" : "text-gray-900"
                    }`}>
                      {shipment.to_province}
                    </td>
                  </tr>
                  {shipment.route_info && (
                    <tr className="border-b border-gray-200 dark:border-gray-600 print:border-gray-200">
                      <td className={`py-1 pr-2 font-medium ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}>
                        {t("shipments.routeInfo")}:
                      </td>
                      <td className={`py-1 text-right ${
                        isDark ? "text-gray-200" : "text-gray-900"
                      }`}>
                        {shipment.route_info}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className={`py-1 pr-2 font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}>
                      {t("shipments.table.status")}:
                    </td>
                    <td className="py-1 text-right">
                      <span
                        className={`px-1 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColor(
                          shipment.status
                        )}`}
                      >
                        {t(`shipments.status.${shipment.status}`) ||
                          shipment.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Timing Information */}
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
                {t("shipments.importantDates")}
              </h4>
              <table className="w-full text-xs print:text-sm">
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-gray-600 print:border-gray-200">
                    <td className={`py-1 pr-2 font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}>
                      {t("shipments.createdAt")}:
                    </td>
                    <td className={`py-1 text-right ${
                      isDark ? "text-gray-200" : "text-gray-900"
                    }`}>
                      {new Date(shipment.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                  {shipment.expected_departure_date && (
                    <tr className="border-b border-gray-200 dark:border-gray-600 print:border-gray-200">
                      <td className={`py-1 pr-2 font-medium ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}>
                        {t("shipments.table.expectedDeparture")}:
                      </td>
                      <td className={`py-1 text-right ${
                        isDark ? "text-gray-200" : "text-gray-900"
                      }`}>
                        {new Date(shipment.expected_departure_date).toLocaleDateString()}
                      </td>
                    </tr>
                  )}
                  {shipment.expected_arrival_date && (
                    <tr className="border-b border-gray-200 dark:border-gray-600 print:border-gray-200">
                      <td className={`py-1 pr-2 font-medium ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}>
                        {t("shipments.table.expectedArrival")}:
                      </td>
                      <td className={`py-1 text-right ${
                        isDark ? "text-gray-200" : "text-gray-900"
                      }`}>
                        {new Date(shipment.expected_arrival_date).toLocaleDateString()}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className={`py-1 pr-2 font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}>
                      {t("shipments.updatedAt")}:
                    </td>
                    <td className={`py-1 text-right ${
                      isDark ? "text-gray-200" : "text-gray-900"
                    }`}>
                      {new Date(shipment.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Vehicle Information */}
          {shipment.vehicle && (
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
                {t("shipments.table.vehicle")} Information
              </h4>
              <table className="w-full text-xs print:text-sm">
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-gray-600 print:border-gray-200">
                    <td className={`py-1 pr-2 font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}>
                      Vehicle ID:
                    </td>
                    <td className={`py-1 text-right ${
                      isDark ? "text-gray-200" : "text-gray-900"
                    }`}>
                      {shipment.vehicle.vehicle_id}
                    </td>
                  </tr>
                  {shipment.vehicle.type && (
                    <tr className="border-b border-gray-200 dark:border-gray-600 print:border-gray-200">
                      <td className={`py-1 pr-2 font-medium ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Type:
                      </td>
                      <td className={`py-1 text-right ${
                        isDark ? "text-gray-200" : "text-gray-900"
                      }`}>
                        {shipment.vehicle.type}
                      </td>
                    </tr>
                  )}
                  {shipment.vehicle.capacity && (
                    <tr>
                      <td className={`py-1 pr-2 font-medium ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Capacity:
                      </td>
                      <td className={`py-1 text-right ${
                        isDark ? "text-gray-200" : "text-gray-900"
                      }`}>
                        {shipment.vehicle.capacity}
                      </td>
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
              {t("common.print")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentPrint;
