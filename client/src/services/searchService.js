import blogService from '../api/blogService.js';
import userService from '../api/userService.js';

class SearchService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Main search function
  async search({ query, filter = 'all', limit = 20 }) {
    if (!query?.trim()) return [];

    const cacheKey = `${query.toLowerCase()}-${filter}-${limit}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.results;
      }
      this.cache.delete(cacheKey);
    }

    try {
      let results = [];

      switch (filter) {
        case 'blogs':
          results = await this.searchBlogs(query, limit);
          break;
        case 'title':
          results = await this.searchByTitle(query, limit);
          break;
        case 'content':
          results = await this.searchByContent(query, limit);
          break;
        case 'tags':
          results = await this.searchByTags(query, limit);
          break;
        case 'users':
          results = await this.searchUsers(query, limit);
          break;
        case 'none':
          results = [];
          break;
        case 'all':
        default:
          results = await this.searchAll(query, limit);
          break;
      }

      // Cache results
      this.cache.set(cacheKey, {
        results,
        timestamp: Date.now()
      });

      return results;
    } catch (error) {
      console.error('Search service error:', error);
      return [];
    }
  }

  // Search all content types
  async searchAll(query, limit) {
    // First, try individual direct searches if query is specific enough
    if (query.length > 2) {
      try {
        // Try to search by title directly
        const titleSearch = await this.searchByTitle(query, 1);
        if (titleSearch && titleSearch.length > 0) {
          // If we find an exact title match, prioritize it
          const otherResults = await Promise.allSettled([
            this.searchUsers(query, Math.ceil(limit * 0.4)),
            this.searchTags(query, Math.ceil(limit * 0.1))
          ]);
          
          return [
            ...titleSearch,
            ...(otherResults[0].status === 'fulfilled' ? otherResults[0].value : []),
            ...(otherResults[1].status === 'fulfilled' ? otherResults[1].value : [])
          ].slice(0, limit);
        }
      } catch (error) {
        console.log('Direct title search in searchAll failed, continuing with general search');
      }
    }
    
    // If no direct match, fall back to general search
    const [blogs, users, tags] = await Promise.allSettled([
      this.searchBlogs(query, Math.ceil(limit * 0.6)), // 60% blogs
      this.searchUsers(query, Math.ceil(limit * 0.3)), // 30% users
      this.searchTags(query, Math.ceil(limit * 0.1)) // 10% tags
    ]);

    const allResults = [
      ...(blogs.status === 'fulfilled' ? blogs.value : []),
      ...(users.status === 'fulfilled' ? users.value : []),
      ...(tags.status === 'fulfilled' ? tags.value : [])
    ];

    // Sort by relevance score
    return allResults
      .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
      .slice(0, limit);
  }

  // Search blogs
  async searchBlogs(query, limit) {
    try {
      const searchTerm = query.toLowerCase().trim();
      const isTagSearch = searchTerm.startsWith('#');
      let response;

      // Use our specific API endpoints based on search type
      if (isTagSearch) {
        // Search by tags
        const tagQuery = searchTerm.substring(1);
        response = await blogService.searchByTags(tagQuery);
        if (response.data) {
          // Handle array of blogs from tag search
          const blogs = Array.isArray(response.data) ? response.data : [response.data];
          return blogs.map(blog => ({
            ...blog,
            type: 'blog',
            relevance: 100 // Direct match gets highest score
          }));
        } else if (response) {
          // Direct data format
          const blogs = Array.isArray(response) ? response : [response];
          return blogs.map(blog => ({
            ...blog,
            type: 'blog',
            relevance: 100 // Direct match gets highest score
          }));
        }
      } else {
        // Try title search first (exact match)
        try {
          response = await blogService.searchByTitle(searchTerm);
          if (response.data) {
            // Handle array of blogs from title search
            const blogs = Array.isArray(response.data) ? response.data : [response.data];
            return blogs.map(blog => ({
              ...blog,
              type: 'blog',
              relevance: 100 // Direct match gets highest score
            }));
          } else if (response) {
            // Direct data format
            const blogs = Array.isArray(response) ? response : [response];
            return blogs.map(blog => ({
              ...blog,
              type: 'blog',
              relevance: 100 // Direct match gets highest score
            }));
          }
        } catch (error) {
          // Title search failed, try content search
          try {
            response = await blogService.searchByContent(searchTerm);
            if (response.data) {
              // Handle array of blogs from content search
              const blogs = Array.isArray(response.data) ? response.data : [response.data];
              return blogs.map(blog => ({
                ...blog,
                type: 'blog',
                relevance: 90 // Content match gets high score
              }));
            } else if (response) {
              // Direct data format
              const blogs = Array.isArray(response) ? response : [response];
              return blogs.map(blog => ({
                ...blog,
                type: 'blog',
                relevance: 90 // Content match gets high score
              }));
            }
          } catch (contentError) {
            // Content search failed too, fallback to general search
            console.log('Direct search failed, falling back to general search');
          }
        }
      }

      // Fallback to general search if specific endpoints didn't yield results
      const generalResponse = await blogService.fetchAll({}, { page: 1, limit: 50 });
      const blogs = generalResponse.blogs || [];

      const filteredBlogs = blogs.filter(blog => {
        if (isTagSearch) {
          const tagQuery = searchTerm.substring(1);
          return (blog.tags || []).some(tag =>
            tag.toLowerCase().includes(tagQuery)
          );
        }

        return (
          blog.title?.toLowerCase().includes(searchTerm) ||
          blog.content?.toLowerCase().includes(searchTerm) ||
          (blog.author?.name || '').toLowerCase().includes(searchTerm) ||
          (blog.tags || []).some(tag => tag.toLowerCase().includes(searchTerm)) ||
          (blog.genre || '').toLowerCase().includes(searchTerm)
        );
      });

      return filteredBlogs
        .map(blog => ({
          ...blog,
          type: 'blog',
          relevance: this.calculateBlogRelevance(blog, searchTerm)
        }))
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, limit);
    } catch (error) {
      console.error('Blog search error:', error);
      return [];
    }
  }

  // Search users
  async searchUsers(query, limit) {
    try {
      const searchTerm = query.toLowerCase().trim();

      // Check if query looks like an email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = emailRegex.test(searchTerm);

      let users = [];

      if (isEmail) {
        // Search by email using your new API endpoint
        try {
          const emailResponse = await userService.fetchByEmail(searchTerm);
          
          // Handle the updated response format
          if (emailResponse.success && emailResponse.data) {
            // Direct ApiResponse format
            users = [emailResponse.data];
          } else if (emailResponse.data?.success && emailResponse.data.data) {
            // Nested ApiResponse format
            users = [emailResponse.data.data];
          } else {
            // Direct data format
            users = [emailResponse];
          }
        } catch (emailError) {
          // If email search fails, fall back to general search
          console.log('Email search failed, falling back to general search');
        }
      }

      // Check if search term could be a username
      if (!isEmail && searchTerm.length >= 3) {
        try {
          const usernameResponse = await userService.fetchByUsername(searchTerm);
          
          // Handle the updated response format
          if (usernameResponse.success && usernameResponse.data) {
            // Direct ApiResponse format
            users = [usernameResponse.data];
          } else if (usernameResponse.data?.success && usernameResponse.data.data) {
            // Nested ApiResponse format
            users = [usernameResponse.data.data];
          } else {
            // Direct data format
            users = [usernameResponse];
          }
        } catch (error) {
          console.log('Username search failed:', error.message);
        }
      }

      // If no email results or not an email query, search all users
      if (users.length === 0) {
        const response = await userService.fetchAll();
        const allUsers = response.users || response.data?.users || [];

        users = allUsers.filter(user =>
          user.name?.toLowerCase().includes(searchTerm) ||
          (user.email || '').toLowerCase().includes(searchTerm) ||
          (user.about || '').toLowerCase().includes(searchTerm)
        );
      }

      return users
        .map(user => ({
          ...user,
          type: 'user',
          relevance: this.calculateUserRelevance(user, searchTerm)
        }))
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, limit);
    } catch (error) {
      console.error('User search error:', error);
      return [];
    }
  }

  // Search tags
  async searchTags(query, limit) {
    try {
      const response = await blogService.fetchAll({}, { page: 1, limit: 50 });
      const blogs = response.blogs || [];

      const searchTerm = query.toLowerCase().trim();
      const tagQuery = searchTerm.startsWith('#') ? searchTerm.substring(1) : searchTerm;

      // Extract all tags and count their usage
      const tagCounts = {};
      blogs.forEach(blog => {
        (blog.tags || []).forEach(tag => {
          const normalizedTag = tag.toLowerCase();
          if (normalizedTag.includes(tagQuery)) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        });
      });

      return Object.entries(tagCounts)
        .map(([tag, count]) => ({
          tag,
          count,
          type: 'tag',
          id: `tag-${tag}`,
          relevance: this.calculateTagRelevance(tag, tagQuery, count)
        }))
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, limit);
    } catch (error) {
      console.error('Tag search error:', error);
      return [];
    }
  }

  // Calculate blog relevance score
  calculateBlogRelevance(blog, searchTerm) {
    let score = 0;
    const title = (blog.title || '').toLowerCase();
    const content = (blog.content || '').toLowerCase();
    const author = (blog.author?.name || '').toLowerCase();
    const tags = (blog.tags || []).join(' ').toLowerCase();
    const genre = (blog.genre || '').toLowerCase();

    // Title matches get highest score
    if (title.includes(searchTerm)) score += 10;
    if (title.startsWith(searchTerm)) score += 5;

    // Content matches
    if (content.includes(searchTerm)) score += 3;

    // Author matches
    if (author.includes(searchTerm)) score += 5;

    // Tag matches
    if (tags.includes(searchTerm)) score += 8;
    if ((blog.tags || []).some(tag => tag.toLowerCase() === searchTerm)) score += 15;

    // Genre matches
    if (genre.includes(searchTerm)) score += 4;

    // Special handling for tag searches
    if (searchTerm.startsWith('#')) {
      const tagQuery = searchTerm.substring(1);
      if ((blog.tags || []).some(tag => tag.toLowerCase().includes(tagQuery))) score += 20;
    }

    // Boost for exact matches
    if (title === searchTerm) score += 20;

    // Boost for recent posts
    if (blog.createdAt) {
      const daysSinceCreation = (Date.now() - new Date(blog.createdAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation < 7) score += 2;
    }

    // Boost for popular posts
    if (blog.views > 100) score += 1;

    return score;
  }

  // Calculate user relevance score
  calculateUserRelevance(user, searchTerm) {
    let score = 0;
    const name = (user.name || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const about = (user.about || '').toLowerCase();

    // Name matches
    if (name.includes(searchTerm)) score += 10;
    if (name.startsWith(searchTerm)) score += 5;

    // Email matches (higher score for exact email searches)
    if (email.includes(searchTerm)) score += 7;
    if (email === searchTerm) score += 25; // Exact email match gets highest score

    // About matches
    if (about.includes(searchTerm)) score += 3;

    // Exact name match
    if (name === searchTerm) score += 20;

    return score;
  }

  // Calculate tag relevance score
  calculateTagRelevance(tag, searchQuery, count) {
    let score = count; // Base score is usage count

    const tagLower = tag.toLowerCase();
    const queryLower = searchQuery.toLowerCase();

    // Exact match gets highest boost
    if (tagLower === queryLower) score += 100;

    // Starts with query gets medium boost
    if (tagLower.startsWith(queryLower)) score += 50;

    // Contains query gets small boost
    if (tagLower.includes(queryLower)) score += 10;

    return score;
  }

  // Direct endpoint search methods
  async searchByTitle(query, limit) {
    try {
      // Ensure the query is properly formatted and has minimum length
      if (!query || query.trim().length < 2) {
        return [];
      }
      
      const response = await blogService.searchByTitle(query.trim());
      console.log("Title search response:", response);
      
      // Handle updated response format (array of blogs)
      if (response.data) {
        // ApiResponse format
        if (Array.isArray(response.data)) {
          return response.data.map(blog => ({
            ...blog,
            type: 'blog',
            relevance: 100 // Direct match gets highest score
          }));
        } else {
          return [{
            ...response.data,
            type: 'blog',
            relevance: 100 // Direct match gets highest score
          }];
        }
      } else if (response) {
        // Direct data format
        if (Array.isArray(response)) {
          return response.map(blog => ({
            ...blog,
            type: 'blog',
            relevance: 100 // Direct match gets highest score
          }));
        } else {
          return [{
            ...response,
            type: 'blog',
            relevance: 100 // Direct match gets highest score
          }];
        }
      }
      
      // If direct API search fails, try fallback to client-side filtering
      try {
        const allBlogsResponse = await blogService.fetchAll({}, { page: 1, limit: 50 });
        if (allBlogsResponse?.blogs) {
          const matchingBlogs = allBlogsResponse.blogs
            .filter(blog => blog.title.toLowerCase().includes(query.toLowerCase()))
            .map(blog => ({
              ...blog,
              type: 'blog',
              relevance: 80 // Client-side matches get lower score
            }))
            .slice(0, limit || 5);
            
          return matchingBlogs;
        }
      } catch (fallbackError) {
        console.log('Title search fallback error:', fallbackError);
      }
      
      return [];
    } catch (error) {
      console.error('Title search error:', error);
      return [];
    }
  }

  async searchByContent(query, limit) {
    try {
      const response = await blogService.searchByContent(query.trim());
      
      // Handle updated response format (array of blogs)
      if (response.data) {
        // ApiResponse format
        if (Array.isArray(response.data)) {
          return response.data.map(blog => ({
            ...blog,
            type: 'blog',
            relevance: 90 // Content match gets high score
          }));
        } else {
          return [{
            ...response.data,
            type: 'blog',
            relevance: 90 // Content match gets high score
          }];
        }
      } else if (response) {
        // Direct data format
        if (Array.isArray(response)) {
          return response.map(blog => ({
            ...blog,
            type: 'blog',
            relevance: 90 // Content match gets high score
          }));
        } else {
          return [{
            ...response,
            type: 'blog',
            relevance: 90 // Content match gets high score
          }];
        }
      }
      return [];
    } catch (error) {
      console.error('Content search error:', error);
      return [];
    }
  }

  async searchByTags(query, limit) {
    try {
      // Remove # if present
      const tagQuery = query.trim().startsWith('#') ? query.trim().substring(1) : query.trim();
      
      if (!tagQuery || tagQuery.length < 1) {
        return [];
      }

      const response = await blogService.searchByTags(tagQuery);
      
      // Handle updated response format (array of blogs)
      if (response.data) {
        // ApiResponse format
        if (Array.isArray(response.data)) {
          return response.data.map(blog => ({
            ...blog,
            type: 'blog',
            relevance: 95 // Tag match gets high score
          }));
        } else {
          return [{
            ...response.data,
            type: 'blog',
            relevance: 95 // Tag match gets high score
          }];
        }
      } else if (response) {
        // Direct data format
        if (Array.isArray(response)) {
          return response.map(blog => ({
            ...blog,
            type: 'blog',
            relevance: 95 // Tag match gets high score
          }));
        } else {
          return [{
            ...response,
            type: 'blog',
            relevance: 95 // Tag match gets high score
          }];
        }
      }
      
      // If direct API search fails, try fallback to client-side filtering
      try {
        const allBlogsResponse = await blogService.fetchAll({}, { page: 1, limit: 50 });
        if (allBlogsResponse?.blogs) {
          const matchingBlogs = allBlogsResponse.blogs
            .filter(blog => blog.tags && blog.tags.some(tag => 
              tag.toLowerCase().includes(tagQuery.toLowerCase())
            ))
            .map(blog => ({
              ...blog,
              type: 'blog',
              relevance: 75 // Client-side tag matches get lower score
            }))
            .slice(0, limit || 5);
            
          return matchingBlogs;
        }
      } catch (fallbackError) {
        console.log('Tag search fallback error:', fallbackError);
      }
      
      return [];
    } catch (error) {
      console.error('Tag search error:', error);
      return [];
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export the SearchService class
export default SearchService;
