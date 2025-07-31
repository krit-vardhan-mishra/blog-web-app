import apiClient from './apiService.js';

const blogService = {
  fetchAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (filters.genre && filters.genre !== 'All') {
        queryParams.append('genre', filters.genre);
      }
      if (filters.tags && filters.tags.length > 0) {
        queryParams.append('tags', filters.tags.join(','));
      }
      if (filters.difficulty) {
        queryParams.append('difficulty', filters.difficulty);
      }
      if (filters.sortBy) {
        queryParams.append('sortBy', filters.sortBy);
      }
      if (filters.order) {
        queryParams.append('order', filters.order);
      }
      if (filters.page) {
        queryParams.append('page', filters.page.toString());
      }
      if (filters.limit) {
        queryParams.append('limit', filters.limit.toString());
      }

      const url = `/blogs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);

      if (response.blogs && response.pagination) {
        return {
          blogs: response.blogs.map((blog) => ({
            ...blog,
            _id: blog._id || blog.id,
          })),
          pagination: response.pagination
        };
      }

      const blogs = response.blogs || response;
      const processedBlogs = blogs.map((blog) => ({
        ...blog,
        _id: blog._id || blog.id,
      }));
      return { blogs: processedBlogs, pagination: null };
    } catch (error) {
      console.error('❌ blogService: fetchAll failed:', error.message);
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

  fetchByUserId: async (userId, filters = {}) => {
    try {
      const queryParams = new URLSearchParams();

      // Add filters to query params
      if (filters.genre && filters.genre !== 'All') {
        queryParams.append('genre', filters.genre);
      }
      if (filters.difficulty) {
        queryParams.append('difficulty', filters.difficulty);
      }
      if (filters.sortBy) {
        queryParams.append('sortBy', filters.sortBy);
      }
      if (filters.order) {
        queryParams.append('order', filters.order);
      }

      const url = `/blogs/user/${userId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);
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
      const payload = {
        title: blogData.title,
        content: blogData.content,
        genre: blogData.genre || 'All',
        tags: blogData.tags || [],
        readingDifficulty: blogData.readingDifficulty || 'intermediate'
      };

      const response = await apiClient.post('/blogs', payload);
      return response;
    } catch (error) {
      console.error('❌ Error creating blog:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  update: async (blogId, blogData) => {
    try {
      const payload = {
        title: blogData.title,
        content: blogData.content,
        genre: blogData.genre,
        tags: blogData.tags,
        readingDifficulty: blogData.readingDifficulty
      };

      const response = await apiClient.put(`/blogs/${blogId}`, payload);
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

  updateEngagement: async (blogId, engagementData) => {
    try {
      const response = await apiClient.post(
        `/blogs/${blogId}/engagement`,
        engagementData
      );
      return response;
    } catch (error) {
      console.error('Error updating engagement:', error);
      throw error;
    }
  },

  toggleBookmark: async (blogId) => {
    try {
      const response = await apiClient.post(`/blogs/${blogId}/bookmark`);
      return response;
    } catch (error) {
      console.error('❌ blogService: toggleBookmark failed:', {
        blogId,
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data
      });

      throw error;
    }
  },

  fetchBookmarks: async () => {
    try {
      const response = await apiClient.get('/blogs/bookmarks');
      const blogs = response.blogs || response;

      return blogs.map((blog) => ({
        ...blog,
        _id: blog._id || blog.id,
      }));
    } catch (error) {
      console.error('❌ Error fetching bookmarks:', error.message);
      throw error;
    }
  },

  fetchByGenre: async (genre) => {
    try {
      return await blogService.fetchAll({ genre });
    } catch (error) {
      console.error('❌ Error fetching blogs by genre:', error.message);
      throw error;
    }
  },

  fetchByTags: async (tags) => {
    try {
      return await blogService.fetchAll({ tags });
    } catch (error) {
      console.error('❌ Error fetching blogs by tags:', error.message);
      throw error;
    }
  },

  fetchByDifficulty: async (difficulty) => {
    try {
      return await blogService.fetchAll({ difficulty });
    } catch (error) {
      console.error('❌ Error fetching blogs by difficulty:', error.message);
      throw error;
    }
  },

  search: async (searchTerm, filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('search', searchTerm);

      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await apiClient.get(`/blogs/search?${queryParams.toString()}`);
      const blogs = response.blogs || response;

      return blogs.map((blog) => ({
        ...blog,
        _id: blog._id || blog.id,
      }));
    } catch (error) {
      console.error('❌ Error searching blogs:', error.message);
      throw error;
    }
  }
};

export default blogService;