import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark');
      return next;
    });
  };

  const login = (email: string) => {
    setIsAuthenticated(true);
    // In a real app, store token in secure storage
    sessionStorage.setItem('admin_email', email);
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_email');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isAuthenticated, login, logout }}>
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
