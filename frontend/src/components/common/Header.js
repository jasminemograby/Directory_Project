// Global Header Component - Logo + Theme Toggle
import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { API_BASE_URL } from '../../utils/constants';

const Header = () => {
  const { theme, toggleTheme, getDesignToken } = useApp();
  const [logoError, setLogoError] = useState(false);

  const logoUrl = `${API_BASE_URL}/api/logo/${theme === 'day-mode' ? 'light' : 'dark'}`;

  const headerConfig = getDesignToken('header');
  
  const headerStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1030,
    height: headerConfig?.height || '64px',
    backgroundColor: theme === 'day-mode' ? 'var(--header-bg-transparent)' : 'var(--header-bg-transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: theme === 'day-mode' ? 'var(--header-border)' : 'var(--header-border)',
    boxShadow: theme === 'day-mode' ? 'var(--header-shadow)' : 'var(--header-shadow)',
    transition: 'all var(--transition-normal) var(--transition-ease)',
  };
  
  const containerStyles = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 24px',
    height: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };
  
  const toggleButtonStyles = {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-full)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: theme === 'day-mode' 
      ? '1px solid var(--border-default)' 
      : '1px solid var(--border-default)',
    backgroundColor: theme === 'day-mode' 
      ? 'var(--btn-secondary-bg)' 
      : 'transparent',
    color: theme === 'day-mode' 
      ? 'var(--text-secondary)' 
      : 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast) var(--transition-ease)',
  };
  
  return (
    <header style={headerStyles}>
      <div style={containerStyles}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {!logoError ? (
            <img
              src={logoUrl}
              alt="Logo"
              style={{ 
                height: '32px', 
                width: 'auto',
                maxWidth: '200px',
                objectFit: 'contain'
              }}
              onError={() => setLogoError(true)}
            />
          ) : null}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme === 'day-mode' 
              ? 'var(--btn-secondary-bg-hover)' 
              : 'var(--btn-outline-bg-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme === 'day-mode' 
              ? 'var(--btn-secondary-bg)' 
              : 'transparent';
          }}
          style={toggleButtonStyles}
          aria-label="Toggle theme"
        >
          {theme === 'day-mode' ? (
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;

