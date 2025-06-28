import apiCall from './apiService.js'; // Ensure .js extension

export const fetchAllBlogs = async (token) => {
    return apiCall('/blogs', 'GET', null, token);
};

export const fetchBlogById = async (blogId, token) => {
    return apiCall(`/blogs/${blogId}`, 'GET', null, token);
};

export const createBlog = async (blogData, token) => {
    return apiCall('/blogs', 'POST', blogData, token);
};

export const updateBlog = async (userId, blogId, blogData, token) => {
    return apiCall(`/blogs/${userId}/${blogId}`, 'PUT', blogData, token);
};

export const deleteBlog = async (userId, blogId, token) => {
    return apiCall(`/blogs/${userId}/${blogId}`, 'DELETE', null, token);
};