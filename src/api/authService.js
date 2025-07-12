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

export default authService;