import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import './Auth.css'

const PaymentConfirmation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    paymentCode: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Get payment info from location state
  const paymentInfo = location.state?.paymentInfo || {}

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.verifyPayment({
        email: formData.email,
        paymentCode: formData.paymentCode,
        paymentMethod: paymentInfo.method,
        amount: paymentInfo.amount
      })

      if (response.success) {
        // Account activated, navigate to login
        navigate('/login', { 
          state: { 
            email: formData.email,
            message: 'Payment confirmed! Please login with your email and OTP.'
          } 
        })
      } else {
        setError(response.message || 'Payment verification failed')
      }
    } catch (err) {
      setError(err.message || 'Failed to verify payment. Please check your code and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
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
            <h2>Confirm Payment</h2>
            <p>Enter your email and payment confirmation code</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="error-message"
              >
                {error}
              </motion.div>
            )}

            {paymentInfo.method && (
              <div className="payment-info-badge">
                <span className="payment-method">{paymentInfo.method}</span>
                {paymentInfo.amount && (
                  <span className="payment-amount">KES {paymentInfo.amount}</span>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
              <small className="form-hint">This will be your login email</small>
            </div>

            <div className="form-group">
              <label htmlFor="paymentCode">Payment Confirmation Code</label>
              <input
                type="text"
                id="paymentCode"
                value={formData.paymentCode}
                onChange={(e) => setFormData({ ...formData, paymentCode: e.target.value.toUpperCase() })}
                placeholder="Enter code from M-Pesa/Paystack"
                required
                maxLength={20}
              />
              <small className="form-hint">
                Check your SMS or email for the confirmation code
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Confirm Payment & Activate Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Need help?{' '}
              <a href="mailto:support@quickoptics.ai" className="auth-link">
                Contact Support
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PaymentConfirmation

