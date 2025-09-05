import apiClient from './apiService.js';

const userService = {
  fetchAll: () => apiClient.get('/users/').then(res => res.data || res),
  fetchById: (userId) => apiClient.get(`/users/${userId}`)
    .then(response => {
      // Handle ApiResponse format - extract data from response
      if (response && response.success !== undefined && response.data) {
        return response.data;
      }
      return response;
    })
    .catch(error => {
      // Handle user not found with a custom response
      if (error.response && error.response.status === 404) {
        return { 
          _id: userId,
          name: 'Unknown User', 
          email: 'user@unknown.com',
          isPlaceholder: true  // Flag to identify placeholder users
        };
      }
      throw error;
    }),
  fetchByEmail: (email) => apiClient.get(`/users/search/email/${email}`).then(res => res.data || res),
  fetchByUsername: (username) => apiClient.get(`/users/search/username/${username}`).then(res => res.data || res),
  create: (userData) => apiClient.post('/users', userData).then(res => res.data || res),
  updateProfile: (userData) => apiClient.put('/users/profile', userData).then(res => res.data || res),
  getCurrentUser: () => apiClient.get('/users/profile').then(res => res.data || res),
  deleteAccount: (userId, deleteBlogs) =>
    apiClient.delete(`/users/delete/${userId}`, {
      data: { deleteBlogs }
    }).then(res => res.data || res),
};

export default userService;