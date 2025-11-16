import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import './Payment.css'

const Payment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState('premium')
  const [paymentMethod, setPaymentMethod] = useState('mpesa')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [processing, setProcessing] = useState(false)
  
  // Get test results from location state
  const testResults = location.state?.results || {}

  const plans = [
    {
      id: 'basic',
      name: 'Basic Report',
      price: 500,
      features: [
        'Basic vision test results',
        'General recommendations',
        'Email report'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Report',
      price: 1000,
      features: [
        'Detailed vision analysis',
        'Personalized recommendations',
        'PDF report download',
        'Eyewear recommendations',
        'AR try-on access',
        'Priority support'
      ],
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro Package',
      price: 2000,
      features: [
        'Everything in Premium',
        'Multiple test history',
        'Advanced analytics',
        'Partner optician discounts',
        'Lifetime updates'
      ]
    }
  ]

  const handlePayment = async () => {
    setProcessing(true)
    
    try {
      const paymentData = {
        plan: selectedPlan,
        method: paymentMethod,
        amount: plans.find(p => p.id === selectedPlan)?.price || 0,
        testResults: testResults
      }

      const response = await api.initiatePayment(paymentData)
      
      if (response.success) {
        // Navigate to payment confirmation page
        navigate('/payment-confirmation', {
          state: {
            paymentInfo: {
              method: paymentMethod,
              amount: paymentData.amount,
              transactionId: response.transactionId
            }
          }
        })
      } else {
        alert(response.message || 'Payment initiation failed')
        setProcessing(false)
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
      setProcessing(false)
    }
  }

  return (
    <div className="payment">
      <div className="payment-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="payment-header"
        >
          <h1 className="payment-title">Unlock Your Full Results</h1>
          <p className="payment-subtitle">
            Get detailed analysis and personalized recommendations
          </p>
        </motion.div>

        {!showPaymentForm ? (
          <>
            <div className="plans-grid">
              {plans.map((plan) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: plans.indexOf(plan) * 0.1 }}
                  className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="popular-badge">Most Popular</div>
                  )}
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-price">
                    <span className="price-amount">KES {plan.price}</span>
                    <span className="price-period">one-time</span>
                  </div>
                  <ul className="plan-features">
                    {plan.features.map((feature, idx) => (
                      <li key={idx}>
                        <span className="feature-icon">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`plan-select-btn ${selectedPlan === plan.id ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedPlan(plan.id)
                    }}
                  >
                    {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="payment-actions">
              <button
                className="btn btn-secondary btn-large"
                onClick={() => navigate('/results')}
              >
                View Free Summary
              </button>
              <button
                className="btn btn-primary btn-large"
                onClick={() => setShowPaymentForm(true)}
              >
                Continue to Payment
              </button>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="payment-form-container"
          >
            <div className="payment-form-header">
              <button
                className="back-button"
                onClick={() => setShowPaymentForm(false)}
              >
                ← Back
              </button>
              <h2>Payment Details</h2>
            </div>

            <div className="selected-plan-summary">
              <h3>{plans.find(p => p.id === selectedPlan)?.name}</h3>
              <p className="plan-total">
                Total: <strong>KES {plans.find(p => p.id === selectedPlan)?.price}</strong>
              </p>
            </div>

            <div className="payment-methods">
              <h3>Payment Method</h3>
              <div className="method-options">
                <button
                  className={`method-option ${paymentMethod === 'mpesa' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('mpesa')}
                >
                  📱 M-Pesa
                  <span className="method-desc">Mobile Money</span>
                </button>
                <button
                  className={`method-option ${paymentMethod === 'paystack' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('paystack')}
                >
                  💳 Paystack
                  <span className="method-desc">Card Payment</span>
                </button>
              </div>
            </div>

            {paymentMethod === 'mpesa' && (
              <div className="mpesa-info">
                <div className="payment-instructions">
                  <h4>M-Pesa Payment Instructions:</h4>
                  <ol>
                    <li>Click "Pay Now" to initiate payment</li>
                    <li>You'll receive an M-Pesa prompt on your phone</li>
                    <li>Enter your M-Pesa PIN to complete payment</li>
                    <li>You'll receive a confirmation code via SMS</li>
                    <li>Enter the code on the next page to activate your account</li>
                  </ol>
                </div>
              </div>
            )}

            {paymentMethod === 'paystack' && (
              <div className="paystack-info">
                <div className="payment-instructions">
                  <h4>Paystack Payment Instructions:</h4>
                  <ol>
                    <li>Click "Pay Now" to continue</li>
                    <li>You'll be redirected to Paystack secure payment page</li>
                    <li>Enter your card details and complete payment</li>
                    <li>You'll receive a confirmation code via email</li>
                    <li>Enter the code on the next page to activate your account</li>
                  </ol>
                </div>
              </div>
            )}

            <div className="security-note">
              <span className="security-icon">🔒</span>
              <p>Your payment is secure and encrypted. We never store your card details.</p>
            </div>

            <button
              className="btn btn-primary btn-large btn-pay"
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                `Pay KES ${plans.find(p => p.id === selectedPlan)?.price}`
              )}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Payment

