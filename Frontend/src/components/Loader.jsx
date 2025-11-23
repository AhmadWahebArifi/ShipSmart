import React from "react";
import { useTheme } from "../context/ThemeContext";
import { HiTruck } from "react-icons/hi2";

const Loader = ({ showText = true, customText = null, size = "medium" }) => {
  const { isDark } = useTheme();

  const sizeClasses = {
    small: {
      container: "w-16 h-16",
      icon: "w-8 h-8",
      text: "text-sm",
    },
    medium: {
      container: "w-24 h-24",
      icon: "w-12 h-12",
      text: "text-lg",
    },
    large: {
      container: "w-32 h-32",
      icon: "w-16 h-16",
      text: "text-xl",
    },
  };

  const currentSize = sizeClasses[size] || sizeClasses.medium;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          isDark
            ? "bg-gray-900/80 backdrop-blur-sm"
            : "bg-white/80 backdrop-blur-sm"
        }`}
      />

      {/* Loader Container */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Animated Circle with Truck Icon */}
        <div
          className={`relative ${currentSize.container} flex items-center justify-center`}
        >
          {/* Outer rotating ring */}
          <div
            className={`absolute inset-0 rounded-full border-4 border-transparent ${
              isDark ? "border-t-gray-400" : "border-t-blue-600"
            } animate-spin`}
          />

          {/* Inner pulsing circle */}
          <div
            className={`absolute inset-2 rounded-full ${
              isDark
                ? "bg-gray-700/30 animate-pulse"
                : "bg-blue-100 animate-pulse"
            }`}
          />

          {/* Truck Icon */}
          <div
            className={`relative ${currentSize.icon} ${
              isDark ? "text-gray-300" : "text-blue-600"
            } animate-bounce`}
          >
            <HiTruck className="w-full h-full" />
          </div>
        </div>

        {/* Loading Text */}
        {showText && (
          <div className="mt-6 text-center">
            <p
              className={`font-semibold ${currentSize.text} transition-colors ${
                isDark ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {customText || "Loading..."}
            </p>
            <div className="mt-2 flex justify-center space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    isDark ? "bg-gray-400" : "bg-blue-600"
                  }`}
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: "1.5s",
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loader;
