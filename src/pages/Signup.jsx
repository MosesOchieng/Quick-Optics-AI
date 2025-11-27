import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import Toast from '../components/Toast'
import FormInput from '../components/FormInput'
import PreAuthSplash from './PreAuthSplash'
import { useFormValidation } from '../utils/validation'
import './Auth.css'

const Signup = () => {
  const navigate = useNavigate()
  const [showSplash, setShowSplash] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    // Show splash for 2 seconds on first visit
    const hasSeenSplash = localStorage.getItem('hasSeenPreAuthSplash')
    if (!hasSeenSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false)
      }, 2000)
      return () => clearTimeout(timer)
    } else {
      setShowSplash(false)
    }
  }, [])

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
  }, {
    confirmPassword: {
      required: true,
      message: 'Please confirm your password'
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    setShowSuccess(false)

    // Validate all fields
    if (!validateAll()) {
      return
    }

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setServerError('Passwords do not match')
      return
    }

    // Additional validation for confirmPassword
    if (!formData.confirmPassword) {
      setServerError('Please confirm your password')
      return
    }

    setLoading(true)

    try {
      const response = await api.signup(formData.name, formData.email, formData.password)
      
      // Show success message
      setSuccessMessage('Account created! Please verify your email.')
      setShowSuccess(true)
      
      // Navigate to verification page after a short delay
      setTimeout(() => {
        navigate('/verify', { state: { email: formData.email } })
      }, 1500)
    } catch (err) {
      const errorMessage = err.message || 'Signup failed. Please try again.'
      setServerError(errorMessage)
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (showSplash) {
    return <PreAuthSplash />
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
            <h2>Create Your Account</h2>
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
              hint="We'll send a verification code to this email"
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
              hint="At least 8 characters with uppercase, lowercase, and number"
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
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
            />

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading || Object.keys(errors).some(key => errors[key])}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
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

