import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermission } from '../context/PermissionContext';

const RoleBasedRedirect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = usePermission();

  console.log('🚀 IMMEDIATE: RoleBasedRedirect component loaded');
  console.log('🚀 IMMEDIATE: RoleBasedRedirect - User:', user);
  console.log('🚀 IMMEDIATE: RoleBasedRedirect - User role:', user?.role);

  React.useEffect(() => {
    console.log('🚀 IMMEDIATE: RoleBasedRedirect useEffect called');
    console.log('🚀 IMMEDIATE: RoleBasedRedirect - User in useEffect:', user);
    
    if (!user) {
      console.log('🚀 IMMEDIATE: RoleBasedRedirect - No user, returning');
      return;
    }

    console.log('🚀 IMMEDIATE: RoleBasedRedirect - Checking permissions for redirect...');
    // Redirect based on user role and permissions
    if (hasPermission('view_dashboard')) {
      console.log('🚀 IMMEDIATE: RoleBasedRedirect - Redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    } else if (hasPermission('view_shipments')) {
      console.log('🚀 IMMEDIATE: RoleBasedRedirect - Redirecting to shipments');
      navigate('/shipments', { replace: true });
    } else if (hasPermission('view_products')) {
      console.log('🚀 IMMEDIATE: RoleBasedRedirect - Redirecting to products');
      navigate('/products', { replace: true });
    } else if (hasPermission('view_vehicles')) {
      navigate('/vehicles', { replace: true });
    } else if (hasPermission('view_routes')) {
      navigate('/routes', { replace: true });
    } else if (hasPermission('view_users')) {
      navigate('/users', { replace: true });
    } else if (hasPermission('view_profile')) {
      navigate('/admin', { replace: true });
    } else {
      // If user has no permissions, redirect to login
      navigate('/login', { replace: true });
    }
  }, [user, hasPermission, navigate]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting...</p>
      </div>
    </div>
  );
};

export default RoleBasedRedirect;
