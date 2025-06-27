import React, { createContext, useContext, useState, useEffect } from 'react';
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
      loginUser({ token, user });
    } catch (error) {
      throw error;
    }
  };

  const register = async (firstName, lastName, email, password, age) => {
    try {
      const { token, user } = await authService.register(firstName, lastName, email, password, age);
      loginUser({ token, user });
    } catch (error) {
      throw error;
    }
  };

  const loginUser = ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, loginUser, setUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);