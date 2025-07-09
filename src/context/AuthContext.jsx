// AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../api/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Renamed 'loading' for clarity

  // Define isAuthenticated here, derived from user and token
  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    const initializeAuth = () => {
      setIsAuthLoading(true); // Set loading to true at the start of initialization
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userJSON = localStorage.getItem('user') || sessionStorage.getItem('user');
      const user = userJSON ? JSON.parse(userJSON) : null;

      if (token && user) {
        setToken(token);
        setUser(user);
      }
      setIsAuthLoading(false); // Set loading to false after initialization
    };

    initializeAuth();
  }, []);

  const login = async (email, password, rememberMe) => { // Add rememberMe here
    setIsAuthLoading(true); // Set loading to true when login starts
    try {
      const response = await authService.login(email, password);
      // Pass rememberMe to loginUser
      loginUser({ token: response.token, user: response.user }, rememberMe);
      return response; // Return response for LoginPage to handle
    } catch (error) {
      setUser(null); // Clear user/token on error
      setToken(null);
      throw error;
    } finally {
      setIsAuthLoading(false); // Set loading to false when login finishes
    }
  };

  const register = async (firstName, lastName, email, password, age) => {
    setIsAuthLoading(true); // Set loading to true when register starts
    try {
      const response = await authService.register(firstName, lastName, email, password, age);
      loginUser({ token: response.token, user: response.user });
      return response; // Return response
    } catch (error) {
      setUser(null); // Clear user/token on error
      setToken(null);
      throw error;
    } finally {
      setIsAuthLoading(false); // Set loading to false when register finishes
    }
  };

  const loginUser = ({ token, user }, rememberMe = false) => {
    if (rememberMe) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
    }
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    authService.logout();
    clearAuthData();
  };

   const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    setToken(null); // Ensure token is also cleared
  };


  return (
    <AuthContext.Provider value={{ user, token, isAuthLoading, isAuthenticated, login, register, logout, loginUser, setUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);