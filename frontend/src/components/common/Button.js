// Button Component - Design System Compliant
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  // Get button styles from CSS variables (set by design system)
  const getButtonStyles = () => {
    // Use CSS variables that are set in index.css based on theme
    const styles = {
      primary: {
        background: 'var(--btn-primary-bg)',
        color: 'var(--btn-primary-text)',
        boxShadow: 'var(--btn-primary-shadow)',
      },
      secondary: {
        background: 'var(--btn-secondary-bg)',
        color: 'var(--btn-secondary-text)',
        border: 'var(--btn-secondary-border, none)',
      },
      outline: {
        background: 'var(--btn-outline-bg)',
        color: 'var(--btn-outline-text)',
        border: 'var(--btn-outline-border)',
      },
      ghost: {
        background: 'transparent',
        color: 'var(--text-primary)',
      },
    };
    
    return styles[variant] || styles.primary;
  };
  
  const getHoverStyles = () => {
    const hoverStyles = {
      primary: {
        background: 'var(--btn-primary-bg-hover)',
        boxShadow: 'var(--btn-primary-shadow-hover)',
        transform: 'translateY(-1px)',
      },
      secondary: {
        background: 'var(--btn-secondary-bg-hover)',
      },
      outline: {
        background: 'var(--btn-outline-bg-hover)',
        color: 'var(--btn-outline-text-hover)',
        border: 'var(--btn-outline-border-hover)',
      },
      ghost: {
        background: 'var(--btn-secondary-bg-hover)',
      },
    };
    
    return hoverStyles[variant] || hoverStyles.primary;
  };
  
  const baseStyles = {
    fontFamily: 'var(--font-primary)',
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    outline: 'none',
    transition: 'all var(--transition-fast) var(--transition-ease)',
    ...getButtonStyles(),
  };
  
  const sizeStyles = {
    sm: { padding: '8px 16px', fontSize: '14px', lineHeight: '20px' },
    md: { padding: '12px 24px', fontSize: '16px', lineHeight: '24px' },
    lg: { padding: '16px 32px', fontSize: '18px', lineHeight: '28px' },
  };
  
  const [isHovered, setIsHovered] = React.useState(false);
  
  const combinedStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...(isHovered && !disabled && !loading ? getHoverStyles() : {}),
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={combinedStyles}
      className={className}
      {...props}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LoadingSpinner size="sm" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;

