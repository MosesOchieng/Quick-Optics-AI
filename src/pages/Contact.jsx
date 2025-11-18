import { useState } from 'react'
import { motion } from 'framer-motion'
import Toast from '../components/Toast'
import './Contact.css'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your name')
      setShowError(true)
      return false
    }
    if (!formData.email.trim()) {
      setErrorMessage('Please enter your email')
      setShowError(true)
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage('Please enter a valid email address')
      setShowError(true)
      return false
    }
    if (!formData.message.trim()) {
      setErrorMessage('Please enter your message')
      setShowError(true)
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setShowError(false)
    setErrorMessage('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // In a real app, this would send to your backend
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Save to localStorage as fallback
      const submissions = JSON.parse(localStorage.getItem('contact_submissions') || '[]')
      submissions.push({
        ...formData,
        timestamp: new Date().toISOString()
      })
      localStorage.setItem('contact_submissions', JSON.stringify(submissions))

      setShowSuccess(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      setErrorMessage('Failed to send message. Please try again.')
      setShowError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="contact-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="contact-container"
      >
        <div className="contact-header">
          <h1 className="contact-title">Contact Us</h1>
          <p className="contact-subtitle">
            Have a question or need help? We're here to assist you.
          </p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <div className="info-card">
              <div className="info-icon">📧</div>
              <h3>Email</h3>
              <a href="mailto:support@quickoptics.ai">support@quickoptics.ai</a>
            </div>
            <div className="info-card">
              <div className="info-icon">💬</div>
              <h3>Response Time</h3>
              <p>We typically respond within 24 hours</p>
            </div>
            <div className="info-card">
              <div className="info-icon">🕒</div>
              <h3>Business Hours</h3>
              <p>Monday - Friday, 9 AM - 6 PM EST</p>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What is this about?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Tell us how we can help..."
              />
            </div>

            {showError && (
              <div className="form-error">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        <div className="contact-faq">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h3>How accurate are the vision tests?</h3>
              <p>
                Our AI-powered tests provide screening-level accuracy. For definitive diagnosis,
                please consult with a licensed eye care professional.
              </p>
            </div>
            <div className="faq-item">
              <h3>Is my data secure?</h3>
              <p>
                Yes, we take privacy seriously. All data is encrypted and stored securely.
                See our <a href="/privacy">Privacy Policy</a> for more details.
              </p>
            </div>
            <div className="faq-item">
              <h3>Can I export my test results?</h3>
              <p>
                Yes, you can export your data from the <a href="/settings">Settings</a> page.
                Results can also be shared with your eye care professional.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {showSuccess && (
        <Toast
          message="Message sent successfully! We'll get back to you soon."
          type="success"
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  )
}

export default Contact

