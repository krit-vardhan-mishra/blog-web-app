import axios from 'axios';
import apiClient from './apiService.js';

const API_BASE_URL = 'http://localhost:5000/api';

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

  login: async (email, password) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
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

  verifyPassword: (password) => apiClient.post('/auth/verify-password', { password }),
};

const passwordResetService = {
  sendResetOTP: async (email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send OTP');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  verifyResetOTP: async (email, otp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-reset-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid OTP');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },
};

export default authService;

export { passwordResetService };