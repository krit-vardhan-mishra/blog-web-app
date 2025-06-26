import axios from 'axios';

    const API_URL = 'http://localhost:5000/api/auth/'; // Replace with your backend URL

    const signup = async (userData) => {
      const response = await axios.post(API_URL + 'signup', userData);
      return response.data;
    };

    const login = async (userData) => {
      const response = await axios.post(API_URL + 'login', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token); // Store token in local storage
      }
      return response.data;
    };

    const logout = () => {
      localStorage.removeItem('token');
    };

    export default {
      signup,
      login,
      logout,
    };
