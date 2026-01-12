import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../config/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Debug localStorage on mount
  useEffect(() => {
    console.log('🔍 AuthContext: Initial mount');
    console.log('🔍 AuthContext: localStorage token:', localStorage.getItem('token'));
    console.log('🔍 AuthContext: localStorage keys:', Object.keys(localStorage));
    console.log('🔍 AuthContext: Initial token state:', token);
  }, []);

  // Fetch user info if token exists
  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('🔍 AuthContext: Fetching user with token...');
        console.log('🔍 AuthContext: Token exists:', !!token);
        console.log('🔍 AuthContext: Token length:', token?.length);
        console.log('🔍 AuthContext: Token preview:', token?.substring(0, 20) + '...');
        
        const response = await axiosInstance.get('/auth/me');
        
        console.log('🔍 AuthContext: User fetch response:', response.data);
        
        if (response.data && response.data.success) {
          console.log('✅ AuthContext: User fetched successfully:', response.data.user);
          setUser(response.data.user);
        } else {
          console.error('❌ AuthContext: User fetch failed:', response.data);
          throw new Error('Failed to fetch user');
        }
      } catch (error) {
        console.error('❌ AuthContext: Error fetching user:', error);
        console.error('❌ AuthContext: Error response:', error.response?.data);
        console.error('❌ AuthContext: Error status:', error.response?.status);
        
        // TEMPORARY: Completely disable logout to debug the issue
        if (error.response?.status !== 401) {
          logout();
        } else {
          console.warn('⚠️ AuthContext: 401 error detected but NOT logging out for debugging');
          // Don't set loading to false - keep app in loading state to see what happens
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      console.log('🔍 AuthContext: Token found, fetching user...');
      fetchUser();
    } else {
      console.log('🔍 AuthContext: No token found, staying logged out');
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      
      if (response.data && response.data.success) {
        setUser(response.data.user);
      } else {
        throw new Error('Failed to fetch user');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login with email:', email.trim().toLowerCase());
      
      const response = await axiosInstance.post('/auth/login', { 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      console.log('✅ Login response received:', response.data);
      
      if (response.data && response.data.success) {
        const { token: newToken, user: userData } = response.data;
        
        console.log('✅ Login successful, setting token and user');
        console.log('📋 User data received:', userData);
        console.log('🔐 User permissions:', userData.permissions);
        console.log('👤 User role:', userData.role);
        
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        
        return { success: true };
      } else {
        console.error('❌ Login failed:', response.data);
        return {
          success: false,
          message: response.data?.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        request: error.request ? 'Request made but no response' : null
      });
      
      // Handle network errors
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        return {
          success: false,
          message: 'Cannot connect to server. Make sure the backend is running on http://localhost:5000'
        };
      }
      
      // Handle axios errors
      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data || {};
        let errorMessage = errorData.message || 'Login failed';
        
        // Include detailed error if available
        if (errorData.error) {
          if (typeof errorData.error === 'string') {
            errorMessage = `${errorMessage}: ${errorData.error}`;
          } else if (errorData.error.message) {
            errorMessage = `${errorMessage}: ${errorData.error.message}`;
          }
        }
        
        console.error('Login API error:', error.response.status, errorData);
        
        return {
          success: false,
          message: errorMessage
        };
      } else if (error.request) {
        // Request made but no response
        console.error('No response from server. Request:', error.request);
        return {
          success: false,
          message: 'No response from server. Please check if the backend is running on http://localhost:5000'
        };
      } else {
        // Something else happened
        console.error('Unexpected error:', error);
        return {
          success: false,
          message: error.message || 'An unexpected error occurred'
        };
      }
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axiosInstance.post('/auth/register', {
        username,
        email: email.trim().toLowerCase(),
        password
      });
      
      if (response.data && response.data.success) {
        const { token: newToken, user: userData } = response.data;
        
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        
        return { success: true };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Registration failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    console.log('🔍 AuthContext: LOGOUT FUNCTION CALLED!!!');
    console.log('🔍 AuthContext: Call stack:', new Error().stack);
    console.log('🔍 AuthContext: Clearing token and user data');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Test function to manually check auth endpoint
  const testAuthEndpoint = async () => {
    console.log('🧪 Testing auth endpoint manually...');
    try {
      const token = localStorage.getItem('token');
      console.log('🧪 Manual test - Token exists:', !!token);
      
      // Make a direct fetch request to see what happens
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      console.log('🧪 Manual test - Response status:', response.status);
      console.log('🧪 Manual test - Response data:', data);
      
    } catch (error) {
      console.error('🧪 Manual test - Error:', error);
    }
  };

  // Add test function to window for manual testing
  useEffect(() => {
    window.testAuth = testAuthEndpoint;
    
    // TEMPORARY: Add bypass function for debugging
    window.bypassAuth = (userData) => {
      console.log('🔧 Bypassing auth with user:', userData);
      setUser(userData);
      setLoading(false);
    };
  }, []);

  // Function to refresh user data
  const refreshUser = async () => {
    if (token) {
      await fetchUser();
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

