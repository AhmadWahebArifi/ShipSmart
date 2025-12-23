import React, { createContext, useContext, useState } from 'react';

const PermissionContext = createContext();

export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
};

// Define available permissions
export const PERMISSIONS = {
  // Dashboard permissions
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_ANALYTICS: 'view_analytics',
  
  // Shipment permissions
  CREATE_SHIPMENT: 'create_shipment',
  VIEW_SHIPMENTS: 'view_shipments',
  UPDATE_SHIPMENT: 'update_shipment',
  DELETE_SHIPMENT: 'delete_shipment',
  MODIFY_SHIPMENT_STATUS: 'modify_shipment_status',
  
  // Product permissions
  CREATE_PRODUCT: 'create_product',
  VIEW_PRODUCTS: 'view_products',
  UPDATE_PRODUCT: 'update_product',
  DELETE_PRODUCT: 'delete_product',
  
  // Vehicle permissions
  CREATE_VEHICLE: 'create_vehicle',
  VIEW_VEHICLES: 'view_vehicles',
  UPDATE_VEHICLE: 'update_vehicle',
  DELETE_VEHICLE: 'delete_vehicle',
  
  // Route permissions
  CREATE_ROUTE: 'create_route',
  VIEW_ROUTES: 'view_routes',
  UPDATE_ROUTE: 'update_route',
  DELETE_ROUTE: 'delete_route',
  
  // User management permissions
  CREATE_USER: 'create_user',
  VIEW_USERS: 'view_users',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  MANAGE_ROLES: 'manage_roles',
  
  // System permissions
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  MANAGE_SETTINGS: 'manage_settings',
  ACCESS_ALL_DATA: 'access_all_data',
};

// Default role permissions
export const ROLE_PERMISSIONS = {
  superadmin: Object.values(PERMISSIONS), // All permissions
  admin: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.CREATE_SHIPMENT,
    PERMISSIONS.VIEW_SHIPMENTS,
    PERMISSIONS.UPDATE_SHIPMENT,
    PERMISSIONS.DELETE_SHIPMENT,
    PERMISSIONS.MODIFY_SHIPMENT_STATUS,
    PERMISSIONS.CREATE_PRODUCT,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.UPDATE_PRODUCT,
    PERMISSIONS.DELETE_PRODUCT,
    PERMISSIONS.CREATE_VEHICLE,
    PERMISSIONS.VIEW_VEHICLES,
    PERMISSIONS.UPDATE_VEHICLE,
    PERMISSIONS.DELETE_VEHICLE,
    PERMISSIONS.CREATE_ROUTE,
    PERMISSIONS.VIEW_ROUTES,
    PERMISSIONS.UPDATE_ROUTE,
    PERMISSIONS.DELETE_ROUTE,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.MANAGE_SETTINGS,
  ],
  user: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_SHIPMENTS,
    PERMISSIONS.CREATE_SHIPMENT,
    PERMISSIONS.UPDATE_SHIPMENT,
    PERMISSIONS.MODIFY_SHIPMENT_STATUS,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.CREATE_PRODUCT,
    PERMISSIONS.VIEW_VEHICLES,
    PERMISSIONS.VIEW_ROUTES,
  ],
};

export const PermissionProvider = ({ children }) => {
  const [userPermissions, setUserPermissions] = useState([]);
  const [customPermissions, setCustomPermissions] = useState({}); // For custom user permissions

  // Set permissions based on user role
  const setPermissionsForRole = (role, customUserPermissions = null) => {
    if (customUserPermissions && customUserPermissions.length > 0) {
      setUserPermissions(customUserPermissions);
    } else {
      setUserPermissions(ROLE_PERMISSIONS[role] || []);
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return userPermissions.includes(permission);
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => userPermissions.includes(permission));
  };

  // Check if user has all specified permissions
  const hasAllPermissions = (permissions) => {
    return permissions.every(permission => userPermissions.includes(permission));
  };

  // Update custom permissions for a user
  const updateCustomPermissions = (userId, permissions) => {
    setCustomPermissions(prev => ({
      ...prev,
      [userId]: permissions,
    }));
  };

  // Get custom permissions for a user
  const getCustomPermissions = (userId) => {
    return customPermissions[userId] || null;
  };

  // Add permission to user
  const addPermission = (permission) => {
    if (!userPermissions.includes(permission)) {
      setUserPermissions(prev => [...prev, permission]);
    }
  };

  // Remove permission from user
  const removePermission = (permission) => {
    setUserPermissions(prev => prev.filter(p => p !== permission));
  };

  // Get all permissions grouped by category
  const getGroupedPermissions = () => {
    return {
      dashboard: [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_ANALYTICS,
      ],
      shipments: [
        PERMISSIONS.CREATE_SHIPMENT,
        PERMISSIONS.VIEW_SHIPMENTS,
        PERMISSIONS.UPDATE_SHIPMENT,
        PERMISSIONS.DELETE_SHIPMENT,
        PERMISSIONS.MODIFY_SHIPMENT_STATUS,
      ],
      products: [
        PERMISSIONS.CREATE_PRODUCT,
        PERMISSIONS.VIEW_PRODUCTS,
        PERMISSIONS.UPDATE_PRODUCT,
        PERMISSIONS.DELETE_PRODUCT,
      ],
      vehicles: [
        PERMISSIONS.CREATE_VEHICLE,
        PERMISSIONS.VIEW_VEHICLES,
        PERMISSIONS.UPDATE_VEHICLE,
        PERMISSIONS.DELETE_VEHICLE,
      ],
      routes: [
        PERMISSIONS.CREATE_ROUTE,
        PERMISSIONS.VIEW_ROUTES,
        PERMISSIONS.UPDATE_ROUTE,
        PERMISSIONS.DELETE_ROUTE,
      ],
      users: [
        PERMISSIONS.CREATE_USER,
        PERMISSIONS.VIEW_USERS,
        PERMISSIONS.UPDATE_USER,
        PERMISSIONS.DELETE_USER,
        PERMISSIONS.MANAGE_ROLES,
      ],
      system: [
        PERMISSIONS.VIEW_AUDIT_LOGS,
        PERMISSIONS.MANAGE_SETTINGS,
        PERMISSIONS.ACCESS_ALL_DATA,
      ],
    };
  };

  return (
    <PermissionContext.Provider
      value={{
        userPermissions,
        customPermissions,
        setPermissionsForRole,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        updateCustomPermissions,
        getCustomPermissions,
        addPermission,
        removePermission,
        getGroupedPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};
