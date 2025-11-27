/**
 * Form Validation Utility
 * Provides real-time validation for forms with instant feedback
 */

import { useState } from 'react'

// Validation rules
export const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
  },
  name: {
    required: true,
    minLength: 2,
    pattern: /^[a-zA-Z\s]+$/,
    message: 'Name must contain only letters and spaces'
  },
  phone: {
    required: false,
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Please enter a valid phone number'
  }
}

// Validate single field
export const validateField = (fieldName, value, rules = validationRules) => {
  const rule = rules[fieldName]
  if (!rule) return { isValid: true, message: '' }

  // Check required
  if (rule.required && (!value || value.trim() === '')) {
    return { isValid: false, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required` }
  }

  // Skip other validations if field is empty and not required
  if (!rule.required && (!value || value.trim() === '')) {
    return { isValid: true, message: '' }
  }

  // Check minimum length
  if (rule.minLength && value.length < rule.minLength) {
    return { 
      isValid: false, 
      message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${rule.minLength} characters` 
    }
  }

  // Check pattern
  if (rule.pattern && !rule.pattern.test(value)) {
    return { isValid: false, message: rule.message }
  }

  return { isValid: true, message: '' }
}

// Validate entire form
export const validateForm = (formData, rules = validationRules) => {
  const errors = {}
  let isFormValid = true

  Object.keys(formData).forEach(fieldName => {
    const validation = validateField(fieldName, formData[fieldName], rules)
    if (!validation.isValid) {
      errors[fieldName] = validation.message
      isFormValid = false
    }
  })

  return { isValid: isFormValid, errors }
}

// Password strength checker
export const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: '', color: '#e5e7eb' }

  let score = 0
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[@$!%*?&]/.test(password)
  }

  score = Object.values(checks).filter(Boolean).length

  const strengthLevels = {
    0: { label: 'Very Weak', color: '#ef4444' },
    1: { label: 'Weak', color: '#f97316' },
    2: { label: 'Fair', color: '#eab308' },
    3: { label: 'Good', color: '#22c55e' },
    4: { label: 'Strong', color: '#16a34a' },
    5: { label: 'Very Strong', color: '#15803d' }
  }

  return {
    strength: score,
    label: strengthLevels[score].label,
    color: strengthLevels[score].color,
    checks
  }
}

// Email validation with suggestions
export const validateEmailWithSuggestions = (email) => {
  const validation = validateField('email', email)
  
  if (!validation.isValid && email.includes('@')) {
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
    const [localPart, domain] = email.split('@')
    
    if (domain) {
      const suggestions = commonDomains
        .filter(d => d.startsWith(domain.toLowerCase()) || domain.toLowerCase().startsWith(d.substring(0, 3)))
        .slice(0, 2)
      
      if (suggestions.length > 0) {
        return {
          ...validation,
          suggestions: suggestions.map(d => `${localPart}@${d}`)
        }
      }
    }
  }
  
  return validation
}

// Real-time validation hook
export const useFormValidation = (initialData, customRules = {}) => {
  const [formData, setFormData] = useState(initialData)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isValid, setIsValid] = useState(false)

  const rules = { ...validationRules, ...customRules }

  const validateSingleField = (fieldName, value) => {
    const validation = validateField(fieldName, value, rules)
    setErrors(prev => ({
      ...prev,
      [fieldName]: validation.isValid ? '' : validation.message
    }))
    return validation.isValid
  }

  const handleChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }))
    
    // Only validate if field has been touched
    if (touched[fieldName]) {
      validateSingleField(fieldName, value)
    }
  }

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }))
    validateSingleField(fieldName, formData[fieldName])
  }

  const validateAll = () => {
    const validation = validateForm(formData, rules)
    setErrors(validation.errors)
    setIsValid(validation.isValid)
    
    // Mark all fields as touched
    const allTouched = {}
    Object.keys(formData).forEach(key => {
      allTouched[key] = true
    })
    setTouched(allTouched)
    
    return validation.isValid
  }

  const reset = () => {
    setFormData(initialData)
    setErrors({})
    setTouched({})
    setIsValid(false)
  }

  return {
    formData,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setFormData
  }
}

export default {
  validationRules,
  validateField,
  validateForm,
  getPasswordStrength,
  validateEmailWithSuggestions,
  useFormValidation
}
