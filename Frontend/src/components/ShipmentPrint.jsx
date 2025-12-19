import React, { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { HiTruck, HiMap, HiInbox, HiCube } from "react-icons/hi2";
import axiosInstance from "../config/axios";

const ShipmentPrint = ({ shipment, onClose }) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const componentRef = useRef();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch products when component mounts
  useEffect(() => {
    if (shipment?.id) {
      fetchShipmentProducts();
    }
  }, [shipment?.id]);

  const fetchShipmentProducts = async () => {
    try {
      setLoadingProducts(true);
      // Try to fetch products from database where shipment_id matches current shipment ID
      let response;
      try {
        response = await axiosInstance.get(
          `/products?shipment_id=${shipment.id}`
        );
      } catch (error) {
        // Fallback to alternative endpoint if the first one fails
        console.log("Trying alternative endpoint...");
        response = await axiosInstance.get(
          `/shipments/${shipment.id}/products`
        );
      }

      if (response.data && response.data.success) {
        const allProducts = response.data.products || [];
        
        // Filter client-side with multiple possible field names
        const filteredProducts = allProducts.filter((product) => {
          const hasShipmentId = product.shipment_id === shipment.id;
          const hasNestedShipment =
            product.shipment && product.shipment.id === shipment.id;
          const hasShipmentIdCamel = product.shipmentId === shipment.id;
          const hasTrackingNumber =
            product.shipment_tracking_number === shipment.tracking_number;

          return (
            hasShipmentId ||
            hasNestedShipment ||
            hasShipmentIdCamel ||
            hasTrackingNumber
          );
        });

        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error("Error fetching shipment products:", error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

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
        className={`relative rounded-xl shadow-2xl w-full max-w-2xl 
          max-h-[90vh] overflow-hidden
          print:mx-auto print:w-full print:max-w-2xl print:shadow-none print:border-none
          print:max-h-none print:overflow-visible
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

        <div className="overflow-y-auto max-h-[calc(90vh-72px)] print:max-h-none print:overflow-visible">
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

          {/* Products in Shipment (same info as Eye popup) */}
          <div className="mb-4 print:mb-6">
            <h3
              className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              <span className="text-xl">📦</span>
              {t("shipments.productsInShipment")} ({products.length})
            </h3>

            {loadingProducts ? (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : products.length === 0 ? (
              <div
                className={`p-6 rounded-xl border text-center backdrop-blur-sm ${
                  isDark
                    ? "bg-gray-900/80 border-gray-700/50"
                    : "bg-gray-50/80 border-gray-200/50"
                }`}
              >
                <HiInbox
                  className={`mx-auto h-10 w-10 ${
                    isDark ? "text-gray-600" : "text-gray-400"
                  }`}
                />
                <p
                  className={`mt-2 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t("shipments.noProductsFound")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product, index) => (
                  <div
                    key={product.id || index}
                    className={`p-4 rounded-xl border transition-all duration-200 backdrop-blur-sm ${
                      isDark
                        ? "bg-gray-900/80 border-gray-700/50"
                        : "bg-gray-50/80 border-gray-200/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <HiCube
                            className={`w-5 h-5 ${
                              isDark ? "text-blue-400" : "text-blue-600"
                            }`}
                          />
                          <h4
                            className={`font-semibold text-lg ${
                              isDark ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {product.name}
                          </h4>
                        </div>

                        {product.description && (
                          <p
                            className={`text-sm mb-3 ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {product.description}
                          </p>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <p className="text-xs font-medium text-gray-500">
                              {t("products.quantity")}
                            </p>
                            <p
                              className={`text-sm font-semibold ${
                                isDark ? "text-white" : "text-gray-800"
                              }`}
                            >
                              {product.quantity || 1}
                            </p>
                          </div>

                          {product.weight && (
                            <div>
                              <p className="text-xs font-medium text-gray-500">
                                {t("products.weight")}
                              </p>
                              <p
                                className={`text-sm font-semibold ${
                                  isDark ? "text-white" : "text-gray-800"
                                }`}
                              >
                                {product.weight}
                              </p>
                            </div>
                          )}

                          {product.price && (
                            <div>
                              <p className="text-xs font-medium text-gray-500">
                                {t("products.price")}
                              </p>
                              <p
                                className={`text-sm font-semibold ${
                                  isDark ? "text-green-400" : "text-green-600"
                                }`}
                              >
                                {parseFloat(product.price).toFixed(2)} AFN
                              </p>
                            </div>
                          )}

                          {product.discount !== null &&
                            product.discount !== undefined &&
                            product.discount !== "" && (
                              <div>
                                <p className="text-xs font-medium text-gray-500">
                                  {t("products.form.discount")}
                                </p>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    isDark
                                      ? "bg-orange-900/30 text-orange-300"
                                      : "bg-orange-100 text-orange-800"
                                  }`}
                                >
                                  {parseFloat(product.discount).toFixed(1)}%
                                </span>
                              </div>
                            )}

                          {product.remaining !== null &&
                            product.remaining !== undefined &&
                            product.remaining !== "" && (
                              <div>
                                <p className="text-xs font-medium text-gray-500">
                                  {t("products.table.outstandingBalance")}
                                </p>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    isDark
                                      ? "bg-red-900/30 text-red-300"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {parseFloat(product.remaining).toFixed(2)} AFN
                                </span>
                              </div>
                            )}

                          {(product.sender ||
                            product.sender_phone ||
                            product.sender_email ||
                            product.sender_address) && (
                            <div className="col-span-2 md:col-span-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-xs font-medium mb-2 text-gray-500">
                                {t("products.form.sender")} {t("common.info")}
                              </p>
                              <div className="space-y-1">
                                {product.sender && (
                                  <p
                                    className={`text-sm ${
                                      isDark ? "text-white" : "text-gray-800"
                                    }`}
                                  >
                                    {product.sender}
                                  </p>
                                )}
                                {product.sender_phone && (
                                  <p
                                    className={`text-sm ${
                                      isDark
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {t("products.form.senderPhone")}: {product.sender_phone}
                                  </p>
                                )}
                                {product.sender_email && (
                                  <p
                                    className={`text-sm ${
                                      isDark
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {t("products.form.senderEmail")}: {product.sender_email}
                                  </p>
                                )}
                                {product.sender_address && (
                                  <p
                                    className={`text-sm ${
                                      isDark
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {t("products.form.senderAddress")}: {product.sender_address}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {(product.receiver_name ||
                            product.receiver_phone ||
                            product.receiver_email ||
                            product.receiver_address) && (
                            <div className="col-span-2 md:col-span-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-xs font-medium mb-2 text-gray-500">
                                {t("products.receiverName")}
                              </p>
                              <div className="space-y-1">
                                {product.receiver_name && (
                                  <p
                                    className={`text-sm ${
                                      isDark ? "text-white" : "text-gray-800"
                                    }`}
                                  >
                                    {product.receiver_name}
                                  </p>
                                )}
                                {product.receiver_phone && (
                                  <p
                                    className={`text-sm ${
                                      isDark
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {t("products.receiverPhone")}: {product.receiver_phone}
                                  </p>
                                )}
                                {product.receiver_email && (
                                  <p
                                    className={`text-sm ${
                                      isDark
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {t("products.receiverEmail")}: {product.receiver_email}
                                  </p>
                                )}
                                {product.receiver_address && (
                                  <p
                                    className={`text-sm ${
                                      isDark
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {t("products.receiverAddress")}: {product.receiver_address}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Products Summary */}
                <div
                  className={`p-5 rounded-xl border backdrop-blur-sm ${
                    isDark
                      ? "bg-gray-800/80 border-gray-700/50"
                      : "bg-blue-50/80 border-blue-200/50"
                  }`}
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p
                        className={`text-2xl font-bold ${
                          isDark ? "text-blue-400" : "text-blue-600"
                        }`}
                      >
                        {products.reduce((sum, p) => sum + (p.quantity || 1), 0)}
                      </p>
                      <p
                        className={`text-sm ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {t("shipments.totalItems")}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-2xl font-bold ${
                          isDark ? "text-blue-400" : "text-blue-600"
                        }`}
                      >
                        {products.length}
                      </p>
                      <p
                        className={`text-sm ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {t("shipments.productTypes")}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-2xl font-bold ${
                          isDark ? "text-purple-400" : "text-purple-600"
                        }`}
                      >
                        {products
                          .reduce(
                            (sum, p) =>
                              sum + parseFloat(p.weight?.replace("kg", "") || 0),
                            0
                          )
                          .toFixed(1)}{" "}
                        kg
                      </p>
                      <p
                        className={`text-sm ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {t("shipments.totalWeight")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

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
    </div>
  );
};

export default ShipmentPrint;
