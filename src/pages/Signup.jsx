import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import Toast from '../components/Toast'
import FormInput from '../components/FormInput'
import { useFormValidation, validationRules } from '../utils/validation'
import './Auth.css'

const Signup = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [serverError, setServerError] = useState('')

  // Custom validation rules for signup
  const signupRules = {
    ...validationRules,
    confirmPassword: {
      required: true,
      message: 'Please confirm your password'
    }
  }

  const {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll
  } = useFormValidation({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  }, signupRules)

  // Custom validation for password confirmation
  const validatePasswordMatch = () => {
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      return 'Passwords do not match'
    }
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    setShowSuccess(false)

    // Validate all fields
    if (!validateAll()) {
      return
    }

    // Check password confirmation
    const passwordError = validatePasswordMatch()
    if (passwordError) {
      setServerError(passwordError)
      return
    }

    setLoading(true)

    try {
      const response = await api.signup(formData.name, formData.email, formData.password)
      
      // Show success message
      setSuccessMessage(`Account created successfully! Please check your email for verification code.`)
      setShowSuccess(true)
      
      // Navigate to login after showing success message
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            email: formData.email,
            message: 'Account created! Please login with your email and password.'
          } 
        })
      }, 2000)
    } catch (err) {
      const errorMessage = err.message || 'Signup failed. Please try again.'
      setServerError(errorMessage)
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {showSuccess && (
        <Toast
          message={successMessage}
          type="success"
          duration={3000}
          onClose={() => setShowSuccess(false)}
        />
      )}
      
      <div className="auth-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="auth-card"
        >
          <div className="auth-header">
            <div className="auth-logo">
              <span className="logo-icon">👁️</span>
              <h1>Quick Optics AI</h1>
            </div>
            <h2>Create Account</h2>
            <p>Start your vision health journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {serverError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="error-message"
              >
                {serverError}
              </motion.div>
            )}

            <FormInput
              type="text"
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="John Doe"
              required
              error={errors.name}
              touched={touched.name}
            />

            <FormInput
              type="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="you@example.com"
              required
              error={errors.email}
              touched={touched.email}
              showEmailSuggestions
            />

            <FormInput
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="••••••••"
              required
              error={errors.password}
              touched={touched.password}
              showPasswordStrength
            />

            <FormInput
              type="password"
              name="confirmPassword"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="••••••••"
              required
              error={errors.confirmPassword || (touched.confirmPassword && validatePasswordMatch())}
              touched={touched.confirmPassword}
              hint="Re-enter your password to confirm"
            />

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span>I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link></span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading || Object.keys(errors).some(key => errors[key]) || validatePasswordMatch()}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Signup

