// Validation Utilities

export const validators = {
  // Email validation
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // Domain validation
  domain: (domain) => {
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    return domainRegex.test(domain);
  },
  
  // URL validation
  url: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  // Required field
  required: (value) => {
    return value !== null && value !== undefined && value !== '';
  },
  
  // Min length
  minLength: (value, min) => {
    return value && value.length >= min;
  },
  
  // Max length
  maxLength: (value, max) => {
    return value && value.length <= max;
  },
  
  // Phone validation (basic)
  phone: (phone) => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone);
  },
  
  // Positive number
  positiveNumber: (value) => {
    return !isNaN(value) && parseFloat(value) > 0;
  },
};

export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field];
    const value = formData[field];
    
    fieldRules.forEach((rule) => {
      if (rule.validator && !rule.validator(value)) {
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(rule.message);
      }
    });
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const getFieldError = (errors, field) => {
  if (errors[field] && errors[field].length > 0) {
    return errors[field][0];
  }
  return null;
};

