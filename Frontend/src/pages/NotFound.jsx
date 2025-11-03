import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { HiHome, HiArrowLeft, HiExclamationTriangle } from 'react-icons/hi2';

function NotFound() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="text-center px-4 py-8 max-w-2xl mx-auto">
        {/* 404 Animation */}
        <div className="mb-8 relative">
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-4 transition-all duration-300 ${
            isDark
              ? 'bg-blue-600/20 text-blue-400'
              : 'bg-blue-100 text-blue-600'
          }`}>
            <HiExclamationTriangle className="w-16 h-16" />
          </div>
          <h1 className={`text-9xl font-bold mb-4 transition-colors ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            404
          </h1>
        </div>

        {/* Content */}
        <div className={`mb-8 p-8 rounded-2xl shadow-xl transition-all duration-300 ${
          isDark
            ? 'bg-gray-800/90 backdrop-blur-lg border border-gray-700'
            : 'bg-white/90 backdrop-blur-lg border border-gray-200'
        }`}>
          <h2 className={`text-3xl font-bold mb-3 transition-colors ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            Page Not Found
          </h2>
          <p className={`text-lg mb-6 transition-colors ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 transform ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95'
                  : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95'
              } shadow-lg`}
            >
              <HiHome className="w-5 h-5" />
              Go to Dashboard
            </button>
            
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform ${
                isDark
                  ? 'bg-gray-700 text-white hover:bg-gray-600 hover:scale-105 active:scale-95'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 active:scale-95'
              } shadow-lg`}
            >
              <HiArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className={`text-sm transition-colors ${
          isDark ? 'text-gray-500' : 'text-gray-400'
        }`}>
          <p>If you believe this is an error, please contact support.</p>
        </div>
      </div>
    </div>
  );
}

export default NotFound;

