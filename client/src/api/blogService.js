import apiClient from './apiService.js';

const blogService = {
  fetchAll: async () => {
    try {
      const response = await apiClient.get('/blogs');
      const blogs = response.blogs || response;

      return blogs.map((blog) => ({
        ...blog,
        _id: blog._id || blog.id,
      }));
    } catch (error) {
      console.error('❌ Error fetching blogs:', error.message);
      throw error;
    }
  },

  fetchById: async (blogId) => {
    try {
      const response = await apiClient.get(`/blogs/${blogId}`);
      return response;
    } catch (error) {
      console.error('❌ Error fetching blog by ID:', error.message);
      throw error;
    }
  },

  // New method to fetch blogs by user ID
  fetchByUserId: async (userId) => {
    try {
      const response = await apiClient.get(`/blogs/user/${userId}`);
      const blogs = response.blogs || response;

      return blogs.map((blog) => ({
        ...blog,
        _id: blog._id || blog.id,
      }));
    } catch (error) {
      console.error('❌ Error fetching blogs by user ID:', error.message);
      throw error;
    }
  },

  create: async (blogData) => {
    try {
      const response = await apiClient.post('/blogs', blogData);
      return response;
    } catch (error) {
      console.error('❌ Error creating blog:', error.message);
      throw error;
    }
  },

  update: async (blogId, blogData) => {
    try {
      const response = await apiClient.put(`/blogs/${blogId}`, blogData);
      return response;
    } catch (error) {
      console.error('❌ Error updating blog:', error.message);
      throw error;
    }
  },

  delete: async (blogId) => {
    try {
      const response = await apiClient.delete(`/blogs/${blogId}`);
      return response;
    } catch (error) {
      console.error('❌ Error deleting blog:', error.message);
      throw error;
    }
  },

  permanentlyDelete: async (blogId) => {
    try {
      const response = await apiClient.delete(`/blogs/permanent/${blogId}`);
      return response;
    } catch (error) {
      console.error('❌ Error permanently deleting blog:', error.message);
      throw error;
    }
  },

  restore: async (blogId) => {
    try {
      const response = await apiClient.post(`/blogs/restore/${blogId}`);
      return response;
    } catch (error) {
      console.error('❌ Error restoring blog:', error.message);
      throw error;
    }
  },

  incrementView: async (blogId) => {
    try {
      const response = await apiClient.post(`/blogs/increment-view/${blogId}`);
      return response;
    } catch (error) {
      console.error('❌ Error incrementing view:', error.message);
      throw error;
    }
  },

  fetchDeleted: async () => {
    try {
      const response = await apiClient.get('/blogs/deleted');
      const blogs = response.blogs || response;

      return blogs.map((blog) => ({
        ...blog,
        _id: blog._id || blog.id,
      }));
    } catch (error) {
      console.error('❌ Error fetching deleted blogs:', error.message);
      throw error;
    }
  },
};

export default blogService;
