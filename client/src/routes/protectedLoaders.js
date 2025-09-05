import blogService from '../api/blogService';
import userService from '../api/userService';

class DataCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.defaultTTL = 5 * 60 * 1000;
  }

  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now() + ttl);
  }

  get(key) {
    const expire = this.timestamps.get(key);
    if (!expire || Date.now() > expire) {
      this.cache.delete(key);
      this.timestamps.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  invalidate(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }
}

export const dataCache = new DataCache();

export const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user') || sessionStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const homePageLoader = async () => {
  const token = getAuthToken();
  const user = getCurrentUser();
  if (!token || !user) throw new Response('Unauthorized', { status: 401 });

  const cacheKey = `homepage_${user.id}`;
  const cachedData = dataCache.get(cacheKey);
  if (cachedData) return { ...cachedData, fromCache: true };

  try {
    const [blogsRes, homepageBlogsRes, usersRes, statsRes] = await Promise.allSettled([
      blogService.fetchAll({}, { page: 1, limit: 50 }),
      blogService.fetchForHomePage(),
      userService.fetchAll ? userService.fetchAll() : Promise.resolve([]),
      blogService.getUserStats ? blogService.getUserStats(user.id) : Promise.resolve(null),
    ]);

    let allBlogs = [];
    if (blogsRes.status === 'fulfilled') {
      if (blogsRes.value.blogs) {
        allBlogs = blogsRes.value.blogs.filter(b => !b.isDeleted);
      } else {
        allBlogs = (Array.isArray(blogsRes.value) ? blogsRes.value : []).filter(b => !b.isDeleted);
      }
    }

    let latestBlogs = [];
    if (homepageBlogsRes.status === 'fulfilled') {
      latestBlogs = homepageBlogsRes.value.blogs || [];
    } else {
      latestBlogs = allBlogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
    }

    const allUsers = usersRes.status === 'fulfilled' ? usersRes.value : [];
    const userStats = statsRes.status === 'fulfilled' ? statsRes.value : null;

    const userBlogs = allBlogs.filter(b => (b.author?.id || b.author?._id) === user.id);

    const totalViews = userBlogs.reduce((sum, b) => sum + (b.views || 0), 0);
    const lastUpdated = userBlogs.length
      ? new Date(Math.max(...userBlogs.map(b => new Date(b.updatedAt || b.createdAt))))
      : new Date();

    const stats = [
      { title: 'Your Blogs', count: userBlogs.length, subtitle: 'Total posts created' },
      { title: 'Total Views', count: totalViews, subtitle: 'Across all your posts' },
      { title: 'Last Updated', count: lastUpdated.toLocaleDateString(), subtitle: 'Most recent activity' },
    ];

    const result = {
      allBlogs,
      allUsers,
      userBlogs,
      latestBlogs,
      stats,
      userStats,
      user,
      totalViews,
      lastUpdated: lastUpdated.toISOString(),
      error: null,
    };

    dataCache.set(cacheKey, result);
    return result;

  } catch (error) {
    return {
      allBlogs: [],
      allUsers: [],
      userBlogs: [],
      latestBlogs: [],
      stats: [],
      userStats: null,
      user,
      totalViews: 0,
      lastUpdated: new Date().toISOString(),
      error: error.message,
    };
  }
};

export const myPostsLoader = async () => {
  const token = getAuthToken();
  const user = getCurrentUser();
  if (!token || !user) throw new Response('Unauthorized', { status: 401 });

  const cacheKey = `myposts_${user.id}`;
  const cached = dataCache.get(cacheKey);
  if (cached) return cached;

  try {
    const userBlogsResponse = await blogService.fetchByUserId(
      user.id,
      {},
      { page: 1, limit: 6 }
    );

    let totalBlogs = 0;
    let totalViews = 0;

    if (userBlogsResponse.pagination?.totalBlogs) {
      totalBlogs = userBlogsResponse.pagination.totalBlogs;
      totalViews = (userBlogsResponse.blogs || []).reduce((sum, blog) => sum + (blog.views || 0), 0);
    }

    try {
      const statsResponse = await blogService.getUserBlogsStats(user.id);
      if (statsResponse.success) {
        totalBlogs = statsResponse.totalBlogs || 0;
        totalViews = statsResponse.totalViews || 0;
      }
    } catch (statsError) {
      console.warn('Stats endpoint failed, using pagination data:', statsError);
    }

    const result = {
      blogs: userBlogsResponse.blogs || [],
      pagination: userBlogsResponse.pagination || null,
      totalBlogs,
      totalViews,
      user,
      error: null
    };

    dataCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('MyPosts loader failed:', error);
    return {
      blogs: [],
      pagination: null,
      totalBlogs: 0,
      totalViews: 0,
      user,
      error: error.message
    };
  }
};