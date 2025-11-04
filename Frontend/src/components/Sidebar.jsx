import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  HiBars3,
  HiXMark,
  HiHome,
  HiTruck,
  HiCube,
  HiMap,
  HiChartBar,
  HiCog6Tooth,
  HiArrowRightOnRectangle,
  HiMoon,
  HiSun,
  HiUser
} from 'react-icons/hi2';

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeItem, setActiveItem] = useState(location.pathname);

  const menuItems = [
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: HiHome, path: '/dashboard' },
    { id: 'shipments', label: t('sidebar.shipments'), icon: HiCube, path: '/shipments' },
    { id: 'routes', label: t('sidebar.routes'), icon: HiMap, path: '/routes' },
    { id: 'vehicles', label: t('sidebar.vehicles'), icon: HiTruck, path: '/vehicles' },
    { id: 'analytics', label: t('sidebar.analytics'), icon: HiChartBar, path: '/analytics' },
    { id: 'admin', label: 'Profile', icon: HiUser, path: '/admin' },
  ];

  const handleNavigation = (path, e) => {
    // Prevent event propagation to avoid closing sidebar on mobile
    if (e) {
      e.stopPropagation();
    }
    setActiveItem(path);
    navigate(path);
    // Don't close sidebar - only menu button should close it
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Overlay for mobile - removed onClick to prevent closing on click */}
      {isOpen && (
        <div
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />
      )}

      {/* Sidebar */}
      <aside
        onClick={(e) => e.stopPropagation()}
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out ${
          isOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        } ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isDark
            ? 'bg-gray-900 border-r border-gray-800'
            : 'bg-white border-r border-gray-200'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between h-16 px-4 border-b ${
          isDark ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <div className={`flex items-center gap-3 flex-1 transition-all duration-300 ${
            isCollapsed ? 'justify-center' : ''
          }`}>
            <div className={`p-2 rounded-lg flex-shrink-0 ${
              isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'
            }`}>
              <HiTruck className="w-6 h-6" />
            </div>
            {!isCollapsed && (
              <h2 className={`text-xl font-bold transition-all duration-300 ${
                isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
              } ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                ShipSmart
              </h2>
            )}
          </div>
          
          {/* Toggle Button (Desktop) */}
          <button
            onClick={onToggleCollapse}
            className={`hidden lg:flex p-2 rounded-lg transition-colors ml-2 flex-shrink-0 ${
              isDark
                ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <HiBars3 className={`w-5 h-5 transition-transform duration-300 ${
              isCollapsed ? 'rotate-0' : 'rotate-90'
            }`} />
          </button>
          
          {/* Close Button (Mobile) */}
          <button
            onClick={onClose}
            className={`lg:hidden p-2 rounded-lg transition-colors flex-shrink-0 ${
              isDark
                ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.path;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={(e) => handleNavigation(item.path, e)}
                    onMouseDown={(e) => e.stopPropagation()}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
              isCollapsed ? 'justify-center' : ''
            } ${
              isActive
                ? isDark
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : isDark
                ? 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title={isCollapsed ? item.label : ''}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 transition-transform ${
                      isActive ? 'scale-110' : 'group-hover:scale-110'
                    }`} />
                    {!isCollapsed && (
                      <span className={`font-medium transition-all duration-300 ${
                        isCollapsed ? 'opacity-0 w-0 -translate-x-4' : 'opacity-100 translate-x-0'
                      }`}>
                        {item.label}
                      </span>
                    )}
                    {isActive && !isCollapsed && (
                      <HiArrowRightOnRectangle className="w-4 h-4 ml-auto transform rotate-90 transition-all duration-300" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Settings & User Section */}
        <div className={`border-t p-4 space-y-2 ${
          isDark ? 'border-gray-800' : 'border-gray-200'
        }`}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isCollapsed ? 'justify-center' : ''
            } ${
              isDark
                ? 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title={isCollapsed ? (isDark ? 'Light Mode' : 'Dark Mode') : ''}
          >
            {isDark ? (
              <HiSun className="w-5 h-5 flex-shrink-0" />
            ) : (
              <HiMoon className="w-5 h-5 flex-shrink-0" />
            )}
            {!isCollapsed && (
              <span className={`font-medium transition-all duration-300 ${
                isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
              }`}>
                {t('sidebar.toggleTheme')}
              </span>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={(e) => handleNavigation('/settings', e)}
            onMouseDown={(e) => e.stopPropagation()}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isCollapsed ? 'justify-center' : ''
            } ${
              isDark
                ? 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title={isCollapsed ? 'Settings' : ''}
          >
            <HiCog6Tooth className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className={`font-medium transition-all duration-300 ${
                isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
              }`}>
                {t('sidebar.settings')}
              </span>
            )}
          </button>

          {/* User Info */}
          {!isCollapsed && user && (
            <div className={`mt-4 pt-4 border-t ${
              isDark ? 'border-gray-800' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                {user.profile_pic && user.profile_pic.trim() !== '' && user.profile_pic !== 'null' ? (
                  <img
                    key={user.profile_pic} // Force re-render when profile_pic changes
                    src={user.profile_pic}
                    alt={user.name || user.username || 'User'}
                    className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                    onError={(e) => {
                      // Hide broken image and show fallback
                      e.target.style.display = 'none';
                      const parent = e.target.parentElement;
                      if (!parent.querySelector('.profile-fallback')) {
                        const fallback = document.createElement('div');
                        fallback.className = `profile-fallback w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                          isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                        }`;
                        fallback.textContent = (user.name || user.username)?.charAt(0).toUpperCase() || 'U';
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    isDark
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {(user.name || user.username)?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate capitalize ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {user.name || user.username || 'User'}
                  </p>
                  <p className={`text-xs truncate capitalize ${
                    isDark ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    {user.role || 'User'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* User Info (Collapsed) */}
          {isCollapsed && user && (
            <div className="flex justify-center mb-2">
              {user.profile_pic && user.profile_pic.trim() !== '' && user.profile_pic !== 'null' ? (
                <img
                  key={user.profile_pic} // Force re-render when profile_pic changes
                  src={user.profile_pic}
                  alt={user.name || user.username || 'User'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                  onError={(e) => {
                    // Hide broken image and show fallback
                    e.target.style.display = 'none';
                    const parent = e.target.parentElement;
                    if (!parent.querySelector('.profile-fallback')) {
                      const fallback = document.createElement('div');
                      fallback.className = `profile-fallback w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                      }`;
                      fallback.textContent = (user.name || user.username)?.charAt(0).toUpperCase() || 'U';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  isDark
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {(user.name || user.username)?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isCollapsed ? 'justify-center' : ''
            } ${
              isDark
                ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                : 'text-red-600 hover:text-red-700 hover:bg-red-50'
            }`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <HiArrowRightOnRectangle className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className={`font-medium transition-all duration-300 ${
                isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
              }`}>
                {t('sidebar.logout')}
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

