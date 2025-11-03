import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import MobileMenuButton from '../components/MobileMenuButton';
import axiosInstance from '../config/axios';
import {
  HiUserCircle,
  HiEnvelope,
  HiUser,
  HiMapPin,
  HiCamera,
  HiCheck,
  HiXMark
} from 'react-icons/hi2';

function Admin() {
  const { t } = useTranslation();
  const { user: authUser, setUser } = useAuth();
  const { isDark } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    profile_pic: ''
  });

  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    // Load user profile data
    if (authUser) {
      setFormData({
        name: authUser.name || '',
        address: authUser.address || '',
        profile_pic: authUser.profile_pic || ''
      });
      setPreviewImage(authUser.profile_pic || '');
    }
  }, [authUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData(prev => ({
          ...prev,
          profile_pic: base64String
        }));
        setPreviewImage(base64String);
        setError('');
        setSuccess('');
      };
      reader.onerror = () => {
        setError('Error reading image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      profile_pic: ''
    }));
    setPreviewImage('');
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await axiosInstance.put('/auth/profile', formData);

      if (response.data && response.data.success) {
        setSuccess('Profile updated successfully!');
        // Update user in auth context
        setUser(response.data.user);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data?.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      console.error('Error response:', err.response);
      
      if (err.response?.data) {
        const errorData = err.response.data;
        let errorMessage = errorData.message || 'Failed to update profile';
        
        // Include detailed error if available
        if (errorData.error) {
          if (typeof errorData.error === 'string') {
            errorMessage = `${errorMessage}: ${errorData.error}`;
          } else if (errorData.error.message) {
            errorMessage = `${errorMessage}: ${errorData.error.message}`;
          }
        }
        
        setError(errorMessage);
      } else if (err.request) {
        setError('No response from server. Please check if the backend is running.');
      } else {
        setError(err.message || 'Failed to update profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${
      isDark ? 'bg-gray-950' : 'bg-gray-50'
    }`}>
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* Mobile Menu Button */}
      <MobileMenuButton onClick={toggleSidebar} isDark={isDark} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${
        sidebarOpen || !sidebarCollapsed ? 'lg:ml-64' : 'lg:ml-20'
      }`}>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${
                isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'
              }`}>
                <HiUserCircle className="w-6 h-6" />
              </div>
              <h1 className={`text-3xl font-bold transition-colors ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                Profile Settings
              </h1>
            </div>
            <p className={`text-sm transition-colors ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Manage your profile information
            </p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className={`mb-6 p-4 rounded-lg border transition-all duration-300 ${
              isDark
                ? 'bg-green-900/30 border-green-700 text-green-300'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}>
              <div className="flex items-center gap-2">
                <HiCheck className="w-5 h-5" />
                <span>{success}</span>
              </div>
            </div>
          )}

          {error && (
            <div className={`mb-6 p-4 rounded-lg border transition-all duration-300 ${
              isDark
                ? 'bg-red-900/30 border-red-700 text-red-300'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center gap-2">
                <HiXMark className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Profile Card */}
          <div className={`rounded-xl shadow-lg border p-6 mb-6 transition-all duration-300 ${
            isDark
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  {previewImage ? (
                    <div className="relative">
                      <img
                        src={previewImage}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-300 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className={`absolute top-0 right-0 p-2 rounded-full transition-all duration-200 transform hover:scale-110 ${
                          isDark
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        <HiXMark className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${
                      isDark
                        ? 'border-gray-600 bg-gray-700'
                        : 'border-gray-300 bg-gray-100'
                    }`}>
                      <HiUserCircle className={`w-20 h-20 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                  )}
                </div>
                <label className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  isDark
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  <HiCamera className="w-5 h-5" />
                  <span className="font-medium">{previewImage ? 'Change Photo' : 'Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Max size: 5MB (JPG, PNG, etc.)
                </p>
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <div className="flex items-center gap-2">
                    <HiEnvelope className="w-4 h-4" />
                    Email Address
                  </div>
                </label>
                <input
                  type="email"
                  value={authUser?.email || ''}
                  disabled
                  className={`w-full px-4 py-2 border rounded-lg transition-all duration-300 cursor-not-allowed ${
                    isDark
                      ? 'bg-gray-700/50 border-gray-600 text-gray-400'
                      : 'bg-gray-50 border-gray-300 text-gray-500'
                  }`}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Email cannot be changed
                </p>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className={`block text-sm font-medium mb-2 transition-colors ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <div className="flex items-center gap-2">
                    <HiUser className="w-4 h-4" />
                    Full Name
                  </div>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className={`block text-sm font-medium mb-2 transition-colors ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <div className="flex items-center gap-2">
                    <HiMapPin className="w-4 h-4" />
                    Address
                  </div>
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 resize-none ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter your address"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } shadow-lg`}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <HiCheck className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;

