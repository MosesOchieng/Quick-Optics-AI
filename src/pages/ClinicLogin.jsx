import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import Toast from '../components/Toast'
import FormInput from '../components/FormInput'
import PreAuthSplash from './PreAuthSplash'
import { useFormValidation } from '../utils/validation'
import './Auth.css'

const ClinicLogin = () => {
  const navigate = useNavigate()
  const [showSplash, setShowSplash] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    // Show splash for 3 seconds before showing login form
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll
  } = useFormValidation({
    email: '',
    password: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    setShowSuccess(false)

    if (!validateAll()) {
      return
    }

    setLoading(true)

    try {
      // Use clinic-specific endpoint if available, otherwise use regular login
      const response = await api.login(formData.email, formData.password)
      
      // Verify this is a clinic account
      if (response.user?.userType !== 'clinic' && response.user?.userType !== 'optometrist') {
        setServerError('This account is not registered as a clinic. Please use patient login.')
        setLoading(false)
        return
      }
      
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('user_data', JSON.stringify(response.user))
      localStorage.setItem('user_type', 'clinic')
      
      setSuccessMessage(`Welcome back, ${response.user?.clinicName || response.user?.name || 'Clinic'}!`)
      setShowSuccess(true)
      
      setTimeout(() => {
        navigate('/opticians-dashboard')
      }, 1500)
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please check your email and password.'
      setServerError(errorMessage)
      console.error('Clinic login error:', err)
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
              <img src="/Logo.jpeg" alt="Quick Optics AI" className="auth-logo-image" />
              <h1>Quick Optics AI</h1>
            </div>
            <h2>Clinic Portal Login</h2>
            <p>Access your clinic dashboard and manage patient screenings</p>
            <div className="clinic-badge">
              <span>👨‍⚕️</span> Clinic/Optometrist Access
            </div>
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
              type="email"
              name="email"
              label="Clinic Email Address"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="clinic@example.com"
              required
              error={errors.email}
              touched={touched.email}
              hint="Use the email registered for your clinic"
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
              {loading ? 'Signing in...' : 'Login to Clinic Portal'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have a clinic account?{' '}
              <Link to="/clinic-signup" className="auth-link">
                Register your clinic
              </Link>
            </p>
            <p style={{ marginTop: '1rem' }}>
              <Link to="/login" className="auth-link">
                Patient Login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ClinicLogin

