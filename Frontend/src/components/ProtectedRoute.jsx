import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermission } from '../context/PermissionContext';
import AccessDenied from './AccessDenied';

const ProtectedRoute = ({ children, requiredPermission, requiredPermissions = [] }) => {
  const { user } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();
  const location = useLocation();

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has the required permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <AccessDenied />;
  }

  // Check if user has any of the required permissions (OR condition)
  if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
    return <AccessDenied />;
  }

  // If all checks pass, render the children
  return children;
};

export default ProtectedRoute;
