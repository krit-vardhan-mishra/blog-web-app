import apiClient, { getBaseURL } from './apiService.js';

const authService = {
  register: async (firstName, lastName, email, password, age) => {
    return apiClient.post('/auth/register', {
      firstName,
      lastName,
      email,
      password,
      age: parseInt(age),
    });
  },

  verifySignup: async (email, otp) => {
    return apiClient.post('/auth/verify-signup', { email, otp });
  },

  resendOTP: async (email, type) => {
    return apiClient.post('/auth/resend-otp', { email, type });
  },

  login: async (email, password, rememberMe = false) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      if (response.token) {
        if (rememberMe) {
          localStorage.setItem('token', response.token);
        } else {
          sessionStorage.setItem('token', response.token);
        }
      }
      if (response.user) {
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(response.user));
        } else {
          sessionStorage.setItem('user', JSON.stringify(response.user));
        }
      }

      return response;
    } catch (error) {
      // Check if this is an email verification error
      if (error.response?.status === 403 && error.response?.data?.requiresVerification) {
        // Re-throw the error with the original response data
        const verificationError = new Error(error.response.data.message);
        verificationError.response = error.response;
        throw verificationError;
      }
      
      // For other errors, handle normally
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  verifyPassword: async (password) => {
    try {
      const response = await apiClient.post('/auth/verify-password', {
        password,
      });
      return response.success;
    } catch (error) {
      console.error('Password verification error:', error);
      throw error;
    }
  },

  validateToken: async (token) => {
    try {
      const response = await apiClient.get('/auth/validate-token', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { valid: true, user: response.user };
    } catch (error) {
      console.error('Token validation failed:', error);
      return { valid: false };
    }
  },

  changePassword: async (currentPassword, newPassword, token) => {
    try {
      const response = await apiClient.post(
        '/auth/change-password',
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to change password';
      throw errorMessage;
    }
  },
};

const passwordResetService = {
  sendResetOTP: (email) => apiClient.post('/auth/forgot-password', { email }),
  verifyResetOTP: (email, otp) =>
    apiClient.post('/auth/verify-reset-otp', { email, otp }),
  resetPassword: (email, otp, newPassword) =>
    apiClient.post('/auth/reset-password', { email, otp, newPassword }),
  setPassword: async (newPassword) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const res = await fetch(`${getBaseURL()}/api/auth/set-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to set password');
    return data;
  }
};

export const setPassword = async (newPassword) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const res = await fetch(`${getBaseURL()}/api/auth/set-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to set password');
  return data;
};

export default authService;

export { passwordResetService };