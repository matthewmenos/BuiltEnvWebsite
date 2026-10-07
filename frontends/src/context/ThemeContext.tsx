import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, token: string) => void;
  logout: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    Boolean(sessionStorage.getItem('admin_token'))
  );
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem('admin_token')
  );

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark');
      return next;
    });
  };

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
    <ThemeContext.Provider
      value={{ theme, toggleTheme, isAuthenticated, token, login, logout }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
