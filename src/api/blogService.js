import apiCall from './apiService.js';

export const fetchAllBlogs = async (token) => {
  const response = await apiCall('/blogs', 'GET', null, token);
  const blogs = response.blogs || response;
  return blogs.map((blog) => ({
    ...blog,
    _id: blog._id || blog.id,
  }));
};

export const fetchBlogById = async (blogId, token) => {
  return apiCall(`/blogs/${blogId}`, 'GET', null, token);
};

export const createBlog = async (blogData, token) => {
  return apiCall('/blogs', 'POST', blogData, token);
};

export const updateBlog = async (blogId, blogData, token) => {
  return apiCall(`/blogs/${blogId}`, 'PUT', blogData, token);
};

export const deleteBlog = async (blogId, token) => {
  return apiCall(`/blogs/${blogId}`, 'DELETE', null, token);
};

export const incrementBlogView = async (blogId, token) => {
  const res = await fetch(`http://localhost:5000/api/blogs/increment-view/${blogId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error('Failed to increment view count');
  }

  return await res.json();
};