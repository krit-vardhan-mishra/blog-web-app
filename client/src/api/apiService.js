import axios from 'axios';

const MODE = import.meta.env.VITE_NODE_ENV || 'DEVELOPMENT';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (MODE === 'PRODUCTION' ? '/api' : 'http://localhost:5000/api');

export const getBaseURL = () => {
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