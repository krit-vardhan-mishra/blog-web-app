import React, { createContext, useState, useEffect } from 'react';
import * as authService from '../api/authService'; // Removed .js extension again

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize user and token from localStorage or null
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  // Effect to keep localStorage in sync with token state
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async (email, password) => {
    const { token: jwt, user: userData } = await authService.login(email, password);
    setToken(jwt);
    setUser(userData); // Set the user state after successful login
  };

  const register = async (first, last, email, pass) => {
    const { token: jwt, user: userData } = await authService.register(first, last, email, pass);
    setToken(jwt);
    setUser(userData); // Set the user state after successful registration
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null); // Clear the user state on logout
  };

  // The value provided to consumers of this context
  const contextValue = { user, token, login, register, logout };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
