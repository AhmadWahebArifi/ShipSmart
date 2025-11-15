import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Sidebar';
import MobileMenuButton from '../components/MobileMenuButton';
import ProductForm from '../components/ProductForm';
import { FiPackage, FiPlus, FiTruck, FiEdit2, FiTrash2, FiInfo, FiFilter, FiSearch } from 'react-icons/fi';
import axiosInstance from '../config/axios';
import { toast } from 'react-toastify';

const Products = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { trackNumber } = useParams();
  const { sidebarOpen, closeSidebar, sidebarCollapsed, toggleSidebar } = useSidebar();
  
  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    shipmentTrackNumber: trackNumber || '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Build query params
      const params = new URLSearchParams();
      if (filters.shipmentTrackNumber) {
        params.append('shipmentTrackNumber', filters.shipmentTrackNumber);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await axiosInstance.get(`/products?${params.toString()}`);
      if (response.data && response.data.success) {
        setProducts(response.data.products || []);
      }
    } catch (err) {
      setError(t('products.errors.fetchFailed'));
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = (newProduct) => {
    setProducts([newProduct, ...products]);
    setShowAddForm(false);
    toast.success(t('products.success.added'));
  };

  const handleUpdateProduct = (updatedProduct) => {
    setProducts(products.map(p => 
      p._id === updatedProduct._id ? updatedProduct : p
    ));
    setEditingProduct(null);
    toast.success(t('products.success.updated'));
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm(t('products.confirmDelete'))) return;
    
    try {
      await axiosInstance.delete(`/products/${productId}`);
      setProducts(products.filter(p => p._id !== productId));
      toast.success(t('products.success.deleted'));
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error(err.response?.data?.message || t('common.errors.generic'));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      shipmentTrackNumber: trackNumber || ''
    });
    setSearchTerm('');
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.shipmentTrackNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilters = 
      (!filters.shipmentTrackNumber || product.shipmentTrackNumber === filters.shipmentTrackNumber);
    
    return matchesSearch && matchesFilters;
  });

  // Calculate totals
  const totalItems = filteredProducts.length;
  const totalQuantity = filteredProducts.reduce((sum, p) => sum + (parseInt(p.quantity) || 0), 0);
  const totalWeight = filteredProducts.reduce((sum, p) => sum + (parseFloat(p.weight) || 0), 0);
  const totalValue = filteredProducts.reduce((sum, p) => sum + (parseFloat(p.price) * parseInt(p.quantity) || 0), 0);

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      <MobileMenuButton onClick={toggleSidebar} isDark={isDark} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen || !sidebarCollapsed ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                <FiPackage className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold">{t('products.title')}</h1>
              <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {totalItems} {t('products.items')}
              </span>
            </div>
            
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlus className="-ml-1 mr-2 h-4 w-4" />
              {t('products.addProduct')}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <FiPackage className="w-5 h-5" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('products.stats.totalItems')}
                  </p>
                  <p className="text-2xl font-semibold">{totalItems}</p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <FiPackage className="w-5 h-5" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('products.stats.totalQuantity')}
                  </p>
                  <p className="text-2xl font-semibold">{totalQuantity}</p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                  <FiPackage className="w-5 h-5" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('products.stats.totalWeight')} (kg)
                  </p>
                  <p className="text-2xl font-semibold">{totalWeight.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <FiPackage className="w-5 h-5" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('products.stats.totalValue')}
                  </p>
                  <p className="text-2xl font-semibold">{totalValue.toFixed(2)} AFN</p>
                </div>
              </div>
            </div>
          </div>

          {/* Add/Edit Product Form */}
          {(showAddForm || editingProduct) && (
            <div className="mb-6">
              <ProductForm
                onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
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
          <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
                      : 'border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
                  } rounded-md`}
                  placeholder={t('products.searchPlaceholder')}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiFilter className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="shipmentTrackNumber"
                    value={filters.shipmentTrackNumber}
                    onChange={handleFilterChange}
                    className={`appearance-none pl-10 pr-10 py-2 border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500'
                        : 'border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-md`}
                  >
                    <option value="">{t('products.filters.allShipments')}</option>
                    {Array.from(new Set(products.map(p => p.shipmentTrackNumber))).map(trackNum => (
                      <option key={trackNum} value={trackNum}>
                        {t('products.filters.trackingNumber')}: {trackNum}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('common.reset')}
                </button>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className={`overflow-hidden rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{t('common.loading')}...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-600 dark:text-red-400">
                {error}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center">
                <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  {t('products.noProducts')}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t('products.getStarted')}
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiPlus className="-ml-1 mr-2 h-4 w-4" />
                    {t('products.addProduct')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      >
                        {t('products.table.name')}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      >
                        {t('products.table.shipment')}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                      >
                        {t('products.table.quantity')}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                      >
                        {t('products.table.weight')} (kg)
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                      >
                        {t('products.table.price')} (AFN)
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                      >
                        {t('products.table.total')} (AFN)
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">{t('common.actions')}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    {filteredProducts.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center ${
                              isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
                            }`}>
                              <FiPackage className="h-5 w-5" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium">
                                {product.name}
                              </div>
                              {product.description && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                  {product.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <span className="font-medium">
                              {product.shipmentTrackNumber}
                            </span>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {t('products.table.trackingNumber')}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {product.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {parseFloat(product.weight).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {parseFloat(product.price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {(parseFloat(product.price) * parseInt(product.quantity)).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title={t('common.edit')}
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ml-2"
                              title={t('common.delete')}
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                            <Link
                              to={`/shipments?trackingNumber=${product.shipmentTrackNumber}`}
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-2"
                              title={t('products.viewShipment')}
                            >
                              <FiTruck className="h-4 w-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <tr>
                      <td colSpan="2" className="px-6 py-3 text-sm font-medium">
                        {t('common.total')}
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-medium">
                        {totalQuantity}
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-medium">
                        {totalWeight.toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-medium" colSpan="2">
                        {totalValue.toFixed(2)} AFN
                      </td>
                      <td className="px-6 py-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
              <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                <FiPackage className="w-6 h-6" />
              </div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Products
              </h1>
            </div>
            <Link
              to="/products/new"
              className={`inline-flex items-center px-4 py-2 rounded-lg font-medium ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              <FiPlus className="mr-2" /> Add Product
            </Link>
          </div>

          {error && (
            <div className={`mb-6 p-4 rounded-lg border ${isDark ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {product.name}
                        </h3>
                        <p className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {product.description}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        product.quantity > 0
                          ? isDark
                            ? 'bg-green-900/30 text-green-400'
                            : 'bg-green-100 text-green-800'
                          : isDark
                          ? 'bg-red-900/30 text-red-400'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.quantity} in stock
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        ${product.price.toFixed(2)}
                      </span>
                      <button
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                          isDark
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                        onClick={() => {
                          // Handle add to shipment
                        }}
                      >
                        <FiTruck className="w-4 h-4" />
                        Add to Shipment
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
