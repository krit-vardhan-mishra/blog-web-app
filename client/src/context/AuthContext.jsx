import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../api/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  const safeJSONParse = (jsonString) => {
    if (!jsonString || jsonString === 'undefined' || jsonString === 'null') {
      return null;
    }
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON:", e, "Input:", jsonString);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = () => {
      setIsAuthLoading(true);
      
      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const userJSON = localStorage.getItem('user') || sessionStorage.getItem('user');
      const storedUser = safeJSONParse(userJSON);

      if (storedToken && storedToken !== 'undefined' && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      } else {
        clearAuthData();
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
        clearAuthData();
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
      clearAuthData();
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const loginUser = ({ token, user }, rememberMe = false) => {
    if (!token || !user) {
      console.error('Invalid token or user data provided to loginUser');
      return;
    }

    try {
      const userString = JSON.stringify(user);
      
      if (rememberMe) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', userString);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      } else {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', userString);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      setToken(token);
      setUser(user);
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
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
        user,
        isAuthLoading,
        isAuthenticated,
        token,
        login,
        register,
        logout,
        loginUser,
        setUser,
        setToken,
        logoutUser,
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