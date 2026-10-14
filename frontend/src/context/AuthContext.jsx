import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      setLoading(true);
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    }
  };

  const login = async (email, password, deviceId) => {
    try {
      const response = await api.post('/auth/login', { email, password, deviceId });
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      return user;
    } catch (error) {
      throw error.response?.data?.error || 'Login failed. Please check your credentials.';
    }
  };

  const googleLogin = async (googleData) => {
    try {
      const response = await api.post('/auth/google-login', googleData);
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      return user;
    } catch (error) {
      throw error.response?.data?.error || 'Google authentication failed.';
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const response = await api.post('/auth/register-candidate', { name, email, password, phone });
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      return user;
    } catch (error) {
      throw error.response?.data?.error || 'Registration failed. Please check your connection.';
    }
  };

  const initAdmin = async () => {
    try {
      const response = await api.post('/auth/init');
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Initialization failed.';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    googleLogin,
    register,
    initAdmin,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
