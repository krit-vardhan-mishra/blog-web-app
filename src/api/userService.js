// src/api/userService.js
import apiCall from './apiService.js'; // Ensure .js extension

/**
 * Fetches all users from the backend.
 * @param {string} token - Authentication token.
 * @returns {Promise<Array<object>>} A list of user objects.
 */
export const fetchAllUsers = async (token) => {
    return apiCall('/users', 'GET', null, token);
};

/**
 * Fetches a single user by their ID.
 * @param {number} userId - The ID of the user to fetch.
 * @param {string} token - Authentication token.
 * @returns {Promise<object>} The user object.
 */
export const fetchUserById = async (userId, token) => {
    return apiCall(`/users/${userId}`, 'GET', null, token);
};

/**
 * Creates a new user in the backend.
 * @param {object} userData - The data for the new user (e.g., { name, age }).
 * @param {string} token - Authentication token.
 * @returns {Promise<object>} The created user object.
 */
export const createUser = async (userData, token) => {
    return apiCall('/users', 'POST', userData, token);
};
