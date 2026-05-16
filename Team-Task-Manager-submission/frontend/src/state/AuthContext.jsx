import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api/client.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('ttm_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ttm_token');
    if (!token) {
      setLoading(false);
      return;
    }

    apiRequest('/auth/me')
      .then(({ user: currentUser }) => {
        setUser(currentUser);
        localStorage.setItem('ttm_user', JSON.stringify(currentUser));
      })
      .catch(() => {
        localStorage.removeItem('ttm_token');
        localStorage.removeItem('ttm_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const authenticate = async (path, payload) => {
    const data = await apiRequest(path, {
      method: 'POST',
      body: payload
    });

    localStorage.setItem('ttm_token', data.token);
    localStorage.setItem('ttm_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const value = useMemo(() => ({
    user,
    loading,
    isAdmin: user?.role === 'Admin',
    login: (payload) => authenticate('/auth/login', payload),
    signup: (payload) => authenticate('/auth/signup', payload),
    logout: () => {
      localStorage.removeItem('ttm_token');
      localStorage.removeItem('ttm_user');
      setUser(null);
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
