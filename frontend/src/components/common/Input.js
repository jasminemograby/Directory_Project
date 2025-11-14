// Input Component - Design System Compliant
import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const { theme, getDesignToken } = useApp();
  const [isFocused, setIsFocused] = useState(false);
  
  const inputConfig = getDesignToken('input');
  
  const inputStyles = {
    width: '100%',
    padding: '12px 16px',
    fontFamily: 'var(--font-primary)',
    fontSize: '16px',
    lineHeight: '24px',
    borderRadius: 'var(--radius-md)',
    border: error 
      ? `2px solid var(--border-error)` 
      : isFocused 
        ? `var(--input-border-focus)` 
        : `var(--input-border)`,
    backgroundColor: disabled ? 'var(--input-bg-disabled)' : 'var(--input-bg)',
    color: 'var(--input-text)',
    outline: 'none',
    transition: 'all var(--transition-fast) var(--transition-ease)',
    boxShadow: isFocused && !error ? 'var(--input-shadow-focus)' : 'none',
    cursor: disabled ? 'not-allowed' : 'text',
    opacity: disabled ? 0.6 : 1,
  };
  
  const labelStyles = {
    display: 'block',
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    marginBottom: '8px',
  };
  
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label htmlFor={name} style={labelStyles}>
          {label}
          {required && <span style={{ color: 'var(--error-base)', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        style={inputStyles}
        className={className}
        {...props}
      />
      {error && (
        <p style={{ 
          marginTop: '8px', 
          fontSize: '14px', 
          color: 'var(--error-base)',
          lineHeight: '20px'
        }} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;

