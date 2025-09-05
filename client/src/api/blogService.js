import apiClient from './apiService.js';

const blogService = {
  searchByTitle: async (title) => {
    const response = await apiClient.get(`/blogs/search/title/${encodeURIComponent(title)}`);
    return response.data || response;
  },

  searchByContent: async (content) => {
    const response = await apiClient.get(`/blogs/search/content/${encodeURIComponent(content)}`);
    return response.data || response;
  },

  searchByTags: async (tags) => {
    const response = await apiClient.get(`/blogs/search/tags/${encodeURIComponent(tags)}`);
    return response.data || response;
  },

  fetchAll: async (filters = {}, pagination = { page: 1, limit: 12 }, sortOptions = {}) => {
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

      if (sortOptions.sortBy) {
        queryParams.append('sortBy', sortOptions.sortBy);
      }
      if (sortOptions.order) {
        queryParams.append('order', sortOptions.order);
      }
      if (sortOptions.prioritizeEngagement) {
        queryParams.append('prioritizeEngagement', sortOptions.prioritizeEngagement);
      }
      if (sortOptions.prioritizeWatchTime) {
        queryParams.append('prioritizeWatchTime', sortOptions.prioritizeWatchTime);
      }
      if (sortOptions.prioritizeDifficulty) {
        queryParams.append('prioritizeDifficulty', sortOptions.prioritizeDifficulty);
      }
      if (sortOptions.sortType) {
        queryParams.append('sortType', sortOptions.sortType);
      }

      // Add pagination
      queryParams.append('page', pagination.page.toString());
      queryParams.append('limit', pagination.limit.toString());

      const url = `/blogs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);

      // Check if response is using ApiResponse format (has data property containing the actual data)
      if (response.data && (response.success !== undefined)) {
        // Handle ApiResponse format
        const data = response.data;
        if (data.blogs && data.pagination) {
          return {
            blogs: data.blogs.map((blog) => ({
              ...blog,
              _id: blog._id || blog.id,
            })),
            pagination: data.pagination
          };
        }
        
        // If no blogs/pagination structure in data, return the data itself
        return { 
          blogs: Array.isArray(data) ? data.map(blog => ({
            ...blog,
            _id: blog._id || blog.id,
          })) : [data].map(blog => ({
            ...blog,
            _id: blog._id || blog.id,
          })),
          pagination: null 
        };
      }
      
      // Handle direct response format (older endpoints)
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
      const processedBlogs = Array.isArray(blogs) ? blogs.map((blog) => ({
        ...blog,
        _id: blog._id || blog.id,
      })) : [];
      
      return { blogs: processedBlogs, pagination: null };
    } catch (error) {
      console.error('❌ blogService: fetchAll failed:', error.message);
      throw error;
    }
  },

  fetchForHomePage: async () => {
    try {
      const response = await blogService.fetchAll(
        {},
        { page: 1, limit: 12 },
        { sortType: 'homepage' }
      );

      if (response.blogs && response.blogs.length > 0) {
        const shuffled = [...response.blogs].sort(() => 0.5 - Math.random());
        return {
          blogs: shuffled.slice(0, 6),
          totalFetched: response.blogs.length,
          pagination: response.pagination
        };
      }

      return { blogs: [], totalFetched: 0, pagination: null };
    } catch (error) {
      console.error('❌ Error fetching blogs for homepage:', error.message);
      throw error;
    }
  },

  fetchForExplore: async (filters = {}, page = 1) => {
    try {
      return await blogService.fetchAll(
        filters,
        { page, limit: 12 },
        { sortType: 'explore' }
      );
    } catch (error) {
      console.error('❌ Error fetching blogs for explore:', error.message);
      throw error;
    }
  },

  fetchById: async (blogId) => {
    try {
      const response = await apiClient.get(`/blogs/${blogId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching blog by ID:', error.message);
      throw error;
    }
  },

  fetchByUserId: async (userId, filters = {}, pagination = { page: 1, limit: 5 }) => {
    try {
      const queryParams = new URLSearchParams();

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

      queryParams.append('page', pagination.page.toString());
      queryParams.append('limit', pagination.limit.toString());

      const url = `/blogs/user/${userId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);

      // Handle ApiResponse format
      if (response.data && (response.success !== undefined)) {
        const apiData = response.data;
        if (apiData.blogs && apiData.pagination) {
          return {
            blogs: apiData.blogs.map((blog) => ({
              ...blog,
              _id: blog._id || blog.id,
            })),
            pagination: apiData.pagination
          };
        }
        return { blogs: [], pagination: null };
      }

      // Handle direct response format (fallback)
      if (response.blogs && response.pagination) {
        return {
          blogs: response.blogs.map((blog) => ({
            ...blog,
            _id: blog._id || blog.id,
          })),
          pagination: response.pagination
        };
      }

      // Final fallback for unexpected formats
      const blogs = response.blogs || response;
      const processedBlogs = Array.isArray(blogs) ? blogs.map((blog) => ({
        ...blog,
        _id: blog._id || blog.id,
      })) : [];
      return { blogs: processedBlogs, pagination: null };
    } catch (error) {
      console.error('❌ Error fetching blogs by user ID:', error.message);
      throw error;
    }
  },

  getUserBlogsStats: async (userId) => {
    try {
      const response = await apiClient.get(`/blogs/user/${userId}/stats`);
      return response.data || response;
    } catch (error) {
      console.error('❌ Error fetching user blog stats:', error.message);
      // Return default values if stats endpoint fails
      return {
        totalBlogs: 0,
        totalViews: 0,
        lastUpdated: null,
        success: false
      };
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
      return response.data || response;
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
      return response.data || response;
    } catch (error) {
      console.error('❌ Error updating blog:', error.message);
      throw error;
    }
  },

  delete: async (blogId) => {
    try {
      const response = await apiClient.delete(`/blogs/${blogId}`);
      return response.data || response;
    } catch (error) {
      console.error('❌ Error deleting blog:', error.message);
      throw error;
    }
  },

  permanentlyDelete: async (blogId) => {
    try {
      const response = await apiClient.delete(`/blogs/permanent/${blogId}`);
      return response.data || response;
    } catch (error) {
      console.error('❌ Error permanently deleting blog:', error.message);
      throw error;
    }
  },

  restore: async (blogId) => {
    try {
      const response = await apiClient.post(`/blogs/restore/${blogId}`);
      return response.data || response;
    } catch (error) {
      console.error('❌ Error restoring blog:', error.message);
      throw error;
    }
  },

  incrementView: async (blogId) => {
    try {
      const response = await apiClient.post(`/blogs/increment-view/${blogId}`);
      return response.data || response;
    } catch (error) {
      console.error('❌ Error incrementing view:', error.message);
      throw error;
    }
  },

  fetchDeleted: async (pagination = { page: 1, limit: 12 }) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', pagination.page.toString());
      queryParams.append('limit', pagination.limit.toString());

      const response = await apiClient.get(`/blogs/deleted?${queryParams.toString()}`);

      // Handle ApiResponse format
      if (response.data && response.success !== undefined) {
        const blogs = response.data.blogs || response.data;
        const processedBlogs = Array.isArray(blogs) ? blogs.map((blog) => ({
          ...blog,
          _id: blog._id || blog.id,
        })) : [];
        return { blogs: processedBlogs, pagination: response.data.pagination || null };
      }

      // Fallback for direct response
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
      return response.data || response;
    } catch (error) {
      console.error('Error updating engagement:', error);
      throw error;
    }
  },

  toggleBookmark: async (blogId) => {
    try {
      const response = await apiClient.post(`/blogs/${blogId}/bookmark`);
      return response.data || response;
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

  fetchBookmarks: async (pagination = { page: 1, limit: 12 }) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', pagination.page.toString());
      queryParams.append('limit', pagination.limit.toString());

      const response = await apiClient.get(`/blogs/bookmarks?${queryParams.toString()}`);

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
      console.error('❌ Error fetching bookmarks:', error.message);
      throw error;
    }
  },

  fetchByGenre: async (genre, pagination = { page: 1, limit: 12 }) => {
    try {
      return await blogService.fetchAll({ genre }, pagination);
    } catch (error) {
      console.error('❌ Error fetching blogs by genre:', error.message);
      throw error;
    }
  },

  fetchByTags: async (tags, pagination = { page: 1, limit: 12 }) => {
    try {
      return await blogService.fetchAll({ tags }, pagination);
    } catch (error) {
      console.error('❌ Error fetching blogs by tags:', error.message);
      throw error;
    }
  },

  fetchByDifficulty: async (difficulty, pagination = { page: 1, limit: 12 }) => {
    try {
      return await blogService.fetchAll({ difficulty }, pagination);
    } catch (error) {
      console.error('❌ Error fetching blogs by difficulty:', error.message);
      throw error;
    }
  },

  search: async (searchTerm, filters = {}, pagination = { page: 1, limit: 12 }) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('search', searchTerm);

      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      queryParams.append('page', pagination.page.toString());
      queryParams.append('limit', pagination.limit.toString());

      const response = await apiClient.get(`/blogs/search?${queryParams.toString()}`);

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
      console.error('❌ Error searching blogs:', error.message);
      throw error;
    }
  },

  getUserStats: async (userId) => {
    try {
      const response = await apiClient.get(`/blogs/user/${userId}/stats`);
      return response.data || response;
    } catch (error) {
      console.error('❌ Error fetching user stats:', error.message);
      throw error;
    }
  },

  fetchWithPriority: async (priorityType, filters = {}, pagination = { page: 1, limit: 12 }) => {
    try {
      const sortOptions = {};

      switch (priorityType) {
        case 'engagement':
          sortOptions.prioritizeEngagement = true;
          sortOptions.sortBy = 'engagementScore';
          sortOptions.order = 'desc';
          break;
        case 'watchTime':
          sortOptions.prioritizeWatchTime = true;
          sortOptions.sortBy = 'averageReadTime';
          sortOptions.order = 'desc';
          break;
        case 'difficulty':
          sortOptions.prioritizeDifficulty = true;
          sortOptions.sortBy = 'readingDifficulty';
          sortOptions.order = 'desc';
          break;
        case 'popular':
          sortOptions.sortBy = 'views';
          sortOptions.order = 'desc';
          break;
        default:
          sortOptions.sortBy = 'createdAt';
          sortOptions.order = 'desc';
      }

      return await blogService.fetchAll(filters, pagination, sortOptions);
    } catch (error) {
      console.error('❌ Error fetching blogs with priority:', error.message);
      throw error;
    }
  }
};

export default blogService;