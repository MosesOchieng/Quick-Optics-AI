import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import Toast from '../components/Toast'
import FormInput from '../components/FormInput'
import PreAuthSplash from './PreAuthSplash'
import { useFormValidation } from '../utils/validation'
import './Auth.css'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showSplash, setShowSplash] = useState(true)
  const userType = location.state?.userType || 'user' // 'user' or 'clinic'
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
    email: location.state?.email || '',
    password: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    setShowSuccess(false)

    // Validate all fields
    if (!validateAll()) {
      return
    }

    setLoading(true)

    try {
      const response = await api.login(formData.email, formData.password)
      
      // Store auth data
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('user_data', JSON.stringify(response.user))
      
      // Show success message
      setSuccessMessage(`Welcome back, ${response.user?.name || 'User'}!`)
      setShowSuccess(true)
      
      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please check your email and password.'
      setServerError(errorMessage)
      console.error('Login error:', err)
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
            <h2>{userType === 'clinic' ? 'Clinic Portal' : 'Welcome Back'}</h2>
            <p>
              {userType === 'clinic' 
                ? 'Access your clinic dashboard and manage patient screenings'
                : 'Sign in to continue your vision journey'}
            </p>
            {userType === 'clinic' && (
              <div className="clinic-badge">
                <span>👨‍⚕️</span> Clinic/Optometrist Access
              </div>
            )}
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
            
            {location.state?.message && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="info-message"
              >
                {location.state.message}
              </motion.div>
            )}

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
              hint="Use the email you registered with"
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
              />

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading || Object.keys(errors).some(key => errors[key])}
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account yet?{' '}
              <Link to="/signup" className="auth-link">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login

