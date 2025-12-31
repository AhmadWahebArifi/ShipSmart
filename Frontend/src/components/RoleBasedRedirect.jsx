import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermission } from '../context/PermissionContext';

const RoleBasedRedirect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = usePermission();

  React.useEffect(() => {
    if (!user) return;

    // Redirect based on user role and permissions
    if (hasPermission('view_dashboard')) {
      navigate('/dashboard', { replace: true });
    } else if (hasPermission('view_shipments')) {
      navigate('/shipments', { replace: true });
    } else if (hasPermission('view_products')) {
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
