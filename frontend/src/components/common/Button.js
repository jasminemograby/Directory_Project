// Button Component - Design System Compliant
import React from 'react';
import { useApp } from '../../contexts/AppContext';
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
  const { theme, getDesignToken } = useApp();
  
  // Get button styles from design system
  const getButtonStyles = () => {
    const buttonConfig = getDesignToken(`button.${variant}`);
    if (!buttonConfig) return {};
    
    const isGradient = typeof buttonConfig.background === 'string' && buttonConfig.background.includes('gradient');
    
    return {
      background: isGradient ? buttonConfig.background : buttonConfig.background,
      color: buttonConfig.text,
      border: buttonConfig.border || 'none',
      boxShadow: buttonConfig.shadow || 'none',
      transition: 'all var(--transition-fast) var(--transition-ease)',
    };
  };
  
  const getHoverStyles = () => {
    const buttonConfig = getDesignToken(`button.${variant}`);
    if (!buttonConfig) return {};
    
    return {
      background: buttonConfig.backgroundHover,
      boxShadow: buttonConfig.shadowHover || buttonConfig.shadow,
      transform: variant === 'primary' ? 'translateY(-1px)' : 'none',
    };
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

