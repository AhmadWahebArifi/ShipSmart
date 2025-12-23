import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { usePermission } from './PermissionContext';

const PermissionInitializer = ({ children }) => {
  const { user } = useAuth();
  const { setPermissionsForRole } = usePermission();

  // Set permissions when user changes
  useEffect(() => {
    if (user) {
      // Set permissions based on user role
      setPermissionsForRole(user.role);
    } else {
      // Clear permissions when user logs out
      setPermissionsForRole(null);
    }
  }, [user, setPermissionsForRole]);

  return children;
};

export default PermissionInitializer;
