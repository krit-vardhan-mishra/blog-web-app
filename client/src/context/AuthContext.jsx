import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../api/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    const initializeAuth = () => {
      setIsAuthLoading(true);
      const token =
        localStorage.getItem('token') || sessionStorage.getItem('token');
      const userJSON =
        localStorage.getItem('user') || sessionStorage.getItem('user');
      const user = userJSON ? JSON.parse(userJSON) : null;

      if (token && user) {
        setToken(token);
        setUser(user);
      }
      setIsAuthLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password, rememberMe) => {
    try {
      const response = await authService.login(email, password, rememberMe);
      loginUser({ token: response.token, user: response.user }, rememberMe);
      return response;
    } catch (error) {
      if (user || token) {
        setUser(null);
        setToken(null);
      }
      throw error;
    }
  };

  const register = async (firstName, lastName, email, password, age) => {
    setIsAuthLoading(true);
    try {
      const response = await authService.register(
        firstName,
        lastName,
        email,
        password,
        age
      );
      return response;
    } catch (error) {
      setUser(null);
      setToken(null);
      throw error;
    } finally {
      setIsAuthLoading(false);
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

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error during server-side logout:', error);
    } finally {
      clearAuthData();
    }
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
    clearAuthData();
  };

  return (
    <AuthContext.Provider
      value={{
        user, isAuthLoading,
        isAuthenticated, token,
        login, register,
        logout, loginUser,
        setUser, logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};