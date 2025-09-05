import axios from 'axios';

const isProduction = () => {
  // Check if running in Capacitor
  const isCapacitor = typeof window !== 'undefined' && window.Capacitor;
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isRenderDomain = hostname.includes('onrender.com');
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isCapacitorLocalhost = hostname === 'localhost' && isCapacitor;
    
    // If it's Capacitor with localhost, check environment variable
    if (isCapacitorLocalhost) {
      const envMode = import.meta.env.VITE_NODE_ENV || import.meta.env.NODE_ENV || 'DEVELOPMENT';
      return envMode === 'PRODUCTION' || envMode === 'production';
    }
    
    if (isRenderDomain || !isLocalhost) {
      return true;
    }
  }
  
  const envMode = import.meta.env.VITE_NODE_ENV || import.meta.env.NODE_ENV || 'DEVELOPMENT';
  return envMode === 'PRODUCTION' || envMode === 'production';
};

const getApiBaseUrl = () => {
  if (isProduction()) {
    // In production, always use the explicit API URL for Capacitor apps
    return import.meta.env.VITE_API_BASE_URL || 'https://blog-web-app-ngmh.onrender.com/api';
  }
  
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

if (!isProduction()) {
  console.log('🔧 API Configuration:', {
    isProduction: isProduction(),
    apiBaseUrl: API_BASE_URL,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
    origin: typeof window !== 'undefined' ? window.location.origin : 'N/A'
  });
}

export const getBaseURL = () => {
  if (isProduction()) {
    return typeof window !== 'undefined' ? window.location.origin : 'https://blog-web-app-ngmh.onrender.com';
  }
  return API_BASE_URL.replace('/api', '');
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  retry: 3,
  retryDelay: (retryCount) => {
    return retryCount * 1000;
  }
});

apiClient.interceptors.request.use(
  (config) => {
    const authEndpoints = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/verify-reset-otp', '/auth/reset-password'];
    const isAuthEndpoint = authEndpoints.some(endpoint => config.url.includes(endpoint));
    
    if (!isProduction()) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullUrl: `${config.baseURL}${config.url}`,
        isAuthEndpoint
      });
    }
    
    if (!isAuthEndpoint) {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error.message);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const { config } = error;

    const shouldNotRetry = [429, 401, 403].includes(error.response?.status);

    if (config && config.retry && !shouldNotRetry) {
      config.retryCount = config.retryCount || 0;

      if (config.retryCount < config.retry) {
        config.retryCount += 1;
        const delayRetry = new Promise(resolve =>
          setTimeout(resolve, config.retryDelay(config.retryCount))
        );
        return delayRetry.then(() => apiClient(config));
      }
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(
        new Error(`Request timed out after ${error.config.timeout}ms`)
      );
    }

    const errorMessage = error.response?.data?.message || error.message;

    if (error.response?.status === 429) {
      if (errorMessage.includes('Account temporarily locked')) {
        const minutes = errorMessage.match(/\d+/)?.[0] || '25';
        error.lockoutTime = parseInt(minutes);
        error.isAccountLocked = true;
      }

      return Promise.reject(error);
    }

    if (errorMessage.includes('Account temporarily locked')) {
      const minutes = errorMessage.match(/\d+/)?.[0] || '25';
      error.lockoutTime = parseInt(minutes);
      error.isAccountLocked = true;
    }

    if (error.response?.status === 401) {
      // For login and register endpoints, pass through the original error
      const isAuthLogin = error.config?.url?.includes('/auth/login');
      const isAuthRegister = error.config?.url?.includes('/auth/register');
      
      if (isAuthLogin || isAuthRegister) {
        return Promise.reject(error);
      }
      
      // For other endpoints that require authentication, handle token/session issues
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      const authPages = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-otp'];
      const currentPath = window.location.pathname;
      const isOnAuthPage = authPages.some(page => currentPath.includes(page));
      
      if (!isOnAuthPage) {
        window.location.href = '/login';
      }

      return Promise.reject(new Error('Session expired. Please log in again.'));
    }

    if (error.response?.status === 403) {
      // Check if this is an email verification required scenario
      if (error.response?.data?.requiresVerification) {
        // Don't redirect for email verification - let the frontend handle it
        return Promise.reject(error);
      }
      
      // For other 403 errors, handle normally
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      const authPages = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-otp'];
      const currentPath = window.location.pathname;
      const isOnAuthPage = authPages.some(page => currentPath.includes(page));
      
      if (!isOnAuthPage) {
        window.location.href = '/login';
      }
      
      return Promise.reject(
        new Error('Access denied. Please check your permissions.')
      );
    }

    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;