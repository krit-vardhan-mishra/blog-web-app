import blogService from '../api/blogService';
import userService from '../api/userService';

export const exploreLoader = async () => {
  try {
    const allBlogs = await blogService.fetchAll();
    const activeBlogs = allBlogs.filter(blog => !blog.isDeleted);
    return { blogs: activeBlogs, error: null };
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return { blogs: [], error: error.message || 'Failed to fetch blogs' };
  }
};

export const blogDetailLoader = async ({ params }) => {
  try {
    const blog = await blogService.fetchById(params.blogId);
    return { blog, error: null };
  } catch (error) {
    console.error('Error fetching blog:', error);
    return { blog: null, error: error.message || 'Failed to fetch blog' };
  }
};

export const userDetailLoader = async ({ params }) => {
  try {
    const user = await userService.fetchById(params.userId);
    const userBlogs = await blogService.fetchByUserId(params.userId);
    return { user, blogs: userBlogs, error: null };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { user: null, blogs: [], error: error.message || 'Failed to fetch user' };
  }
};

export const createCachedLoader = (loaderFn, cacheTime = 5 * 60 * 1000) => {
  let cache = null;
  let lastFetch = 0;

  return async (args) => {
    const now = Date.now();
    if (cache && (now - lastFetch) < cacheTime) return cache;

    const result = await loaderFn(args);
    cache = result;
    lastFetch = now;
    return result;
  };
};
