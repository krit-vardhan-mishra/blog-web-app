// src/api/blogService.js
import apiCall from './apiService.js'; // Ensure .js extension
import axios from 'axios';

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/blogs/'; // Replace with your backend URL

const createBlog = async (blogData, token) => {
    const config = {
        headers: {
            'x-auth-token': token,
        },
    };
    const response = await axios.post(API_URL, blogData, config);
    return response.data;
};

const getAllBlogs = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

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