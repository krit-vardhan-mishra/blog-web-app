import apiClient from './apiService.js';

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

  login: async (email, password) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const response = await apiClient.post('/auth/login', { email, password });
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
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
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to change password';
    }
  },
};

const passwordResetService = {
  sendResetOTP: (email) => apiClient.post('/auth/forgot-password', { email }),
  verifyResetOTP: (email, otp) =>
    apiClient.post('/auth/verify-reset-otp', { email, otp }),
  resetPassword: (email, otp, newPassword) =>
    apiClient.post('/auth/reset-password', { email, otp, newPassword }),
};

export const setPassword = async (newPassword) => {
  const token = localStorage.getItem('authToken');
  const res = await fetch('/api/auth/set-password', {
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
