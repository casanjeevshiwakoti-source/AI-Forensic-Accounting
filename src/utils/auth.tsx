import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AUTH_KEY = 'forensic-ai-auth';

const DUMMY_CREDENTIALS = [
  { username: 'admin', password: 'admin123', name: 'Alex Investigator' },
  { username: 'demo', password: 'demo123', name: 'Demo User' },
];

interface AuthContextType {
  isAuthenticated: boolean;
  userName: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        const { username } = JSON.parse(stored);
        const cred = DUMMY_CREDENTIALS.find((c) => c.username === username);
        if (cred) {
          setIsAuthenticated(true);
          setUserName(cred.name);
        }
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
  }, []);

  const login = useCallback((username: string, password: string): boolean => {
    const cred = DUMMY_CREDENTIALS.find(
      (c) => c.username.toLowerCase() === username.toLowerCase() && c.password === password
    );
    if (cred) {
      setIsAuthenticated(true);
      setUserName(cred.name);
      localStorage.setItem(AUTH_KEY, JSON.stringify({ username: cred.username }));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUserName(null);
    localStorage.removeItem(AUTH_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
