import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    Boolean(sessionStorage.getItem('admin_token'))
  );
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem('admin_token')
  );

  const login = (email: string, authToken: string) => {
    setIsAuthenticated(true);
    setToken(authToken);
    sessionStorage.setItem('admin_email', email);
    sessionStorage.setItem('admin_token', authToken);
  };

  const logout = async () => {
    const current = sessionStorage.getItem('admin_token');
    // Best-effort server-side logout; local session clears regardless.
    if (current) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: current }),
        });
      } catch {
        // ignore network errors on logout
      }
    }
    setIsAuthenticated(false);
    setToken(null);
    sessionStorage.removeItem('admin_email');
    sessionStorage.removeItem('admin_token');
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
