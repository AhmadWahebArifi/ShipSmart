import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermission } from '../context/PermissionContext';
import AccessDenied from './AccessDenied';

const ProtectedRoute = ({ children, requiredPermission, requiredPermissions = [] }) => {
  const { user } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();
  const location = useLocation();

  console.log('🔍 ProtectedRoute: Checking access');
  console.log('🔍 ProtectedRoute: User:', user);
  console.log('🔍 ProtectedRoute: User role:', user?.role);
  console.log('🔍 ProtectedRoute: Required permission:', requiredPermission);
  console.log('🔍 ProtectedRoute: Has permission:', hasPermission(requiredPermission));

  // If user is not authenticated, redirect to login
  if (!user) {
    console.log('🔍 ProtectedRoute: No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has the required permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    console.log('🔍 ProtectedRoute: Permission denied, showing AccessDenied');
    return <AccessDenied />;
  }

  // Check if user has any of the required permissions (OR condition)
  if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
    console.log('🔍 ProtectedRoute: Multiple permissions check failed, showing AccessDenied');
    return <AccessDenied />;
  }

  console.log('🔍 ProtectedRoute: Access granted, rendering children');
  // If all checks pass, render the children
  return children;
};

export default ProtectedRoute;
