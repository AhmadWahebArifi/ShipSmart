import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { usePermission } from './PermissionContext';

const PermissionInitializer = ({ children }) => {
  const { user } = useAuth();
  const { setPermissionsForRole } = usePermission();

  // Set permissions when user changes
  useEffect(() => {
    if (user) {
      console.log('🔍 PermissionInitializer: User changed:', user);
      console.log('🔍 PermissionInitializer: User role:', user.role);
      console.log('🔍 PermissionInitializer: User permissions:', user.permissions);
      
      // Set permissions based on user role
      if (user.role) {
        // If user has custom permissions, use them
        if (user.permissions && Array.isArray(user.permissions)) {
          console.log('🔍 Setting custom permissions for role:', user.role);
          setPermissionsForRole(user.role, user.permissions);
        } else {
          console.log('🔍 Setting default permissions for role:', user.role);
          setPermissionsForRole(user.role);
        }
      }
    } else {
      console.log('🔍 PermissionInitializer: User logged out, clearing permissions');
      // Clear permissions when user logs out
      setPermissionsForRole(null);
    }
  }, [user, setPermissionsForRole]);

  return children;
};

export default PermissionInitializer;
