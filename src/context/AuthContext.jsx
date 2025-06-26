import React, { createContext, useState, useEffect } from 'react';
import * as authService from '../api/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const user = authService.getCurrentUser();
      
      if (token && user) {
        setToken(token);
        setUser(user);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const { token, user } = await authService.login(email, password);
      setToken(token);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (firstName, lastName, email, password) => {
    try {
      const { token, user } = await authService.register(firstName, lastName, email, password);
      setToken(token);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};