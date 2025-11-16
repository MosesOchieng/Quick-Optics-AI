/**
 * API utility for connecting frontend to backend
 */

// Base URL for the backend API
// Prefer VITE_API_URL if set (e.g. in Vercel), otherwise default to the Render backend
const RAW_BASE_URL = import.meta.env.VITE_API_URL || 'https://quick-optics-backend.onrender.com'

// Ensure we always talk to the /api prefix and avoid double slashes
const API_BASE_URL = `${RAW_BASE_URL.replace(/\/+$/, '')}/api`

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('auth_token')
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...options
  }

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body)
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Request failed')
    }
    
    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

export const api = {
  // Payment
  async initiatePayment(paymentData) {
    return apiRequest('/payment/initiate', {
      method: 'POST',
      body: paymentData
    })
  },

  async verifyPayment(verificationData) {
    return apiRequest('/payment/verify', {
      method: 'POST',
      body: verificationData
    })
  },

  // Auth
  async signup(name, email, password) {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: { name, email, password }
    })
  },

  async verifyEmail(email, code) {
    return apiRequest('/auth/verify', {
      method: 'POST',
      body: { email, code }
    })
  },

  async login(email, password) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password }
    })
  },

  async requestOTP(email) {
    return apiRequest('/auth/request-otp', {
      method: 'POST',
      body: { email }
    })
  },

  async loginWithOTP(email, otp) {
    return apiRequest('/auth/login-otp', {
      method: 'POST',
      body: { email, otp }
    })
  },

  async getCurrentUser() {
    return apiRequest('/auth/me')
  },

  // Test Results
  async saveTestResult(result) {
    return apiRequest('/tests/results', {
      method: 'POST',
      body: result
    })
  },

  async getTestResults() {
    return apiRequest('/tests/results')
  },

  // Game Results
  async saveGameResult(result) {
    return apiRequest('/games/results', {
      method: 'POST',
      body: result
    })
  },

  // CVIE
  async analyzeCVIE(data) {
    return apiRequest('/cvie/analyze', {
      method: 'POST',
      body: data
    })
  }
}

export default api

