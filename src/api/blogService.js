// src/api/blogService.js
import apiCall from './apiService.js'; // Ensure .js extension

/**
 * Fetches all blogs from the backend.
 * @param {string} token - Authentication token.
 * @returns {Promise<Array<object>>} A list of blog objects.
 */
export const fetchAllBlogs = async (token) => {
    return apiCall('/blogs', 'GET', null, token);
};

/**
 * Fetches a single blog by its ID.
 * @param {number} blogId - The ID of the blog to fetch.
 * @param {string} token - Authentication token.
 * @returns {Promise<object>} The blog object.
 */
export const fetchBlogById = async (blogId, token) => {
    return apiCall(`/blogs/${blogId}`, 'GET', null, token);
};

/**
 * Creates a new blog post in the backend.
 * @param {object} blogData - The data for the new blog (e.g., { userId, title, content }).
 * @param {string} token - Authentication token.
 * @returns {Promise<object>} The result of the creation, usually including the new blogId.
 */
export const createBlog = async (blogData, token) => {
    return apiCall('/blogs', 'POST', blogData, token);
};

/**
 * Updates an existing blog post.
 * @param {number} userId - The ID of the user who owns the blog.
 * @param {number} blogId - The ID of the blog to update.
 * @param {object} blogData - The data to update (e.g., { title, content }).
 * @param {string} token - Authentication token.
 * @returns {Promise<object>} The updated blog object.
 */
export const updateBlog = async (userId, blogId, blogData, token) => {
    return apiCall(`/blogs/${userId}/${blogId}`, 'PUT', blogData, token);
};

/**
 * Deletes a blog post.
 * @param {number} userId - The ID of the user who owns the blog.
 * @param {number} blogId - The ID of the blog to delete.
 * @param {string} token - Authentication token.
 * @returns {Promise<object>} A success message.
 */
export const deleteBlog = async (userId, blogId, token) => {
    return apiCall(`/blogs/${userId}/${blogId}`, 'DELETE', null, token);
};
