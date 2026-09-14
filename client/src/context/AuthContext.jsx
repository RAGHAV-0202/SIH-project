import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('wandr_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('wandr_user');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (parsed && (parsed.name === 'Lord K. Stirling' || parsed.email?.includes('stirling'))) {
        parsed.name = 'Traveler';
        parsed.email = 'traveler@wandr.travel';
        localStorage.setItem('wandr_user', JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && !user) {
      setLoading(true);
      getCurrentUser(token)
        .then(res => {
          if (res.user) {
            setUser(res.user);
            localStorage.setItem('wandr_user', JSON.stringify(res.user));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    }
  }, [token]);

  const login = (jwtToken, userData) => {
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('wandr_token', jwtToken);
    localStorage.setItem('wandr_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('wandr_token');
    localStorage.removeItem('wandr_user');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
