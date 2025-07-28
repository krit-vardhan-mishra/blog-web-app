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
    const [blogsRes, usersRes, statsRes] = await Promise.allSettled([
      blogService.fetchAll(),
      userService.fetchAll ? userService.fetchAll() : Promise.resolve([]),
      blogService.getUserStats ? blogService.getUserStats(user.id) : Promise.resolve(null),
    ]);

    const allBlogs = blogsRes.status === 'fulfilled' ? blogsRes.value.filter(b => !b.isDeleted) : [];
    const allUsers = usersRes.status === 'fulfilled' ? usersRes.value : [];
    const userStats = statsRes.status === 'fulfilled' ? statsRes.value : null;

    const userBlogs = allBlogs.filter(b => (b.author?.id || b.author?._id) === user.id);
    const latestBlogs = allBlogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

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
    const blogs = await blogService.fetchAll();
    const userBlogs = blogs.filter(blog => 
      (blog.author?.id || blog.author?._id) === user.id && !blog.isDeleted
    );
    const data = { blogs: userBlogs, user, error: null };
    dataCache.set(cacheKey, data);
    return data;
  } catch (error) {
    return { blogs: [], user, error: error.message };
  }
};
