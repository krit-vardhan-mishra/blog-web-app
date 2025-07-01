import apiCall from './apiService.js';

export const fetchAllUsers = async (token) => {
    return apiCall('/users', 'GET', null, token);
};

export const fetchUserById = async (userId, token) => {
    return apiCall(`/users/${userId}`, 'GET', null, token);
};

export const createUser = async (userData, token) => {
    return apiCall('/users', 'POST', userData, token);
};

export const updateUserProfile = async (userData, token) => {
    return apiCall('/user/profile', 'PUT', userData, token);
};
