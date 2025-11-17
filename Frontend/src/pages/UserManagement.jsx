import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import Sidebar from "../components/Sidebar";
import MobileMenuButton from "../components/MobileMenuButton";
import axiosInstance from "../config/axios";
import {
  HiUserGroup,
  HiUserPlus,
  HiPencil,
  HiTrash,
  HiEye,
  HiCheck,
  HiXMark,
} from "react-icons/hi2";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

function UserManagement() {
  const { user: authUser } = useAuth();
  const { isDark } = useTheme();
  const {
    sidebarOpen,
    sidebarCollapsed,
    toggleSidebar,
    closeSidebar,
    toggleSidebarCollapse,
  } = useSidebar();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
    branch: "",
    name: "",
  });

  // Check if user has permission to manage users
  const canManageUsers =
    authUser && (authUser.role === "admin" || authUser.role === "superadmin");

  useEffect(() => {
    if (canManageUsers) {
      fetchUsers();
    }
  }, [canManageUsers]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/users");
      if (response.data && response.data.success) {
        setUsers(response.data.users);
      }
    } catch (err) {
      setError("Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const showAlert = (title, message, type = "success") => {
    MySwal.fire({
      title: title,
      text: message,
      icon: type,
      confirmButtonText: "OK",
      customClass: {
        confirmButton:
          "bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md",
      },
      buttonsStyling: false,
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/users", formData);
      if (response.data && response.data.success) {
        setUsers((prev) => [...prev, response.data.user]);
        setShowCreateForm(false);
        setFormData({
          username: "",
          email: "",
          password: "",
          role: "user",
          branch: "",
          name: "",
        });
        showAlert("Success", "User created successfully", "success");
      }
    } catch (err) {
      setError("Failed to create user");
      console.error("Error creating user:", err);
      showAlert("Error", "Failed to create user", "error");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const result = await MySwal.fire({
        title: "Delete User",
        text: "Are you sure you want to delete this user? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Delete",
        cancelButtonText: "Cancel",
        customClass: {
          confirmButton:
            "bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md mr-2",
          cancelButton:
            "bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md",
        },
        buttonsStyling: false,
      });

      if (!result.isConfirmed) return;

      await axiosInstance.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      showAlert("Success", "User deleted successfully", "success");
    } catch (err) {
      setError("Failed to delete user");
      console.error("Error deleting user:", err);
      showAlert("Error", "Failed to delete user", "error");
    }
  };

  if (!canManageUsers) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          isDark ? "bg-gray-950" : "bg-gray-50"
        }`}
      >
        <div
          className={`rounded-xl p-8 shadow-lg max-w-md w-full mx-4 ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="text-center">
            <HiXMark
              className={`w-16 h-16 mx-auto mb-4 ${
                isDark ? "text-red-400" : "text-red-500"
              }`}
            />
            <h2
              className={`text-2xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              Access Denied
            </h2>
            <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
              You don't have permission to access user management.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isDark
                      ? "bg-blue-600/20 text-blue-400"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <HiUserGroup className="w-6 h-6" />
                </div>
                <div>
                  <h1
                    className={`text-3xl font-bold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    User Management
                  </h1>
                  <p
                    className={`${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Manage system users and their permissions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isDark
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } shadow-lg`}
              >
                <HiUserPlus className="w-5 h-5" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                isDark
                  ? "bg-red-900/30 border-red-700 text-red-300"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {error}
            </div>
          )}

          {/* Create User Form */}
          {showCreateForm && (
            <div
              className={`rounded-xl shadow-lg border p-6 mb-8 transition-all duration-300 ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2
                  className={`text-xl font-semibold ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  Create New User
                </h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className={`p-2 rounded-lg ${
                    isDark
                      ? "text-gray-400 hover:text-white hover:bg-gray-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <HiXMark className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Role
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    >
                      <option value="user">User (Branch)</option>
                      <option value="admin">Admin</option>
                      {authUser.role === "superadmin" && (
                        <option value="superadmin">SuperAdmin</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Branch
                    </label>
                    <input
                      type="text"
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      isDark
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-lg font-medium text-white ${
                      isDark
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users Table */}
          <div
            className={`rounded-xl shadow-lg border overflow-hidden transition-all duration-300 ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p
                  className={`mt-4 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Loading users...
                </p>
              </div>
            ) : (
              <>
                <div
                  className={`px-6 py-4 border-b ${
                    isDark ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <h2
                    className={`text-lg font-semibold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Users ({users.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                      <tr>
                        <th
                          className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDark ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          User
                        </th>
                        <th
                          className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDark ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          Role
                        </th>
                        <th
                          className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDark ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          Branch
                        </th>
                        <th
                          className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDark ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          Status
                        </th>
                        <th
                          className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                            isDark ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y ${
                        isDark
                          ? "divide-gray-700 bg-gray-800"
                          : "divide-gray-200 bg-white"
                      }`}
                    >
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className={
                            isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-semibold ${
                                  isDark
                                    ? "bg-blue-600/20 text-blue-400"
                                    : "bg-blue-100 text-blue-600"
                                }`}
                              >
                                {user.name
                                  ? user.name.charAt(0).toUpperCase()
                                  : user.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div
                                  className={`text-sm font-medium ${
                                    isDark ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  {user.name || user.username}
                                </div>
                                <div
                                  className={`text-sm ${
                                    isDark ? "text-gray-400" : "text-gray-500"
                                  }`}
                                >
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.role === "superadmin"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                  : user.role === "admin"
                                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              }`}
                            >
                              {user.role === "superadmin"
                                ? "SuperAdmin"
                                : user.role === "admin"
                                ? "Admin"
                                : "User"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`${
                                isDark ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              {user.branch || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                isDark
                                  ? "bg-green-900/30 text-green-300"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                className={`p-2 rounded-lg ${
                                  isDark
                                    ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                    : "text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                                }`}
                                title="View"
                              >
                                <HiEye className="w-4 h-4" />
                              </button>
                              <button
                                className={`p-2 rounded-lg ${
                                  isDark
                                    ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20"
                                    : "text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50"
                                }`}
                                title="Edit"
                              >
                                <HiPencil className="w-4 h-4" />
                              </button>
                              {user.id !== authUser.id && (
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className={`p-2 rounded-lg ${
                                    isDark
                                      ? "text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                      : "text-red-600 hover:text-red-900 hover:bg-red-50"
                                  }`}
                                  title="Delete"
                                >
                                  <HiTrash className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
