import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SidebarProvider } from "./context/SidebarContext";
import { LoaderProvider } from "./context/LoaderContext";
import { PermissionProvider } from "./context/PermissionContext";
import PermissionInitializer from "./context/PermissionInitializer";
import Loader from "./components/Loader";
import AppLoader from "./components/AppLoader";
import ProtectedRoute from "./components/ProtectedRoute";
import AccessDenied from "./components/AccessDenied";
import "./i18n/config"; // Initialize i18n
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Shipments from "./pages/Shipments";
import Products from "./pages/Products";
import UserManagement from "./pages/UserManagement";
import RoleManagement from "./pages/RoleManagement";
import NotFound from "./pages/NotFound";
import Vehicles from "./pages/Vehicles";
import RoutesPage from "./pages/Routes";
import Analytics from "./pages/Analytics";
import AuditLogs from "./pages/AuditLogs";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PermissionProvider>
          <PermissionInitializer>
            <LoaderProvider>
              <SidebarProvider>
                <AppLoader />
                <Router>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute requiredPermission="view_dashboard">
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute requiredPermission="manage_settings">
                          <Settings />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute requiredPermission="view_profile">
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/role-management"
                      element={
                        <ProtectedRoute requiredPermission="manage_roles">
                          <RoleManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/shipments"
                      element={
                        <ProtectedRoute requiredPermission="view_shipments">
                          <Shipments />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/shipments/:id"
                      element={
                        <ProtectedRoute requiredPermission="view_shipments">
                          <Shipments />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/products"
                      element={
                        <ProtectedRoute requiredPermission="view_products">
                          <Products />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/vehicles"
                      element={
                        <ProtectedRoute requiredPermission="view_vehicles">
                          <Vehicles />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/users"
                      element={
                        <ProtectedRoute requiredPermission="view_users">
                          <UserManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/routes"
                      element={
                        <ProtectedRoute requiredPermission="view_routes">
                          <RoutesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/analytics"
                      element={
                        <ProtectedRoute requiredPermission="view_analytics">
                          <Analytics />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/audit-logs"
                      element={
                        <ProtectedRoute requiredPermission="view_audit_logs">
                          <AuditLogs />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/"
                      element={<Navigate to="/dashboard" replace />}
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Router>
              </SidebarProvider>
            </LoaderProvider>
          </PermissionInitializer>
        </PermissionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
