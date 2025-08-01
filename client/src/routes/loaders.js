import blogService from '../api/blogService';
import userService from '../api/userService';

export const exploreLoader = async () => {
  try {
    const data = await blogService.fetchForExplore({}, 1);

    if (data.blogs) {
      const activeBlogs = data.blogs.filter(blog => !blog.isDeleted);
      return {
        blogs: activeBlogs,
        pagination: data.pagination || {},
        error: null
      };
    }

    const activeBlogs = (Array.isArray(data) ? data : []).filter(blog => !blog.isDeleted);
    return {
      blogs: activeBlogs,
      pagination: {},
      error: null
    };
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw new Response(
      JSON.stringify({ message: error.message || 'Failed to fetch blogs' }),
      {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};

export const blogDetailLoader = async ({ params }) => {
  try {
    const blog = await blogService.fetchById(params.blogId);
    return { blog, error: null };
  } catch (error) {
    console.error('Error fetching blog:', error);

    if (error.message.includes('not found') || error.status === 404) {
      throw new Response(
        JSON.stringify({ message: 'Blog not found' }),
        {
          status: 404,
          statusText: 'Not Found',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    throw new Response(
      JSON.stringify({ message: error.message || 'Failed to fetch blog' }),
      {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};

export const userDetailLoader = async ({ params }) => {
  try {
    const user = await userService.fetchById(params.userId);
    const blogData = await blogService.fetchByUserId(params.userId, {}, { page: 1, limit: 5 });

    const userBlogs = blogData.blogs || [];

    return { user, blogs: userBlogs, pagination: blogData.pagination, error: null };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { user: null, blogs: [], pagination: {}, error: error.message || 'Failed to fetch user' };
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