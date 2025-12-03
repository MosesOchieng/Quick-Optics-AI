/**
 * API utility for connecting frontend to backend
 */

// Base URL for the backend API
// Prefer VITE_API_URL if set (e.g. in Vercel), otherwise default to the Render backend
// To configure: Set VITE_API_URL environment variable in Vercel to your Render backend URL
const RAW_BASE_URL = import.meta.env.VITE_API_URL || 'https://quick-optics-backend.onrender.com'

// Ensure we always talk to the /api prefix and avoid double slashes
const API_BASE_URL = `${RAW_BASE_URL.replace(/\/+$/, '')}/api`

// Log API URL in development for debugging
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', API_BASE_URL)
  console.log('📡 Backend URL:', RAW_BASE_URL)
}

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
    
    // Handle non-JSON responses
    let data
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      try {
        data = JSON.parse(text)
      } catch {
        data = { message: text || 'Request failed' }
      }
    }
    
    if (!response.ok) {
      // Don't throw for 401/403 if it's an optional auth endpoint
      if (response.status === 401 || response.status === 403) {
        // Clear invalid token
        if (token) {
          localStorage.removeItem('auth_token')
        }
      }
      throw new Error(data.message || `Request failed with status ${response.status}`)
    }
    
    return data
  } catch (error) {
    // Network errors or CORS issues
    if (error.name === 'TypeError' || error.message.includes('fetch')) {
      console.error('API Connection Error:', error)
      throw new Error('Unable to connect to server. Please check your connection.')
    }
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

  async clinicSignup(clinicData) {
    return apiRequest('/clinics/signup', {
      method: 'POST',
      body: clinicData
    })
  },

  async clinicLogin(email, password) {
    return apiRequest('/clinics/login', {
      method: 'POST',
      body: { email, password }
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

  async resendVerification(email) {
    return apiRequest('/auth/resend-verification', {
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

  // Test Results (optional auth - works without login)
  async saveTestResult(result) {
    try {
      return await apiRequest('/tests/results', {
        method: 'POST',
        body: result
      })
    } catch (error) {
      // If save fails, store locally as fallback
      console.warn('Failed to save test result to server, storing locally:', error)
      const localResults = JSON.parse(localStorage.getItem('local_test_results') || '[]')
      localResults.push({ ...result, timestamp: new Date().toISOString() })
      localStorage.setItem('local_test_results', JSON.stringify(localResults))
      return { success: true, savedLocally: true }
    }
  },

  async getTestResults() {
    try {
      return await apiRequest('/tests/results')
    } catch (error) {
      // If fetch fails, return local results
      console.warn('Failed to fetch test results from server, using local:', error)
      const localResults = JSON.parse(localStorage.getItem('local_test_results') || '[]')
      return { results: localResults, fromLocal: true }
    }
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
  },

  // Clinic Management
  async getClinicDashboard() {
    return apiRequest('/clinics/dashboard')
  },

  async getClinicPatients() {
    return apiRequest('/clinics/patients')
  },

  async assignPatientLicense(patientEmail, notes) {
    return apiRequest('/clinics/patients/assign-license', {
      method: 'POST',
      body: { patientEmail, notes }
    })
  },

  async revokePatientLicense(patientId) {
    return apiRequest('/clinics/patients/revoke-license', {
      method: 'POST',
      body: { patientId }
    })
  },

  async getPatientResults(patientId) {
    return apiRequest(`/clinics/patients/${patientId}/results`)
  },

  async getClinicLicense() {
    return apiRequest('/clinics/license')
  }
}

export default api

