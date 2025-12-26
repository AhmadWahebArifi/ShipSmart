import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import { useLoader } from "../context/LoaderContext";
import Sidebar from "../components/Sidebar";
import MobileMenuButton from "../components/MobileMenuButton";
import Header from "../components/Header";
import axiosInstance from "../config/axios";
import {
  HiUserCircle,
  HiEnvelope,
  HiUser,
  HiMapPin,
  HiCamera,
  HiCheck,
  HiXMark,
  HiPencil,
} from "react-icons/hi2";

function Admin() {
  const { t } = useTranslation();
  const { user: authUser, setUser, refreshUser } = useAuth();
  const { isDark } = useTheme();
  const { showLoaderWithText } = useLoader();
  const {
    sidebarOpen,
    sidebarCollapsed,
    toggleSidebar,
    closeSidebar,
    toggleSidebarCollapse,
  } = useSidebar();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null); // Track which field is being edited
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    profile_pic: "",
  });

  const [previewImage, setPreviewImage] = useState("");

  // Refresh user data when component mounts to ensure latest profile picture is shown
  useEffect(() => {
    refreshUser();
  }, []); // Only run once on mount

  // Show loader on component mount
  useEffect(() => {
    showLoaderWithText("Loading Admin Panel...", 1500);
  }, []); // Only run once on mount

  const openEditModal = (field = null) => {
    // Load current user data into form
    if (authUser) {
      setFormData({
        name: authUser.name || "",
        address: authUser.address || "",
        profile_pic: authUser.profile_pic || "",
      });
      setPreviewImage(authUser.profile_pic || "");
    }
    setEditingField(field); // Set which field to focus on
    setError("");
    setSuccess("");
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingField(null);
    setError("");
    setSuccess("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData((prev) => ({
          ...prev,
          profile_pic: base64String,
        }));
        setPreviewImage(base64String);
        setError("");
        setSuccess("");
      };
      reader.onerror = () => {
        setError("Error reading image file");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      profile_pic: "",
    }));
    setPreviewImage("");
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      // Prepare data to send - ensure profile_pic is included if it exists
      const dataToSend = {
        name: formData.name || null,
        address: formData.address || null,
        profile_pic: formData.profile_pic || null, // Send null if empty, otherwise send the base64 string
      };

      // Log the data being sent (without the full base64 string for brevity)
      console.log("Sending profile update:", {
        name: dataToSend.name,
        address: dataToSend.address,
        profile_pic: dataToSend.profile_pic
          ? `data:image/${dataToSend.profile_pic.substring(0, 50)}...`
          : null,
        profile_pic_length: dataToSend.profile_pic
          ? dataToSend.profile_pic.length
          : 0,
      });

      const response = await axiosInstance.put("/auth/profile", dataToSend);

      if (response.data && response.data.success) {
        setSuccess("Profile updated successfully!");
        // Update user context with response data immediately
        if (response.data.user && setUser) {
          setUser(response.data.user);
        }
        // Also refresh from server to ensure we have latest data
        if (refreshUser) {
          await refreshUser();
        }
        // Close modal after 2 seconds
        setTimeout(() => {
          setSuccess("");
          setIsEditModalOpen(false);
        }, 2000);
      } else {
        setError(response.data?.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update profile error:", err);
      if (err.response?.data) {
        setError(err.response.data.message || "Failed to update profile");
        console.error("Error details:", err.response.data);
      } else if (err.request) {
        setError("No response from server. Please check backend connection.");
      } else {
        setError(err.message || "An unexpected error occurred.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 ${
        isDark ? "bg-gray-950" : "bg-gray-50"
      }`}
    >
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* Mobile Menu Button */}
      <MobileMenuButton onClick={toggleSidebar} isDark={isDark} />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen || !sidebarCollapsed ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        <div className="p-3 sm:p-4 lg:p-6 xl:p-8">
          <Header title={t("profile.title")} subtitle={t("profile.subtitle")} />

          {/* Personal Info Card - View Mode */}
          <div
            className={`rounded-xl shadow-lg border p-4 sm:p-6 transition-all ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
              <h2
                className={`text-lg sm:text-xl font-semibold ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                {t("profile.personalInformation")}
              </h2>
              <button
                onClick={openEditModal}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 text-xs sm:text-sm ${
                  isDark
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } shadow-lg`}
              >
                <HiPencil className="w-4 h-4" />
                <span className="hidden sm:inline">{t("profile.editProfile")}</span>
                <span className="sm:hidden">Edit</span>
              </button>
            </div>

            {/* Profile Picture Display */}
            <div className="flex flex-col items-center mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-600 dark:border-gray-700">
              <div className="relative mb-3 sm:mb-4">
                {authUser?.profile_pic &&
                authUser.profile_pic.trim() !== "" &&
                authUser.profile_pic !== "null" &&
                authUser.profile_pic !== "undefined" &&
                (authUser.profile_pic.startsWith("data:image") ||
                  authUser.profile_pic.startsWith("data:") ||
                  authUser.profile_pic.length > 50) ? (
                  <img
                    key={`profile-${authUser.profile_pic?.substring(0, 50)}`} // Force re-render when profile_pic changes
                    src={authUser.profile_pic}
                    alt={authUser.name || authUser.username || "User"}
                    className="w-20 h-20 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-gray-300 dark:border-gray-600"
                    onError={(e) => {
                      // Hide broken image and show fallback
                      e.target.style.display = "none";
                      const parent = e.target.parentElement;
                      if (!parent.querySelector(".fallback-icon")) {
                        const fallback = document.createElement("div");
                        fallback.className =
                          "fallback-icon w-20 h-20 sm:w-32 sm:h-32 rounded-full flex items-center justify-center border-4";
                        fallback.className += isDark
                          ? " border-gray-600 bg-gray-700"
                          : " border-gray-300 bg-gray-100";
                        const icon = document.createElement("div");
                        icon.className = `w-12 h-12 sm:w-20 sm:h-20 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`;
                        icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>`;
                        fallback.appendChild(icon);
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div
                    className={`w-20 h-20 sm:w-32 sm:h-32 rounded-full flex items-center justify-center border-4 ${
                      isDark
                        ? "border-gray-600 bg-gray-700"
                        : "border-gray-300 bg-gray-100"
                    }`}
                  >
                    <HiUserCircle
                      className={`w-12 h-12 sm:w-20 sm:h-20 ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Personal Info Display */}
            <div className="space-y-4 sm:space-y-6">
              {/* Name */}
              <div className="group relative">
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all duration-300 hover:shadow-md">
                  <div className={`p-2 sm:p-3 rounded-lg transition-all duration-300 flex-shrink-0 ${
                    isDark 
                      ? "bg-blue-600/20 text-blue-400 group-hover:bg-blue-600/30" 
                      : "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
                  }`}>
                    <HiUser className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs sm:text-sm font-medium mb-1 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {t("profile.fullName")}
                    </p>
                    <p className={`text-base sm:text-lg font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}>
                      {authUser?.name || t("common.notSet", "Not set")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email (Read-only) */}
              <div className="group relative">
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all duration-300 hover:shadow-md">
                  <div className={`p-2 sm:p-3 rounded-lg transition-all duration-300 flex-shrink-0 ${
                    isDark 
                      ? "bg-gray-600/20 text-gray-400 group-hover:bg-gray-600/30" 
                      : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                  }`}>
                    <HiEnvelope className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs sm:text-sm font-medium mb-1 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {t("profile.email")}
                    </p>
                    <p className={`text-base sm:text-lg font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}>
                      <span className="truncate block">{authUser?.email || t("common.notSet", "Not set")}</span>
                    </p>
                    <p className={`text-xs mt-1 ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}>
                      {t("profile.emailReadonly")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="group relative">
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all duration-300 hover:shadow-md">
                  <div className={`p-2 sm:p-3 rounded-lg transition-all duration-300 flex-shrink-0 ${
                    isDark 
                      ? "bg-green-600/20 text-green-400 group-hover:bg-green-600/30" 
                      : "bg-green-100 text-green-600 group-hover:bg-green-200"
                  }`}>
                    <HiMapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs sm:text-sm font-medium mb-1 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {t("profile.address")}
                    </p>
                    <p className={`text-base sm:text-lg font-medium whitespace-pre-wrap ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}>
                      {authUser?.address || t("common.notSet", "Not set")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Modal */}
          {isEditModalOpen && (
            <>
              {/* Modal Overlay */}
              <div
                onClick={closeEditModal}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
              />

              {/* Modal Content */}
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300">
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl transition-all duration-300 ${
                    isDark
                      ? "bg-gray-800 border border-gray-700"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  {/* Modal Header */}
                  <div
                    className={`flex items-center justify-between p-4 sm:p-6 border-b ${
                      isDark ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <h3
                      className={`text-lg sm:text-2xl font-bold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {t("profile.editModalTitle")}
                    </h3>
                    <button
                      onClick={closeEditModal}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark
                          ? "text-gray-400 hover:text-white hover:bg-gray-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <HiXMark className="w-4 h-4 sm:w-6 sm:h-6" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-4 sm:p-6">
                    {error && (
                      <div
                        className={`mb-4 p-3 sm:p-4 rounded-lg border ${
                          isDark
                            ? "bg-red-900/30 border-red-700 text-red-300"
                            : "bg-red-50 border-red-200 text-red-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <HiXMark className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-sm sm:text-base">{error}</span>
                        </div>
                      </div>
                    )}

                    {success && (
                      <div
                        className={`mb-4 p-3 sm:p-4 rounded-lg border ${
                          isDark
                            ? "bg-green-900/30 border-green-700 text-green-300"
                            : "bg-green-50 border-green-200 text-green-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <HiCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-sm sm:text-base">{success || t("profile.updateSuccess")}</span>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                      {/* Profile Picture Section */}
                      <div className="flex flex-col items-center mb-4 sm:mb-6">
                        <div className="relative mb-3 sm:mb-4">
                          {previewImage ? (
                            <div className="relative">
                              <img
                                src={previewImage}
                                alt="Profile"
                                className="w-20 h-20 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-gray-300 dark:border-gray-600"
                              />
                              <button
                                type="button"
                                onClick={handleRemoveImage}
                                className={`absolute top-0 right-0 p-1.5 sm:p-2 rounded-full transition-all duration-200 transform hover:scale-110 ${
                                  isDark
                                    ? "bg-red-600 text-white hover:bg-red-700"
                                    : "bg-red-500 text-white hover:bg-red-600"
                                }`}
                              >
                                <HiXMark className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          ) : (
                            <div
                              className={`w-20 h-20 sm:w-32 sm:h-32 rounded-full flex items-center justify-center border-4 ${
                                isDark
                                  ? "border-gray-600 bg-gray-700"
                                  : "border-gray-300 bg-gray-100"
                              }`}
                            >
                              <HiUserCircle
                                className={`w-12 h-12 sm:w-20 sm:h-20 ${
                                  isDark ? "text-gray-400" : "text-gray-500"
                                }`}
                              />
                            </div>
                          )}
                        </div>
                        <label
                          className={`cursor-pointer flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 text-xs sm:text-sm ${
                            isDark
                              ? "bg-gray-700 text-white hover:bg-gray-600"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          <HiCamera className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="font-medium">
                            {previewImage
                              ? t("profile.changePhoto")
                              : t("profile.uploadPhoto")}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                        <p
                          className={`text-xs mt-2 ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {t("profile.imageHelp")}
                        </p>
                      </div>

                      {/* Email (Read-only) */}
                      <div>
                        <label
                          className={`block text-xs sm:text-sm font-medium mb-2 ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <HiEnvelope className="w-4 h-4" />
                            {t("profile.email")}
                          </div>
                        </label>
                        <input
                          type="email"
                          value={authUser?.email || ""}
                          disabled
                          className={`w-full px-3 sm:px-4 py-2 border rounded-lg cursor-not-allowed text-sm ${
                            isDark
                              ? "bg-gray-700/50 border-gray-600 text-gray-400"
                              : "bg-gray-50 border-gray-300 text-gray-500"
                          }`}
                        />
                        <p
                          className={`text-xs mt-1 ${
                            isDark ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          Email cannot be changed
                        </p>
                      </div>

                      {/* Name */}
                      <div>
                        <label
                          htmlFor="name"
                          className={`block text-xs sm:text-sm font-medium mb-2 ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <HiUser className="w-4 h-4" />
                            {t("profile.fullName")}
                          </div>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder={t("profile.fullName")}
                          className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm ${
                            isDark
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                          }`}
                        />
                      </div>

                      {/* Address */}
                      <div>
                        <label
                          htmlFor="address"
                          className={`block text-xs sm:text-sm font-medium mb-2 ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <HiMapPin className="w-4 h-4" />
                            {t("profile.address")}
                          </div>
                        </label>
                        <textarea
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={4}
                          placeholder={t("profile.address")}
                          className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm ${
                            isDark
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                          }`}
                        />
                      </div>

                      {/* Submit Buttons */}
                      <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
                        <button
                          type="button"
                          onClick={closeEditModal}
                          disabled={saving}
                          className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm ${
                            isDark
                              ? "bg-gray-700 text-white hover:bg-gray-600"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {t("common.cancel")}
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm ${
                            isDark
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "bg-blue-600 hover:bg-blue-700"
                          } shadow-lg`}
                        >
                          {saving ? (
                            <>
                              <svg
                                className="animate-spin h-4 w-4 sm:h-5 sm:w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              {t("common.saving")}
                            </>
                          ) : (
                            <>
                              <HiCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                              {t("profile.saveChanges")}
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
