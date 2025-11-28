import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import './Auth.css'

const Verify = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email)
    } else {
      // If no email in state, redirect to signup
      navigate('/signup')
    }
  }, [location.state, navigate])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`).focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    const newCode = [...code]
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newCode[i] = char
    })
    setCode(newCode)
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const verificationCode = code.join('')
    
    if (verificationCode.length !== 6) {
      setError('Please enter the complete verification code')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await api.verifyEmail(email, verificationCode)
      
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please try again.')
      setCode(['', '', '', '', '', ''])
      setTimeout(() => {
        const firstInput = document.getElementById('code-0')
        if (firstInput) firstInput.focus()
      }, 100)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return

    try {
      await api.resendVerification(email)
      setResendCooldown(60)
    } catch (err) {
      console.error('Resend verification error:', err)
      setResendCooldown(60)
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
              <img src="/Logo.jpeg" alt="Quick Optics AI" className="auth-logo-image" />
              <h1>Quick Optics AI</h1>
            </div>
            <h2>Verify Your Email</h2>
            <p>We've sent a verification code to</p>
            <p className="verify-email">{email}</p>
          </div>

          <form onSubmit={handleVerify} className="auth-form">
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="error-message"
              >
                {error}
              </motion.div>
            )}

            <div className="verification-code-container">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="code-input"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading || code.some(d => !d)}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            <div className="resend-section">
              <p>Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="resend-button"
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend Code'}
              </button>
            </div>
          </form>

          <div className="auth-footer">
            <p>
              Wrong email?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="auth-link-button"
              >
                Go back
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Verify

