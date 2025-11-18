/**
 * Form Validation Utility
 * Provides consistent validation across the app
 */

export const validators = {
  required: (value, message = 'This field is required') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message
    }
    return null
  },

  email: (value, message = 'Please enter a valid email address') => {
    if (!value) return null // Use required validator for empty checks
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return message
    }
    return null
  },

  minLength: (min, message) => (value) => {
    if (!value) return null
    if (value.length < min) {
      return message || `Must be at least ${min} characters`
    }
    return null
  },

  maxLength: (max, message) => (value) => {
    if (!value) return null
    if (value.length > max) {
      return message || `Must be no more than ${max} characters`
    }
    return null
  },

  password: (value, message = 'Password must be at least 8 characters with uppercase, lowercase, and number') => {
    if (!value) return null
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(value)) {
      return message
    }
    return null
  },

  passwordMatch: (password, message = 'Passwords do not match') => (value) => {
    if (!value) return null
    if (value !== password) {
      return message
    }
    return null
  },

  phone: (value, message = 'Please enter a valid phone number') => {
    if (!value) return null
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
      return message
    }
    return null
  },

  url: (value, message = 'Please enter a valid URL') => {
    if (!value) return null
    try {
      new URL(value)
      return null
    } catch {
      return message
    }
  },

  number: (value, message = 'Please enter a valid number') => {
    if (!value) return null
    if (isNaN(value)) {
      return message
    }
    return null
  },

  range: (min, max, message) => (value) => {
    if (!value) return null
    const num = Number(value)
    if (isNaN(num) || num < min || num > max) {
      return message || `Must be between ${min} and ${max}`
    }
    return null
  },

  pattern: (regex, message) => (value) => {
    if (!value) return null
    if (!regex.test(value)) {
      return message || 'Invalid format'
    }
    return null
  }
}

/**
 * Validate a form field
 * @param {any} value - The value to validate
 * @param {Array} rules - Array of validator functions
 * @returns {string|null} - Error message or null if valid
 */
export const validateField = (value, rules) => {
  if (!rules || rules.length === 0) return null

  for (const rule of rules) {
    const error = typeof rule === 'function' ? rule(value) : rule
    if (error) {
      return error
    }
  }

  return null
}

/**
 * Validate an entire form
 * @param {Object} formData - Form data object
 * @param {Object} validationRules - Object mapping field names to validation rules
 * @returns {Object} - Object with field names as keys and error messages as values
 */
export const validateForm = (formData, validationRules) => {
  const errors = {}

  Object.keys(validationRules).forEach((fieldName) => {
    const value = formData[fieldName]
    const rules = validationRules[fieldName]
    const error = validateField(value, rules)
    if (error) {
      errors[fieldName] = error
    }
  })

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  }
}

/**
 * Real-time validation hook for form fields
 * Note: This requires React to be imported in the component using it
 */
export const useFieldValidation = (initialValue = '', rules = []) => {
  // This is a placeholder - components should import React and use useState/useCallback directly
  // or use the validateField function directly
  return {
    validate: (value) => validateField(value, rules)
  }
}

// Common validation rule sets
export const commonRules = {
  email: [validators.required(), validators.email()],
  password: [validators.required(), validators.password()],
  name: [validators.required(), validators.minLength(2)('Must be at least 2 characters')],
  phone: [validators.phone()],
  required: [validators.required()]
}

export default {
  validators,
  validateField,
  validateForm,
  useFieldValidation,
  commonRules
}

