import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🚀 IMMEDIATE: Axios request interceptor called');
    console.log('🚀 IMMEDIATE: Request URL:', config.url);
    console.log('🚀 IMMEDIATE: Token exists:', !!token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔍 Axios: Adding token to request:', config.method?.toUpperCase(), config.url);
      console.log('🔍 Axios: Token length:', token.length);
    } else {
      console.log('🔍 Axios: No token found for request:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // TEMPORARY: Don't auto-logout on 401 to debug the issue
    if (error.response?.status === 401) {
      console.log('🔍 Axios: 401 Unauthorized detected - NOT logging out for debugging');
      console.log('🔍 Axios: Error response:', error.response?.data);
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

