import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('slicecraft_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('slicecraft_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Initialize from localStorage verification
  useEffect(() => {
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('slicecraft_token', data.token);
      localStorage.setItem('slicecraft_user', JSON.stringify(data.user));
    }
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('slicecraft_token', data.token);
      localStorage.setItem('slicecraft_user', JSON.stringify(data.user));
    }
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('slicecraft_token');
    localStorage.removeItem('slicecraft_user');
    localStorage.removeItem('slicecraft_cart');
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('slicecraft_user', JSON.stringify(data.user));
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedFields };
      localStorage.setItem('slicecraft_user', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
        isVerified: user?.isVerified,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
