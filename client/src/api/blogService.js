import apiClient from './apiService.js';

const blogService = {
  fetchAll: async () => {
    const response = await apiClient.get('/blogs');
    const blogs = response.blogs || response;
    return blogs.map((blog) => ({
      ...blog,
      _id: blog._id || blog.id,
    }));
  },

  fetchById: (blogId) => apiClient.get(`/blogs/${blogId}`),
  create: (blogData) => apiClient.post('/blogs', blogData),
  update: (blogId, blogData) => apiClient.put(`/blogs/${blogId}`, blogData),
  delete: (blogId) => apiClient.delete(`/blogs/${blogId}`),
  permanentlyDelete: (blogId) => apiClient.delete(`/blogs/permanent/${blogId}`),
  restore: (blogId) => apiClient.post(`/blogs/restore/${blogId}`),
  incrementView: (blogId) => {
    return apiClient.post(`/blogs/increment-view/${blogId}`);
  },
  fetchDeleted: async () => {
    const response = await apiClient.get('/blogs/deleted');
    const blogs = response.blogs || response;
    return blogs.map((blog) => ({
      ...blog,
      _id: blog._id || blog.id,
    }));
  },
};

export default blogService;