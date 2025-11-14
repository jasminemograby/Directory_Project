// App Context - Theme Management + Design System
import React, { createContext, useContext, useState, useEffect } from 'react';
import { designSystem, getThemeValue, getToken } from '../config/designSystem';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Initialize theme from localStorage or default to 'day-mode'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'day-mode';
  });

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'night-mode') {
      root.classList.add('night-mode');
      root.classList.remove('day-mode');
    } else {
      root.classList.add('day-mode');
      root.classList.remove('night-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'day-mode' ? 'night-mode' : 'day-mode');
  };

  // Helper functions for design system access
  const getDesignToken = (path) => getThemeValue(theme, path);
  const getDesignSystemToken = (category, key) => getToken(category, key, theme);

  const value = {
    theme,
    toggleTheme,
    designSystem,
    getDesignToken,
    getDesignSystemToken,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

