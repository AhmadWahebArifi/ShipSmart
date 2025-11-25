import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { HiXMark, HiCube, HiInbox } from "react-icons/hi2";
import axiosInstance from "../config/axios";

const ShipmentDetailPopup = ({ shipment, isOpen, onClose }) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch products when shipment changes
  useEffect(() => {
    if (isOpen && shipment?.id) {
      fetchShipmentProducts();
    }
  }, [isOpen, shipment?.id]);

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
        console.log(
          `API returned ${allProducts.length} total products:`,
          allProducts
        );
        console.log(`Current shipment ID: ${shipment.id}`);
        console.log(`Shipment object:`, shipment);

        // Check each product's structure
        allProducts.forEach((product, index) => {
          console.log(`Product ${index}:`, {
            id: product.id,
            name: product.name,
            shipment_id: product.shipment_id,
            shipment: product.shipment,
            shipmentId: product.shipmentId,
            shipment_tracking_number: product.shipment_tracking_number,
          });
        });

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

        console.log(
          `Filtered to ${filteredProducts.length} products for shipment ${shipment.id}:`,
          filteredProducts
        );

        // Set the filtered products (will be empty array if no products found)
        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error("Error fetching shipment products:", error);
      setProducts([]); // Set empty array on error
    } finally {
      setLoadingProducts(false);
    }
  };

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`relative w-full max-w-3xl mx-auto max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-300 ${
          isDark ? "bg-gray-800/95" : "bg-white/95"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDark ? "border-gray-700/50" : "border-gray-200/50"
          }`}
        >
          <h2
            className={`text-xl font-semibold flex items-center gap-2 ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            <span className="text-2xl">📦</span>
            {t("shipments.shipmentDetails")}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all duration-200 ${
              isDark
                ? "text-gray-400 hover:text-white hover:bg-gray-700/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
            }`}
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Tracking Number */}
          <div
            className={`p-5 rounded-xl border backdrop-blur-sm ${
              isDark
                ? "bg-gray-900/80 border-gray-700/50"
                : "bg-gray-50/80 border-gray-200/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t("shipments.trackingNumber")}
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
                  {t("shipments.statusLabel")}
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
              className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              <span className="text-xl">🛣️</span>
              {t("shipments.routeInfo")}
            </h3>
            <div
              className={`p-5 rounded-xl border backdrop-blur-sm ${
                isDark
                  ? "bg-gray-900/80 border-gray-700/50"
                  : "bg-gray-50/80 border-gray-200/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {t("shipments.from")}
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
                    className={`h-2 rounded-full ${
                      isDark ? "bg-gray-700/50" : "bg-gray-300/50"
                    }`}
                  >
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
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
                    {t("shipments.to")}
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

          {/* Products in Shipment */}
          <div>
            <h3
              className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              <span className="text-xl">📦</span>
              {t("shipments.productsInShipment")} ({products.length})
            </h3>

            {/* Debug Info - Remove in production */}
            {process.env.NODE_ENV === "development" && (
              <div
                className={`p-2 rounded text-xs mb-4 ${
                  isDark ? "bg-gray-900" : "bg-gray-100"
                }`}
              >
                <p>Loading: {loadingProducts ? "Yes" : "No"}</p>
                <p>Products Count: {products.length}</p>
                <p>Shipment ID: {shipment?.id}</p>
              </div>
            )}

            {loadingProducts ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : products.length === 0 ? (
              <div
                className={`p-8 rounded-xl border text-center backdrop-blur-sm ${
                  isDark
                    ? "bg-gray-900/80 border-gray-700/50"
                    : "bg-gray-50/80 border-gray-200/50"
                }`}
              >
                <HiInbox
                  className={`mx-auto h-12 w-12 ${
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
                    className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-lg backdrop-blur-sm ${
                      isDark
                        ? "bg-gray-900/80 border-gray-700/50 hover:bg-gray-800/80"
                        : "bg-gray-50/80 border-gray-200/50 hover:bg-white/80"
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
                            <p
                              className={`text-xs font-medium ${
                                isDark ? "text-gray-500" : "text-gray-500"
                              }`}
                            >
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
                              <p
                                className={`text-xs font-medium ${
                                  isDark ? "text-gray-500" : "text-gray-500"
                                }`}
                              >
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

                          {product.value && (
                            <div>
                              <p
                                className={`text-xs font-medium ${
                                  isDark ? "text-gray-500" : "text-gray-500"
                                }`}
                              >
                                {t("products.value")}
                              </p>
                              <p
                                className={`text-sm font-semibold ${
                                  isDark ? "text-green-400" : "text-green-600"
                                }`}
                              >
                                {product.value}
                              </p>
                            </div>
                          )}

                          {product.category && (
                            <div>
                              <p
                                className={`text-xs font-medium ${
                                  isDark ? "text-gray-500" : "text-gray-500"
                                }`}
                              >
                                {t("products.category")}
                              </p>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  isDark
                                    ? "bg-blue-900/30 text-blue-300"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {product.category}
                              </span>
                            </div>
                          )}

                          {/* Receiver Information */}
                          {(product.receiver_name ||
                            product.receiver_phone ||
                            product.receiver_email ||
                            product.receiver_address) && (
                            <div className="col-span-2 md:col-span-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <p
                                className={`text-xs font-medium mb-2 ${
                                  isDark ? "text-gray-500" : "text-gray-500"
                                }`}
                              >
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
                                      isDark ? "text-gray-400" : "text-gray-600"
                                    }`}
                                  >
                                    {t("products.receiverPhone")}:{" "}
                                    {product.receiver_phone}
                                  </p>
                                )}
                                {product.receiver_email && (
                                  <p
                                    className={`text-sm ${
                                      isDark ? "text-gray-400" : "text-gray-600"
                                    }`}
                                  >
                                    {t("products.receiverEmail")}:{" "}
                                    {product.receiver_email}
                                  </p>
                                )}
                                {product.receiver_address && (
                                  <p
                                    className={`text-sm ${
                                      isDark ? "text-gray-400" : "text-gray-600"
                                    }`}
                                  >
                                    {t("products.receiverAddress")}:{" "}
                                    {product.receiver_address}
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
                        {products.reduce(
                          (sum, p) => sum + (p.quantity || 1),
                          0
                        )}
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
                              sum +
                              parseFloat(p.weight?.replace("kg", "") || 0),
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

          {/* Dates */}
          <div>
            <h3
              className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              <span className="text-xl">📅</span>
              {t("shipments.importantDates")}
            </h3>
            <div
              className={`p-5 rounded-xl border backdrop-blur-sm ${
                isDark
                  ? "bg-gray-900/80 border-gray-700/50"
                  : "bg-gray-50/80 border-gray-200/50"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {t("shipments.createdAt")}
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
                    {t("shipments.updatedAt")}
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
