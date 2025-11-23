import React from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NotificationBell from "./NotificationBell";
import DarkModeToggle from "./DarkModeToggle";

const Header = ({ title, subtitle }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isDark } = useTheme();

  return (
    <div className="mb-8 flex items-center justify-between gap-4">
      <div>
        <h2
          className={`text-2xl font-semibold mb-1 transition-colors ${
            isDark ? "text-white" : "text-gray-800"
          }`}
        >
          {title ||
            t("dashboard.welcome", { username: user?.username || "User" })}
        </h2>
        {subtitle && (
          <p
            className={`transition-colors ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DarkModeToggle />
        <NotificationBell />
      </div>
    </div>
  );
};

export default Header;
