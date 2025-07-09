import apiClient from './apiService.js';

const userService = {
  fetchAll: () => apiClient.get('/users'),
  fetchById: (userId) => apiClient.get(`/users/${userId}`),
  create: (userData) => apiClient.post('/users', userData),
  updateProfile: (userData) => apiClient.put('/user/profile', userData),
};

export default userService;