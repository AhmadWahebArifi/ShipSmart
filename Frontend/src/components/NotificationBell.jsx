import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiBell } from "react-icons/hi2";
import axiosInstance from "../config/axios";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

// Notification bell for admins/superadmins, rendered in top header
const NotificationBell = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const isAdmin = user && (user.role === "admin" || user.role === "superadmin");

  useEffect(() => {
    if (!isAdmin) return;

    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get("/notifications", {
          params: { limit: 10 },
        });

        if (isMounted && response.data && response.data.success) {
          setUnreadCount(response.data.unread_count || 0);
          setNotifications(response.data.notifications || []);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    const intervalId = setInterval(fetchNotifications, 30000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [isAdmin]);

  if (!isAdmin) return null;

  const toggleOpen = async () => {
    if (!open) {
      try {
        const response = await axiosInstance.get("/notifications", {
          params: { limit: 10 },
        });

        if (response.data && response.data.success) {
          setNotifications(response.data.notifications || []);
          setUnreadCount(response.data.unread_count || 0);
        }

        await axiosInstance.put("/notifications/read-all");
        setUnreadCount(0);
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    }

    setOpen((prev) => !prev);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className={`relative p-2 rounded-lg transition-colors flex-shrink-0 ml-2 ${
          isDark
            ? "text-gray-300 hover:text-white hover:bg-gray-800"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        }`}
        title="Notifications"
      >
        <HiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-red-500 text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute right-0 mt-2 w-72 rounded-lg shadow-lg border z-50 text-sm ${
            isDark
              ? "bg-gray-900 border-gray-800 text-gray-100"
              : "bg-white border-gray-200 text-gray-800"
          }`}
        >
          <div
            className={`px-3 py-2 border-b text-xs font-semibold uppercase tracking-wide ${
              isDark
                ? "border-gray-800 text-gray-400"
                : "border-gray-200 text-gray-500"
            }`}
          >
            Notifications
          </div>
          {notifications.length === 0 ? (
            <div className="px-3 py-3 text-xs opacity-70">
              No recent notifications.
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => {
                    if (n.shipment && n.shipment.id) {
                      navigate(`/shipments/${n.shipment.id}`);
                    }
                    setOpen(false);
                  }}
                  className={`px-3 py-2 border-b last:border-b-0 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    isDark ? "border-gray-800" : "border-gray-100"
                  }`}
                >
                  <div className="font-medium truncate">{n.message}</div>
                  {n.shipment && (
                    <div className="mt-0.5 opacity-70 truncate">
                      {n.shipment.tracking_number} · {n.shipment.from_province}{" "}
                      → {n.shipment.to_province}
                    </div>
                  )}
                  <div className="mt-0.5 opacity-60">
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
