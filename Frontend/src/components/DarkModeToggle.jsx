import React from "react";
import { useTheme } from "../context/ThemeContext";
import { HiSun, HiMoon } from "react-icons/hi2";

const DarkModeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-2 rounded-lg transition-colors flex-shrink-0 ${
        isDark
          ? "text-gray-300 hover:text-white hover:bg-gray-800"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
    </button>
  );
};

export default DarkModeToggle;
