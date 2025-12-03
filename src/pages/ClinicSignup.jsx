import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import Toast from '../components/Toast'
import FormInput from '../components/FormInput'
import PreAuthSplash from './PreAuthSplash'
import { useFormValidation } from '../utils/validation'
import './Auth.css'

const ClinicSignup = () => {
  const navigate = useNavigate()
  const [showSplash, setShowSplash] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [serverError, setServerError] = useState('')

  useEffect(() => {
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
    clinicName: '',
    contactPerson: '',
    email: '',
    phone: '',
    licenseNumber: '',
    address: '',
    password: '',
    confirmPassword: ''
  }, {
    clinicName: {
      required: true,
      message: 'Clinic name is required'
    },
    contactPerson: {
      required: true,
      message: 'Contact person name is required'
    },
    phone: {
      required: true,
      message: 'Phone number is required'
    },
    licenseNumber: {
      required: true,
      message: 'License number is required'
    },
    address: {
      required: true,
      message: 'Clinic address is required'
    },
    confirmPassword: {
      required: true,
      message: 'Please confirm your password'
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    setShowSuccess(false)

    if (!validateAll()) {
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setServerError('Passwords do not match')
      return
    }

    if (!formData.confirmPassword) {
      setServerError('Please confirm your password')
      return
    }

    setLoading(true)

    try {
      // Use clinic-specific signup endpoint
      const response = await api.clinicSignup({
        clinicName: formData.clinicName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        licenseNumber: formData.licenseNumber,
        address: formData.address,
        website: ''
      })
      
      setSuccessMessage('Clinic account created! Please verify your email.')
      setShowSuccess(true)
      
      setTimeout(() => {
        navigate('/verify', { state: { email: formData.email, userType: 'clinic' } })
      }, 1500)
    } catch (err) {
      const errorMessage = err.message || 'Signup failed. Please try again.'
      setServerError(errorMessage)
      console.error('Clinic signup error:', err)
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
            <h2>Register Your Clinic</h2>
            <p>Join Quick Optics AI and provide professional vision testing to your patients</p>
            <div className="clinic-badge">
              <span>👨‍⚕️</span> Clinic/Optometrist Registration
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
              type="text"
              name="clinicName"
              label="Clinic Name"
              value={formData.clinicName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="ABC Eye Care Clinic"
              required
              error={errors.clinicName}
              touched={touched.clinicName}
            />

            <FormInput
              type="text"
              name="contactPerson"
              label="Contact Person Name"
              value={formData.contactPerson}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Dr. John Doe"
              required
              error={errors.contactPerson}
              touched={touched.contactPerson}
            />

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
              hint="We'll send a verification code to this email"
              showEmailSuggestions
            />

            <FormInput
              type="tel"
              name="phone"
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="+254 700 000 000"
              required
              error={errors.phone}
              touched={touched.phone}
            />

            <FormInput
              type="text"
              name="licenseNumber"
              label="License Number"
              value={formData.licenseNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="OP-12345"
              required
              error={errors.licenseNumber}
              touched={touched.licenseNumber}
              hint="Your optometry/clinic license number"
            />

            <FormInput
              type="text"
              name="address"
              label="Clinic Address"
              value={formData.address}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="123 Main Street, Nairobi, Kenya"
              required
              error={errors.address}
              touched={touched.address}
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
              {loading ? 'Registering Clinic...' : 'Register Clinic'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have a clinic account?{' '}
              <Link to="/clinic-login" className="auth-link">
                Sign in
              </Link>
            </p>
            <p style={{ marginTop: '1rem' }}>
              <Link to="/signup" className="auth-link">
                Patient Sign Up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ClinicSignup

