import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import { useTranslation } from "react-i18next";
import { useLoader } from "../context/LoaderContext";
import { usePermission } from "../context/PermissionContext";
import Sidebar from "../components/Sidebar";
import MobileMenuButton from "../components/MobileMenuButton";
import Header from "../components/Header";
import ProductForm from "../components/ProductForm";
import ProductPrint from "../components/ProductPrint";
import {
  FiPackage,
  FiPlus,
  FiTruck,
  FiEdit2,
  FiTrash2,
  FiFilter,
  FiSearch,
  FiUsers,
  FiX,
  FiPrinter,
} from "react-icons/fi";
import axiosInstance from "../config/axios";
import Swal from "sweetalert2";

const Products = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { showLoaderWithText } = useLoader();
  const { hasPermission } = usePermission();
  const { trackNumber } = useParams();
  const { sidebarOpen, closeSidebar, sidebarCollapsed, toggleSidebar } =
    useSidebar();

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null); // New state for receiver popup
  const [printProduct, setPrintProduct] = useState(null); // New state for print popup
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    shipmentTrackNumber: trackNumber || "",
  });

  useEffect(() => {
    showLoaderWithText("Loading Products...", 1500);
    fetchProducts();
  }, []); // Empty dependency array to run only once

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Build query params - only include non-empty parameters
      const params = {};

      // Only include shipment_tracking_number if it has a value
      if (filters.shipmentTrackNumber) {
        params.shipment_tracking_number = filters.shipmentTrackNumber;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      let response;
      try {
        // First try with the standard parameters
        response = await axiosInstance.get("/products", { params });
      } catch (error) {
        // Fallback: try without has_shipment parameter and filter client-side
        console.log("Backend doesn't support has_shipment filter, using fallback...");
        
        // Create a clean params object without empty values
        const fallbackParams = {};
        if (filters.shipmentTrackNumber) {
          fallbackParams.shipment_tracking_number = filters.shipmentTrackNumber;
        }
        if (searchTerm) {
          fallbackParams.search = searchTerm;
        }
        
        response = await axiosInstance.get("/products", { params: fallbackParams });

        // Filter client-side to only show products with shipment_id
        if (response.data && response.data.success) {
          response.data.products = response.data.products.filter(
            (product) => product.shipment_id || product.shipment_tracking_number
          );
        }
      }
      console.log(response.data.products);

      if (response.data && response.data.success) {
        console.log("Products with shipments:", response.data.products);
        setProducts(response.data.products || []);
      }
    } catch (err) {
      setError(t("products.errors.fetchFailed"));
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = (newProduct) => {
    // Check if user has permission to create products
    if (!hasPermission('create_product')) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: t("common.noPermission"),
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }
    
    setProducts([newProduct, ...products]);
    setShowAddForm(false);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: t("products.success.added"),
      showConfirmButton: false,
      timer: 3000,
    });
  };

  const handleUpdateProduct = (updatedProduct) => {
    // Check if user has permission to update products
    if (!hasPermission('update_product')) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: t("common.noPermission"),
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }
    
    setProducts(
      products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    setEditingProduct(null);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: t("products.success.updated"),
      showConfirmButton: false,
      timer: 3000,
    });
  };

  const handleDeleteProduct = async (productId) => {
    // Check if user has permission to delete products
    if (!hasPermission('delete_product')) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: t("common.noPermission"),
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }
    
    const result = await Swal.fire({
      title: t("products.confirmDeleteTitle"),
      text: t("products.confirmDelete"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("common.delete"),
      cancelButtonText: t("common.cancel"),
    });

    if (!result.isConfirmed) return;

    try {
      await axiosInstance.delete(`/products/${productId}`);
      setProducts(products.filter((p) => p.id !== productId));
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: t("products.success.deleted"),
        showConfirmButton: false,
        timer: 3000,
      });
    } catch (err) {
      console.error("Error deleting product:", err);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: err.response?.data?.message || t("common.errors.generic"),
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      shipmentTrackNumber: trackNumber || "",
    });
    setSearchTerm("");
    fetchProducts();
  };

  // Filter products based on search term
  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      product.name.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower) ||
      product.shipment_tracking_number?.toLowerCase().includes(searchLower) ||
      product.shipment?.from_province?.toLowerCase().includes(searchLower) ||
      product.shipment?.to_province?.toLowerCase().includes(searchLower);

    const matchesFilters =
      !filters.shipmentTrackNumber ||
      product.shipment_tracking_number === filters.shipmentTrackNumber;

    return matchesSearch && matchesFilters;
  });

  // Calculate totals
  const totalItems = filteredProducts.length;
  const totalQuantity = filteredProducts.reduce(
    (sum, p) => sum + (parseInt(p.quantity) || 0),
    0
  );
  const totalWeight = filteredProducts.reduce(
    (sum, p) => sum + (parseFloat(p.weight) || 0),
    0
  );
  const totalValue = filteredProducts.reduce(
    (sum, p) => sum + (parseFloat(p.price) * parseInt(p.quantity) || 0),
    0
  );

  // Function to get status color based on shipment status
  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "canceled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "on_route":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "pending":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 ${
        isDark ? "bg-gray-950" : "bg-gray-50"
      }`}
    >
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      <MobileMenuButton onClick={toggleSidebar} isDark={isDark} />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen || !sidebarCollapsed ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        <div className="p-3 sm:p-4 lg:p-8">
          <Header
            title={t("products.title")}
            subtitle={`${totalItems} ${t("products.items")}`}
          />

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div
              className={`p-3 sm:p-4 rounded-lg ${
                isDark ? "bg-gray-800" : "bg-white shadow"
              }`}
            >
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <FiPackage className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("products.stats.totalItems")}
                  </p>
                  <p
                    className={`text-lg sm:text-2xl font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {totalItems}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-3 sm:p-4 rounded-lg ${
                isDark ? "bg-gray-800" : "bg-white shadow"
              }`}
            >
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <FiPackage className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("products.stats.totalQuantity")}
                  </p>
                  <p
                    className={`text-lg sm:text-2xl font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {totalQuantity}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-3 sm:p-4 rounded-lg ${
                isDark ? "bg-gray-800" : "bg-white shadow"
              }`}
            >
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                  <FiPackage className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("products.stats.totalWeight")} (kg)
                  </p>
                  <p
                    className={`text-lg sm:text-2xl font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {totalWeight.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-3 sm:p-4 rounded-lg ${
                isDark ? "bg-gray-800" : "bg-white shadow"
              }`}
            >
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <FiPackage className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("products.stats.totalValue")}
                  </p>
                  <p
                    className={`text-lg sm:text-2xl font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {totalValue.toFixed(2)} AFN
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Add Product Button */}
          {hasPermission('create_product') && (
            <div className="mb-4 sm:mb-6">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus className="-ml-1 mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t("products.addProduct")}</span>
                <span className="sm:hidden">{t("common.add")}</span>
              </button>
            </div>
          )}

          {/* Add/Edit Product Form */}
          {(showAddForm || editingProduct) && (
            <div className="mb-6">
              <ProductForm
                onSubmit={
                  editingProduct ? handleUpdateProduct : handleAddProduct
                }
                onCancel={() => {
                  setShowAddForm(false);
                  setEditingProduct(null);
                }}
                product={editingProduct}
                shipmentTrackNumber={trackNumber}
              />
            </div>
          )}

          {/* Filters and Search */}
          <div
            className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg ${
              isDark ? "bg-gray-800" : "bg-white shadow"
            }`}
          >
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="relative flex-1 min-w-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`block w-full pl-9 sm:pl-10 pr-3 py-2 text-sm border ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                      : "border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                  } rounded-md`}
                  placeholder={t("products.searchPlaceholder")}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 sm:flex-initial">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiFilter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <select
                    name="shipmentTrackNumber"
                    value={filters.shipmentTrackNumber}
                    onChange={handleFilterChange}
                    className={`w-full appearance-none pl-9 sm:pl-10 pr-8 sm:pr-10 py-2 text-sm border ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                        : "border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                    } rounded-md`}
                  >
                    <option value="">
                      {t("products.filters.allShipments")}
                    </option>
                    {Array.from(
                      new Map(
                        products.map((p) => [
                          p.shipment_tracking_number,
                          p.shipment,
                        ])
                      )
                    ).map(([trackNum, shipment]) => (
                      <option key={trackNum} value={trackNum}>
                        {trackNum} - {shipment?.from_province || "N/A"} →{" "}
                        {shipment?.to_province || "N/A"}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={resetFilters}
                  className="flex-1 sm:flex-initial px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t("common.reset")}
                </button>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div
            className={`overflow-hidden rounded-lg shadow ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {t("common.loading")}...
                </p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-600 dark:text-red-400">
                {error}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center">
                <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  {t("products.noProducts")}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t("products.getStarted")}
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiPlus className="-ml-1 mr-2 h-4 w-4" />
                    {t("products.addProduct")}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop & Large Tablet Table View */}
                <div className="hidden md:block overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead
                      className={`${
                        isDark
                          ? "bg-gray-800 text-gray-200"
                          : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      <tr>
                        <th
                          scope="col"
                          className={`px-2 sm:px-3 lg:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDark ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          {t("products.table.name")}
                        </th>
                        <th
                          scope="col"
                          className={`hidden xs:table-cell px-2 sm:px-3 lg:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDark ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          {t("products.table.shipment")}
                        </th>
                        <th
                          scope="col"
                          className={`hidden sm:table-cell px-2 sm:px-3 lg:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDark ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          {t("products.table.status")}
                        </th>
                        <th
                          scope="col"
                          className={`px-2 sm:px-3 lg:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                            isDark ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          {t("products.table.quantity")}
                        </th>
                        <th
                          scope="col"
                          className={`hidden xs:table-cell px-2 sm:px-3 lg:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                            isDark ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          {t("products.table.weight")} (kg)
                        </th>
                        <th
                          scope="col"
                          className={`hidden md:table-cell px-2 sm:px-3 lg:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                            isDark ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          {t("products.table.price")} (AFN)
                        </th>
                        <th
                          scope="col"
                          className={`hidden lg:table-cell px-2 sm:px-3 lg:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                            isDark ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          {t("products.table.total")} (AFN)
                        </th>
                        <th
                          scope="col"
                          className={`hidden lg:table-cell px-2 sm:px-3 lg:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDark ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          {t("products.table.contactInfo")}
                        </th>
                        <th
                          scope="col"
                          className={`hidden xl:table-cell px-2 sm:px-3 lg:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDark ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          {t("products.table.outstandingBalance")}
                        </th>
                        <th scope="col" className="relative px-2 sm:px-3 lg:px-6 py-3">
                          <span className="sr-only">{t("common.actions")}</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y ${
                        isDark
                          ? "divide-gray-700 bg-gray-900"
                          : "divide-gray-200 bg-white"
                      }`}
                    >
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className={
                          isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"
                        }
                      >
                        <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className={`flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-md flex items-center justify-center ${
                                isDark
                                  ? "bg-blue-900/30 text-blue-400"
                                  : "bg-blue-100 text-blue-600"
                              }`}
                            >
                              <FiPackage className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <div className="ml-2 sm:ml-4">
                              <div
                                className={`text-xs sm:text-sm font-medium ${
                                  isDark ? "text-gray-200" : "text-gray-900"
                                }`}
                              >
                                {product.name}
                              </div>
                              {product.description && (
                                <div
                                  className={`text-xs ${
                                    isDark ? "text-gray-400" : "text-gray-500"
                                  } line-clamp-1 hidden xs:block`}
                                >
                                  {product.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="hidden xs:table-cell px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm">
                            <div
                              className={`font-medium flex items-center ${
                                isDark ? "text-gray-200" : "text-gray-900"
                              }`}
                            >
                              <FiTruck
                                className={`mr-1 h-3 w-3 sm:h-4 sm:w-4 ${
                                  isDark ? "text-gray-400" : "text-gray-500"
                                }`}
                              />
                              <span className="truncate max-w-20 xs:max-w-none">
                                {product.shipment_tracking_number}
                              </span>
                            </div>
                            {product.shipment && (
                              <div
                                className={`text-xs ${
                                  isDark ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {product.shipment.from_province} →{" "}
                                {product.shipment.to_province}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                          {product.shipment ? (
                            <span
                              className={`px-1 sm:px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                product.shipment.status
                              )}`}
                            >
                              {t(`shipmentStatus.${product.shipment.status}`) ||
                                product.shipment.status.replace("_", " ")}
                            </span>
                          ) : (
                            <span className="px-1 sm:px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              N/A
                            </span>
                          )}
                        </td>
                        <td
                          className={`px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm ${
                            isDark ? "text-gray-200" : "text-gray-900"
                          }`}
                        >
                          {product.quantity}
                        </td>
                        <td
                          className={`hidden xs:table-cell px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm ${
                            isDark ? "text-gray-200" : "text-gray-900"
                          }`}
                        >
                          {parseFloat(product.weight).toFixed(2)}
                        </td>
                        <td
                          className={`hidden md:table-cell px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm ${
                            isDark ? "text-gray-200" : "text-gray-900"
                          }`}
                        >
                          {parseFloat(product.price).toFixed(2)}
                        </td>
                        <td
                          className={`hidden lg:table-cell px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium ${
                            isDark ? "text-gray-200" : "text-gray-900"
                          }`}
                        >
                          {(
                            parseFloat(product.price) *
                              parseInt(product.quantity) -
                            (parseFloat(product.price) *
                              parseInt(product.quantity) *
                              (parseFloat(product.discount) || 0)) /
                              100
                          ).toFixed(2)}
                        </td>
                        <td className="hidden lg:table-cell px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                          {product.sender ||
                          product.sender_phone ||
                          product.sender_email ||
                          product.sender_address ||
                          product.receiver_name ||
                          product.receiver_phone ||
                          product.receiver_email ||
                          product.receiver_address ? (
                            <button
                              onClick={() => setSelectedProduct(product)}
                              className={`flex items-center gap-1 p-1 rounded ${
                                isDark
                                  ? "text-blue-400 hover:bg-gray-600"
                                  : "text-blue-600 hover:bg-gray-200"
                              }`}
                              title={t("products.viewContactInfo")}
                            >
                              <FiUsers className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="text-xs hidden sm:inline">
                                {t("products.contactInfo")}
                              </span>
                            </button>
                          ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {t("common.notAvailable")}
                            </span>
                          )}
                        </td>
                        <td className="hidden xl:table-cell px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                          {product.remaining !== null &&
                          product.remaining !== undefined &&
                          product.remaining !== "" ? (
                            <span
                              className={`px-1 sm:px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                isDark
                                  ? "bg-red-900 text-red-200"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {parseFloat(product.remaining).toFixed(2)} AFN
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {t("common.notAvailable")}
                            </span>
                          )}
                        </td>
                        <td
                          className={`px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium ${
                            isDark ? "text-gray-200" : "text-gray-900"
                          }`}
                        >
                          <div className="flex justify-end flex-wrap gap-1 sm:gap-2">
                            {hasPermission('update_product') && (
                              <button
                                onClick={() => setEditingProduct(product)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title={t("common.edit")}
                              >
                                <FiEdit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                            )}
                            {hasPermission('delete_product') && (
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title={t("common.delete")}
                              >
                                <FiTrash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setPrintProduct(product)}
                              className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                              title={t("products.print")}
                            >
                              <FiPrinter className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            <Link
                              to={`/shipments?trackingNumber=${product.shipment_tracking_number}`}
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              title={t("products.viewShipment")}
                            >
                              <FiTruck className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className={`${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
                    <tr>
                      <td
                        colSpan="4"
                        className={`px-2 sm:px-3 lg:px-6 py-3 text-xs sm:text-sm font-medium ${
                          isDark ? "text-gray-200" : "text-gray-900"
                        }`}
                      >
                        {t("common.total")}
                      </td>
                      <td
                        className={`hidden xs:table-cell px-2 sm:px-3 lg:px-6 py-3 text-right text-xs sm:text-sm font-medium ${
                          isDark ? "text-gray-200" : "text-gray-900"
                        }`}
                      >
                        {totalWeight.toFixed(2)}
                      </td>
                      <td
                        className={`hidden md:table-cell px-2 sm:px-3 lg:px-6 py-3 text-right text-xs sm:text-sm font-medium ${
                          isDark ? "text-gray-200" : "text-gray-900"
                        }`}
                        colSpan="2"
                      >
                        {totalValue.toFixed(2)} AFN
                      </td>
                      <td className="hidden lg:table-cell px-2 sm:px-3 lg:px-6 py-3"></td>
                      <td className="px-2 sm:px-3 lg:px-6 py-3"></td>
                      <td className="hidden xl:table-cell px-2 sm:px-3 lg:px-6 py-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Tablet & Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`rounded-lg border p-4 transition-all hover:shadow-md ${
                      isDark
                        ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {/* Header with product name and status */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div
                          className={`flex-shrink-0 h-8 w-8 rounded-md flex items-center justify-center ${
                            isDark
                              ? "bg-blue-900/30 text-blue-400"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          <FiPackage className="h-4 w-4" />
                        </div>
                        <span className={`font-semibold text-sm truncate ${
                          isDark ? "text-gray-200" : "text-gray-900"
                        }`}>
                          {product.name}
                        </span>
                      </div>
                      {product.shipment ? (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${getStatusColor(
                            product.shipment.status
                          )}`}
                        >
                          {t(`shipmentStatus.${product.shipment.status}`) ||
                            product.shipment.status.replace("_", " ")}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          N/A
                        </span>
                      )}
                    </div>

                    {/* Shipment Information */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs sm:text-sm ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}>
                          {t("products.table.shipment")}
                        </span>
                        <div className="flex items-center gap-1">
                          <FiTruck className={`w-3 h-3 ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`} />
                          <span className={`text-xs sm:text-sm font-medium text-right ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          } max-w-[50%] truncate`}>
                            {product.shipment_tracking_number}
                          </span>
                        </div>
                      </div>
                      {product.shipment && (
                        <div className="flex items-center justify-between">
                          <span className={`text-xs sm:text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}>
                            Route
                          </span>
                          <span className={`text-xs sm:text-sm font-medium text-right ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          } max-w-[50%] truncate`}>
                            {product.shipment.from_province} → {product.shipment.to_province}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Details - Responsive Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="min-w-0">
                        <span className={`block ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}>
                          {t("products.table.quantity")}
                        </span>
                        <span className={`block font-medium truncate ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}>
                          {product.quantity}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className={`block ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}>
                          {t("products.table.weight")} (kg)
                        </span>
                        <span className={`block font-medium truncate ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}>
                          {parseFloat(product.weight).toFixed(2)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className={`block ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}>
                          {t("products.table.price")} (AFN)
                        </span>
                        <span className={`block font-medium truncate ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}>
                          {parseFloat(product.price).toFixed(2)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className={`block ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}>
                          {t("products.table.total")} (AFN)
                        </span>
                        <span className={`block font-medium truncate ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}>
                          {(
                            parseFloat(product.price) *
                              parseInt(product.quantity) -
                            (parseFloat(product.price) *
                              parseInt(product.quantity) *
                              (parseFloat(product.discount) || 0)) /
                              100
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Outstanding Balance */}
                    {product.remaining !== null &&
                      product.remaining !== undefined &&
                      product.remaining !== "" && (
                        <div className="mb-3">
                          <span className={`block text-xs ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {t("products.table.outstandingBalance")}
                          </span>
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            isDark
                              ? "bg-red-900 text-red-200"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {parseFloat(product.remaining).toFixed(2)} AFN
                          </span>
                        </div>
                      )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                      {/* Contact Info Button */}
                      {product.sender ||
                      product.sender_phone ||
                      product.sender_email ||
                      product.sender_address ||
                      product.receiver_name ||
                      product.receiver_phone ||
                      product.receiver_email ||
                      product.receiver_address ? (
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className={`flex-1 min-w-[100px] flex items-center justify-center gap-1 p-2 rounded text-xs ${
                            isDark
                              ? "text-blue-400 hover:bg-gray-600"
                              : "text-blue-600 hover:bg-gray-200"
                          }`}
                          title={t("products.viewContactInfo")}
                        >
                          <FiUsers className="w-4 h-4" />
                          <span>{t("products.contactInfo")}</span>
                        </button>
                      ) : (
                        <div className="flex-1"></div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-1">
                        {/* Edit Button */}
                        {hasPermission('update_product') && (
                          <button
                            onClick={() => setEditingProduct(product)}
                            className={`p-2 rounded text-xs ${
                              isDark
                                ? "text-blue-400 hover:bg-gray-600"
                                : "text-blue-600 hover:bg-gray-200"
                            }`}
                            title={t("common.edit")}
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        )}

                        {/* Delete Button */}
                        {hasPermission('delete_product') && (
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className={`p-2 rounded text-xs ${
                              isDark
                                ? "text-red-400 hover:bg-gray-600"
                              : "text-red-600 hover:bg-gray-200"
                          }`}
                          title={t("common.delete")}
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                        )}

                        {/* Print Button */}
                        <button
                          onClick={() => setPrintProduct(product)}
                          className={`p-2 rounded text-xs ${
                            isDark
                              ? "text-purple-400 hover:bg-gray-600"
                              : "text-purple-600 hover:bg-gray-200"
                          }`}
                          title={t("products.print")}
                        >
                          <FiPrinter className="w-4 h-4" />
                        </button>

                        {/* View Shipment Button */}
                        <Link
                          to={`/shipments?trackingNumber=${product.shipment_tracking_number}`}
                          className={`p-2 rounded text-xs ${
                            isDark
                              ? "text-gray-400 hover:bg-gray-600"
                              : "text-gray-500 hover:bg-gray-200"
                          }`}
                          title={t("products.viewShipment")}
                        >
                          <FiTruck className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              </>
            )}
          </div>

          {/* Product Info Popup */}
          {selectedProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setSelectedProduct(null)}
              ></div>
              <div
                className={`relative rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto ${
                  isDark
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div
                  className={`flex items-center justify-between p-3 sm:p-4 border-b ${
                    isDark ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <h3
                    className={`text-base sm:text-lg font-semibold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {t("products.productDetails")}
                  </h3>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className={`p-1 rounded-full ${
                      isDark
                        ? "text-gray-400 hover:text-white hover:bg-gray-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="space-y-3 sm:space-y-4">
                    {/* Sender Information */}
                    <div>
                      <h4
                        className={`text-xs sm:text-sm font-semibold mb-2 sm:mb-3 ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {t("products.form.sender")} {t("common.info")}
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <p
                            className={`text-xs sm:text-sm font-medium ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {t("products.form.sender")}
                          </p>
                          <p
                            className={`mt-1 text-xs sm:text-sm break-words ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {selectedProduct.sender || t("common.notAvailable")}
                          </p>
                        </div>
                        <div>
                          <p
                            className={`text-xs sm:text-sm font-medium ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {t("products.form.senderPhone")}
                          </p>
                          <p
                            className={`mt-1 text-xs sm:text-sm break-words ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {selectedProduct.sender_phone ||
                              t("common.notAvailable")}
                          </p>
                        </div>
                        <div>
                          <p
                            className={`text-xs sm:text-sm font-medium ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {t("products.form.senderEmail")}
                          </p>
                          <p
                            className={`mt-1 text-xs sm:text-sm break-words ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {selectedProduct.sender_email ||
                              t("common.notAvailable")}
                          </p>
                        </div>
                        <div>
                          <p
                            className={`text-xs sm:text-sm font-medium ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {t("products.form.senderAddress")}
                          </p>
                          <p
                            className={`mt-1 text-xs sm:text-sm break-words ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {selectedProduct.sender_address ||
                              t("common.notAvailable")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Receiver Information */}
                    <div>
                      <h4
                        className={`text-xs sm:text-sm font-semibold mb-2 sm:mb-3 ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {t("products.receiverInfo")}
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <p
                            className={`text-xs sm:text-sm font-medium ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {t("products.receiverName")}
                          </p>
                          <p
                            className={`mt-1 text-xs sm:text-sm break-words ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {selectedProduct.receiver_name ||
                              t("common.notAvailable")}
                          </p>
                        </div>

                        <div>
                          <p
                            className={`text-xs sm:text-sm font-medium ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {t("products.receiverPhone")}
                          </p>
                          <p
                            className={`mt-1 text-xs sm:text-sm break-words ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {selectedProduct.receiver_phone ||
                              t("common.notAvailable")}
                          </p>
                        </div>

                        <div>
                          <p
                            className={`text-xs sm:text-sm font-medium ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {t("products.receiverEmail")}
                          </p>
                          <p
                            className={`mt-1 text-xs sm:text-sm break-words ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {selectedProduct.receiver_email ||
                              t("common.notAvailable")}
                          </p>
                        </div>

                        <div>
                          <p
                            className={`text-xs sm:text-sm font-medium ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {t("products.receiverAddress")}
                          </p>
                          <p
                            className={`mt-1 text-xs sm:text-sm break-words ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {selectedProduct.receiver_address ||
                              t("common.notAvailable")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium text-sm ${
                        isDark
                          ? "bg-gray-700 text-white hover:bg-gray-600"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      {t("common.close")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Print Product Popup */}
          {printProduct && (
            <ProductPrint
              product={printProduct}
              onClose={() => setPrintProduct(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
