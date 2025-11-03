import React from 'react';
import { HiBars3 } from 'react-icons/hi2';

const MobileMenuButton = ({ onClick, isDark }) => {
  return (
    <button
      onClick={onClick}
      className={`lg:hidden fixed top-4 left-4 z-50 p-3 rounded-lg shadow-lg transition-all duration-300 hover:scale-110 ${
        isDark
          ? 'bg-gray-800 text-white hover:bg-gray-700'
          : 'bg-white text-gray-900 hover:bg-gray-100'
      }`}
      aria-label="Toggle menu"
    >
      <HiBars3 className="w-6 h-6" />
    </button>
  );
};

export default MobileMenuButton;

