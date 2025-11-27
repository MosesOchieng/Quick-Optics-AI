import { useState } from 'react'
import { validateField, getPasswordStrength, validateEmailWithSuggestions } from '../utils/validation'
import './FormInput.css'

const FormInput = ({
  type = 'text',
  name,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error,
  touched,
  hint,
  showPasswordStrength = false,
  showEmailSuggestions = false,
  validationRules,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [emailSuggestions, setEmailSuggestions] = useState([])

  const handleChange = (e) => {
    const newValue = e.target.value
    onChange(name, newValue)

    // Handle email suggestions
    if (showEmailSuggestions && type === 'email') {
      const validation = validateEmailWithSuggestions(newValue)
      setEmailSuggestions(validation.suggestions || [])
    }
  }

  const handleBlur = (e) => {
    if (onBlur) onBlur(name)
    setEmailSuggestions([]) // Hide suggestions on blur
  }

  const handleSuggestionClick = (suggestion) => {
    onChange(name, suggestion)
    setEmailSuggestions([])
  }

  const passwordStrength = showPasswordStrength && type === 'password' ? getPasswordStrength(value) : null

  const inputType = type === 'password' && showPassword ? 'text' : type

  return (
    <div className={`form-input-container ${className}`}>
      <div className="form-input-wrapper">
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="required-asterisk">*</span>}
        </label>
        
        <div className="input-wrapper">
          <input
            type={inputType}
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`form-input ${error && touched ? 'error' : ''} ${value && !error ? 'valid' : ''}`}
            aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
            aria-invalid={error && touched ? 'true' : 'false'}
            {...props}
          />
          
          {type === 'password' && value && (
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          )}
          
          {value && !error && touched && (
            <div className="validation-icon success">✓</div>
          )}
          
          {error && touched && (
            <div className="validation-icon error">✕</div>
          )}
        </div>

        {/* Email Suggestions */}
        {emailSuggestions.length > 0 && (
          <div className="email-suggestions">
            <p className="suggestions-label">Did you mean:</p>
            {emailSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="suggestion-button"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Password Strength Indicator */}
        {passwordStrength && value && (
          <div className="password-strength">
            <div className="strength-bar">
              <div 
                className="strength-fill"
                style={{ 
                  width: `${(passwordStrength.strength / 5) * 100}%`,
                  backgroundColor: passwordStrength.color
                }}
              />
            </div>
            <div className="strength-info">
              <span className="strength-label" style={{ color: passwordStrength.color }}>
                {passwordStrength.label}
              </span>
              <div className="strength-checks">
                <span className={passwordStrength.checks.length ? 'check-pass' : 'check-fail'}>
                  8+ chars
                </span>
                <span className={passwordStrength.checks.lowercase ? 'check-pass' : 'check-fail'}>
                  lowercase
                </span>
                <span className={passwordStrength.checks.uppercase ? 'check-pass' : 'check-fail'}>
                  uppercase
                </span>
                <span className={passwordStrength.checks.numbers ? 'check-pass' : 'check-fail'}>
                  number
                </span>
                <span className={passwordStrength.checks.symbols ? 'check-pass' : 'check-fail'}>
                  symbol
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && touched && (
          <div id={`${name}-error`} className="error-message" role="alert">
            {error}
          </div>
        )}

        {/* Hint */}
        {hint && !error && (
          <div id={`${name}-hint`} className="form-hint">
            {hint}
          </div>
        )}
      </div>
    </div>
  )
}

export default FormInput
