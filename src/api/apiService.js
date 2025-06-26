// src/api/apiService.js
// This file provides a generic wrapper for making API calls.

// Define the base URL for your backend API
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * A generic function to make API calls to the backend.
 * @param {string} endpoint - The API endpoint (e.g., '/users', '/blogs/123').
 * @param {string} [method='GET'] - The HTTP method (GET, POST, PUT, DELETE).
 * @param {object|null} [data=null] - The request body data (for POST, PUT).
 * @param {string|null} [token=null] - An authentication token (e.g., JWT) for authorization.
 * @returns {Promise<object>} The JSON response from the API.
 * @throws {Error} If the API call fails or returns an error status.
 */
const apiCall = async (endpoint, method = 'GET', data = null, token = null) => {
    // Set standard headers for JSON content
    const headers = {
        'Content-Type': 'application/json',
    };

    // Add Authorization header if a token is provided
    if (token) {
        headers['Authorization'] = `Bearer ${token}`; // Common practice for JWT
    }

    // Configure the fetch request
    const config = {
        method,
        headers,
    };

    // Attach request body for methods that require it
    if (data) {
        config.body = JSON.stringify(data);
    }

    try {
        // Make the fetch request
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const result = await response.json(); // Parse the JSON response

        // Check if the response was successful (status code 2xx)
        if (!response.ok) {
            // If not successful, throw an error with the message from the backend
            const error = new Error(result.message || 'Something went wrong with the API call.');
            error.statusCode = response.status; // Attach HTTP status code
            throw error;
        }
        return result; // Return the parsed successful response
    } catch (error) {
        // Log the error and re-throw it for the calling component to handle
        console.error("API call error:", error);
        throw error;
    }
};

export default apiCall;
