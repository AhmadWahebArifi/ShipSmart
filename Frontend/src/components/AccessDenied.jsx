import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { usePermission } from '../context/PermissionContext';
import {
  HiExclamationTriangle,
  HiHome,
  HiArrowLeft,
  HiLockClosed,
} from 'react-icons/hi2';

const AccessDenied = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { hasPermission } = usePermission();
  const navigate = useNavigate();

  const handleGoHome = () => {
    // Navigate to the first accessible page
    if (hasPermission('view_dashboard')) {
      navigate('/dashboard');
    } else if (hasPermission('view_shipments')) {
      navigate('/shipments');
    } else if (hasPermission('view_products')) {
      navigate('/products');
    } else if (hasPermission('view_vehicles')) {
      navigate('/vehicles');
    } else if (hasPermission('view_routes')) {
      navigate('/routes');
    } else if (hasPermission('view_profile')) {
      navigate('/admin');
    } else {
      navigate('/login');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      isDark
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-red-50 via-white to-orange-50'
    }`}>
      <div className={`w-full max-w-md px-4 py-8 transition-all duration-300 ${
        isDark
          ? 'bg-gray-800/90 backdrop-blur-lg border border-gray-700'
          : 'bg-white/90 backdrop-blur-lg border border-red-200'
      } rounded-2xl shadow-2xl`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 transition-all duration-300 ${
              isDark
                ? 'bg-red-600/20 text-red-400'
                : 'bg-red-100 text-red-600'
            }`}
          >
            <HiLockClosed className="w-10 h-10" />
          </div>
          <h1
            className={`text-3xl font-bold mb-2 transition-colors ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}
          >
            Access Denied
          </h1>
          <p
            className={`text-sm transition-colors ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            You don't have permission to access this page
          </p>
        </div>

        {/* Error Message */}
        <div
          className={`mb-6 p-4 rounded-lg border transition-all duration-300 ${
            isDark
              ? 'bg-red-900/30 border-red-700 text-red-300'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <HiExclamationTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold mb-1">Permission Required</div>
              <div className="text-sm opacity-90">
                This page requires special permissions that you don't currently have. 
                Please contact your administrator if you believe this is an error.
              </div>
              
              {/* User info */}
              {user && (
                <div className="mt-3 text-xs opacity-80">
                  <p>Current Role: <span className="font-semibold">{user.role || 'Unknown'}</span></p>
                  <p>Username: <span className="font-semibold">{user.username || 'Unknown'}</span></p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoHome}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
              isDark
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } shadow-lg`}
          >
            <HiHome className="w-5 h-5" />
            Go to Accessible Page
          </button>
          
          <button
            onClick={handleGoBack}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
              isDark
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <HiArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className={`text-xs transition-colors ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            If you need access to this page, please contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
