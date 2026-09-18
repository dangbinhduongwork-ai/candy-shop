import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, getCurrentUser } from '../api/authService';

/**
 * AuthContext provides authentication state and actions throughout the app.
 * - Automatically restores login state from localStorage on page reload
 * - Provides login, register, logout functions
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // true while restoring session

  // Restore session on app load / page refresh
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          // Verify token is still valid by fetching current user
          const userData = await getCurrentUser();
          setUser(userData);
          setToken(savedToken);
          setIsAuthenticated(true);
        } catch {
          // Token expired or invalid — clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  /** Login with email + password, persist token, set auth state */
  const login = useCallback(async (credentials) => {
    const data = await loginUser(credentials);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  }, []);

  /** Register new account, persist token, set auth state */
  const register = useCallback(async (userData) => {
    const data = await registerUser(userData);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  }, []);

  /** Clear auth state and localStorage on logout */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  /** Update local user state immediately (e.g. after profile/avatar update) */
  const updateUserState = useCallback((updatedData) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedData };
      return next;
    });
  }, []);

  /** Fetch latest profile from server and sync state */
  const refreshUser = useCallback(async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      return userData;
    } catch {
      // Ignored
    }
  }, []);

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUserState,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/** Custom hook to easily consume auth context in any component */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
