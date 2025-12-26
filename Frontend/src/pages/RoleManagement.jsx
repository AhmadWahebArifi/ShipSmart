import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { usePermission } from "../context/PermissionContext";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import { useLoader } from "../context/LoaderContext";
import Sidebar from "../components/Sidebar";
import MobileMenuButton from "../components/MobileMenuButton";
import Header from "../components/Header";
import axiosInstance from "../config/axios";
import { useTranslation } from "react-i18next";
import {
  HiShieldCheck,
  HiUserGroup,
  HiKey,
  HiEye,
  HiEyeSlash,
  HiPencil,
  HiTrash,
  HiPlus,
  HiCheck,
  HiXMark,
  HiCog6Tooth,
} from "react-icons/hi2";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

function RoleManagement() {
  const { user: authUser } = useAuth();
  const { hasPermission, getGroupedPermissions, ROLE_PERMISSIONS } = usePermission();
  const { isDark } = useTheme();
  const { showLoaderWithText } = useLoader();
  const { t } = useTranslation();
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [customPermissions, setCustomPermissions] = useState([]);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePermissions, setNewRolePermissions] = useState([]);
  const [showRoleAssignmentModal, setShowRoleAssignmentModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  // Check if user can manage roles
  const canManageRoles = hasPermission('manage_roles') || authUser?.role === 'superadmin';

  // Don't render anything until auth user is loaded
  if (!authUser) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDark ? "bg-gray-950" : "bg-gray-50"
      }`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className={`mt-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Loading...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (canManageRoles) {
      fetchUsers();
    }
  }, [canManageRoles]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/users");
      if (response.data && response.data.success) {
        // Add permissions to each user based on their role
        const usersWithPermissions = response.data.users.map(user => ({
          ...user,
          permissions: ROLE_PERMISSIONS[user.role] || []
        }));
        setUsers(usersWithPermissions);
      }
    } catch (err) {
      setError("Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomRoles = async () => {
    try {
      const response = await axiosInstance.get("/roles/custom");
      if (response.data && response.data.success) {
        setCustomRoles(response.data.roles || {});
      }
    } catch (err) {
      console.error("Error fetching custom roles:", err);
    }
  };

  const showAlert = (title, message, type = "success") => {
    MySwal.fire({
      title,
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

  const handleManagePermissions = (user) => {
    console.log('handleManagePermissions called for user:', user);
    setSelectedUser(user);
    // Get current user permissions (default role permissions + any custom ones)
    const defaultPerms = ROLE_PERMISSIONS[user.role] || [];
    console.log('Default permissions:', defaultPerms);
    setCustomPermissions([...defaultPerms]);
    setShowPermissionModal(true);
    console.log('showPermissionModal set to true');
  };

  const handleAssignRole = (user) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setShowRoleAssignmentModal(true);
  };

  const handleSaveRoleAssignment = async () => {
    try {
      const response = await axiosInstance.put(`/roles/users/${selectedUser.id}/role`, {
        role: selectedRole,
      });

      if (response.data && response.data.success) {
        showAlert("Success", "Role assigned successfully", "success");
        
        // Update the user's role and permissions in the local state
        const newPermissions = ROLE_PERMISSIONS[selectedRole] || [];
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === selectedUser.id 
              ? { ...user, role: selectedRole, permissions: newPermissions }
              : user
          )
        );
        
        setShowRoleAssignmentModal(false);
        setSelectedUser(null);
        setSelectedRole("");
      }
    } catch (err) {
      showAlert("Error", "Failed to assign role", "error");
      console.error("Error assigning role:", err);
    }
  };

  const handlePermissionToggle = (permission) => {
    setCustomPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const handleSavePermissions = async () => {
    try {
      const response = await axiosInstance.put(`/roles/users/${selectedUser.id}/permissions`, {
        permissions: customPermissions,
      });

      if (response.data && response.data.success) {
        showAlert("Success", "Permissions updated successfully", "success");
        
        // Update the user's permissions in the local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === selectedUser.id 
              ? { ...user, permissions: customPermissions }
              : user
          )
        );
        
        setShowPermissionModal(false);
        setSelectedUser(null);
      }
    } catch (err) {
      showAlert("Error", "Failed to update permissions", "error");
      console.error("Error updating permissions:", err);
    }
  };

  const handleCreateCustomRole = async () => {
    try {
      const response = await axiosInstance.post("/roles/custom", {
        name: newRoleName,
        permissions: newRolePermissions,
      });

      if (response.data && response.data.success) {
        showAlert("Success", "Custom role created successfully", "success");
        setCustomRoles(prev => ({
          ...prev,
          [newRoleName]: newRolePermissions,
        }));
        setShowCreateRoleModal(false);
        setNewRoleName("");
        setNewRolePermissions([]);
      }
    } catch (err) {
      showAlert("Error", "Failed to create custom role", "error");
      console.error("Error creating custom role:", err);
    }
  };

  const handleDeleteCustomRole = async (roleName) => {
    try {
      const result = await MySwal.fire({
        title: "Delete Custom Role",
        text: `Are you sure you want to delete the "${roleName}" role?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        customClass: {
          confirmButton: "bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md mr-2",
          cancelButton: "bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md",
        },
        buttonsStyling: false,
      });

      if (!result.isConfirmed) return;

      await axiosInstance.delete(`/roles/custom/${roleName}`);
      
      setCustomRoles(prev => {
        const newRoles = { ...prev };
        delete newRoles[roleName];
        return newRoles;
      });
      
      showAlert("Success", "Custom role deleted successfully", "success");
    } catch (err) {
      showAlert("Error", "Failed to delete custom role", "error");
      console.error("Error deleting custom role:", err);
    }
  };

  const groupedPermissions = getGroupedPermissions();

  if (!canManageRoles) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDark ? "bg-gray-950" : "bg-gray-50"
      }`}>
        <div className={`rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg max-w-md w-full mx-3 sm:mx-4 ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}>
          <div className="text-center">
            <HiShieldCheck className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 ${
              isDark ? "text-red-400" : "text-red-500"
            }`} />
            <h2 className={`text-lg sm:text-2xl font-bold mb-2 ${
              isDark ? "text-white" : "text-gray-800"
            }`}>
              Access Denied
            </h2>
            <p className={`text-sm sm:text-base ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              You don't have permission to manage roles and permissions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${
      isDark ? "bg-gray-950" : "bg-gray-50"
    }`}>
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
      <div className={`flex-1 transition-all duration-300 ${
        sidebarOpen || !sidebarCollapsed ? "lg:ml-64" : "lg:ml-20"
      }`}>
        <div className="p-3 sm:p-4 lg:p-6 xl:p-8">
          <Header title="Role Management" subtitle="Manage user roles and permissions" />

          {/* Action Buttons */}
          <div className="mb-4 sm:mb-6">
            <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
              User Roles & Permissions
            </h2>
            <p className={`mt-1 sm:mt-2 text-sm sm:text-base ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Manage user roles and assign granular permissions
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-6 p-4 rounded-lg border ${
              isDark
                ? "bg-red-900/30 border-red-700 text-red-300"
                : "bg-red-50 border-red-200 text-red-700"
            }`}>
              {error}
            </div>
          )}

          {/* Users Table */}
          <div className={`rounded-xl shadow-lg border overflow-hidden transition-all duration-300 ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className={`mt-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Loading users...
                </p>
              </div>
            ) : (
              <>
                <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                  <h2 className={`text-base sm:text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                    Users ({users.length})
                  </h2>
                </div>

                {/* Desktop & Large Tablet Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                      <tr>
                        <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDark ? "text-gray-300" : "text-gray-500"
                        }`}>User</th>
                        <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDark ? "text-gray-300" : "text-gray-500"
                        }`}>Role</th>
                        <th className={`hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDark ? "text-gray-300" : "text-gray-500"
                        }`}>Branch</th>
                        <th className={`hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDark ? "text-gray-300" : "text-gray-500"
                        }`}>Permissions</th>
                        <th className={`px-3 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                          isDark ? "text-gray-300" : "text-gray-500"
                        }`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? "divide-gray-700 bg-gray-800" : "divide-gray-200 bg-white"}`}>
                      {users.map((user) => (
                        <tr key={user.id} className={isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm ${
                                isDark ? "bg-purple-600/20 text-purple-400" : "bg-purple-100 text-purple-600"
                              }`}>
                                {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-2 sm:ml-4">
                                <div className={`text-xs sm:text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                                  {user.name || user.username}
                                </div>
                                <div className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === "superadmin"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                : user.role === "admin"
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className={`hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm`}>
                            <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                              {user.branch || "N/A"}
                            </span>
                          </td>
                          <td className={`hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm`}>
                            <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                              {user.permissions?.length || 0} permissions
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                              <button
                                onClick={() => handleAssignRole(user)}
                                className={`p-1.5 sm:p-2 rounded-lg ${
                                  isDark
                                    ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                    : "text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                                }`}
                                title="Assign Role"
                              >
                                <HiUserGroup className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                              <button
                                onClick={() => handleManagePermissions(user)}
                                className={`p-1.5 sm:p-2 rounded-lg ${
                                  isDark
                                    ? "text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                                    : "text-purple-600 hover:text-purple-900 hover:bg-purple-50"
                                }`}
                                title="Manage Permissions"
                              >
                                <HiKey className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tablet & Mobile Card View */}
                <div className="md:hidden space-y-3 sm:space-y-4 p-3 sm:p-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className={`rounded-lg border p-3 sm:p-4 transition-all hover:shadow-md ${
                        isDark
                          ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {/* Header with user info and role */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className={`flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm ${
                            isDark ? "bg-purple-600/20 text-purple-400" : "bg-purple-100 text-purple-600"
                          }`}>
                            {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`font-semibold text-xs sm:text-sm truncate ${
                              isDark ? "text-gray-200" : "text-gray-900"
                            }`}>
                              {user.name || user.username}
                            </div>
                            <div className={`text-xs truncate ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}>
                              {user.email}
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                          user.role === "superadmin"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            : user.role === "admin"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        }`}>
                          {user.role}
                        </span>
                      </div>

                      {/* User Details - Responsive Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                        <div className="min-w-0">
                          <span className={`block ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}>
                            Branch
                          </span>
                          <span className={`block font-medium truncate ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}>
                            {user.branch || "N/A"}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className={`block ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}>
                            Permissions
                          </span>
                          <span className={`block font-medium truncate ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}>
                            {user.permissions?.length || 0} permissions
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 sm:gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                        {/* Assign Role Button */}
                        <button
                          onClick={() => handleAssignRole(user)}
                          className={`flex-1 flex items-center justify-center gap-1 p-2 rounded text-xs ${
                            isDark
                              ? "text-blue-400 hover:bg-gray-600"
                              : "text-blue-600 hover:bg-gray-200"
                          }`}
                          title="Assign Role"
                        >
                          <HiUserGroup className="w-4 h-4" />
                          <span className="hidden sm:inline">Role</span>
                        </button>

                        {/* Manage Permissions Button */}
                        <button
                          onClick={() => handleManagePermissions(user)}
                          className={`flex-1 flex items-center justify-center gap-1 p-2 rounded text-xs ${
                            isDark
                              ? "text-purple-400 hover:bg-gray-600"
                              : "text-purple-600 hover:bg-gray-200"
                          }`}
                          title="Manage Permissions"
                        >
                          <HiKey className="w-4 h-4" />
                          <span className="hidden sm:inline">Permissions</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
        </div>
      </div>

      {/* Permission Management Modal */}
      {showPermissionModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPermissionModal(false)}
          />
          <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}>
            <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-base sm:text-lg sm:text-xl font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                  Manage Permissions - {selectedUser.name || selectedUser.username}
                </h2>
                <button
                  onClick={() => setShowPermissionModal(false)}
                  className={`p-2 rounded-lg ${
                    isDark
                      ? "text-gray-400 hover:text-white hover:bg-gray-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <HiXMark className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4 sm:space-y-6">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category}>
                    <h3 className={`text-base sm:text-lg font-medium mb-2 sm:mb-3 capitalize ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}>
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {permissions.map((permission) => (
                        <label
                          key={permission}
                          className={`flex items-center p-2 sm:p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                            isDark
                              ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          } ${customPermissions.includes(permission)
                            ? isDark
                              ? "border-purple-500 bg-purple-900/20"
                              : "border-purple-500 bg-purple-50"
                            : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={customPermissions.includes(permission)}
                            onChange={() => handlePermissionToggle(permission)}
                            className="mr-2 sm:mr-3 rounded text-purple-600 focus:ring-purple-500"
                          />
                          <span className={`text-xs sm:text-sm font-medium ${
                            isDark ? "text-gray-200" : "text-gray-700"
                          }`}>
                            {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`px-4 sm:px-6 py-3 sm:py-4 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {customPermissions.length} permissions selected
                </div>
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setShowPermissionModal(false)}
                    className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm ${
                      isDark
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePermissions}
                    className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg font-medium text-white text-xs sm:text-sm ${
                      isDark
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-purple-600 hover:bg-purple-700"
                    }`}
                  >
                    Save Permissions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Role Modal */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCreateRoleModal(false)}
          />
          <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}>
            <div className={`px-6 py-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                  Create Custom Role
                </h2>
                <button
                  onClick={() => setShowCreateRoleModal(false)}
                  className={`p-2 rounded-lg ${
                    isDark
                      ? "text-gray-400 hover:text-white hover:bg-gray-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <HiXMark className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}>
                  Role Name
                </label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="Enter role name"
                />
              </div>
              <div className="space-y-6 max-h-[50vh] overflow-y-auto">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category}>
                    <h3 className={`text-lg font-medium mb-3 capitalize ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}>
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permissions.map((permission) => (
                        <label
                          key={permission}
                          className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                            isDark
                              ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          } ${newRolePermissions.includes(permission)
                            ? isDark
                              ? "border-purple-500 bg-purple-900/20"
                              : "border-purple-500 bg-purple-50"
                            : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={newRolePermissions.includes(permission)}
                            onChange={() => {
                              if (newRolePermissions.includes(permission)) {
                                setNewRolePermissions(prev => prev.filter(p => p !== permission));
                              } else {
                                setNewRolePermissions(prev => [...prev, permission]);
                              }
                            }}
                            className="mr-3 rounded text-purple-600 focus:ring-purple-500"
                          />
                          <span className={`text-sm font-medium ${
                            isDark ? "text-gray-200" : "text-gray-700"
                          }`}>
                            {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`px-6 py-4 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              <div className="flex justify-between items-center">
                <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {newRolePermissions.length} permissions selected
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreateRoleModal(false)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      isDark
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCustomRole}
                    disabled={!newRoleName || newRolePermissions.length === 0}
                    className={`px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-purple-600 hover:bg-purple-700"
                    }`}
                  >
                    Create Role
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {showRoleAssignmentModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowRoleAssignmentModal(false)}
          />
          <div className={`relative w-full max-w-md rounded-xl shadow-2xl ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}>
            <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-base sm:text-lg sm:text-xl font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                  Assign Role - {selectedUser.name || selectedUser.username}
                </h2>
                <button
                  onClick={() => setShowRoleAssignmentModal(false)}
                  className={`p-2 rounded-lg ${
                    isDark
                      ? "text-gray-400 hover:text-white hover:bg-gray-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <HiXMark className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Select Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  >
                    <option value="">Select a role...</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">SuperAdmin</option>
                  </select>
                </div>

                <div className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  <div className="font-medium mb-1">Current Role:</div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    selectedUser.role === 'superadmin' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                    selectedUser.role === 'admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>
            </div>

            <div className={`px-4 sm:px-6 py-3 sm:py-4 border-t flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}>
              <button
                onClick={() => setShowRoleAssignmentModal(false)}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium text-xs sm:text-sm ${
                  isDark
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoleAssignment}
                disabled={!selectedRole || selectedRole === selectedUser.role}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium text-xs sm:text-sm ${
                  !selectedRole || selectedRole === selectedUser.role
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Assign Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default RoleManagement;
