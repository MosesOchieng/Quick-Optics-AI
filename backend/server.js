/**
 * Quick Optics AI Backend Server
 * Express.js API server for authentication, data storage, and AI processing
 */

const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const db = require('./db')
require('dotenv').config()

// Import route modules
const cvieRoutes = require('./routes/cvie')
const testRoutes = require('./routes/tests')
const gameRoutes = require('./routes/games')
const annotationRoutes = require('./routes/annotations')
const cloudScoringRoutes = require('./routes/cloudScoring')
const clinicRoutes = require('./routes/clinics')

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_production'

// Middleware
app.use(cors())
app.use(express.json())

// Mount route modules
app.use('/api/cvie', cvieRoutes)
app.use('/api/tests', testRoutes)
app.use('/api/games', gameRoutes)
app.use('/api/annotations', annotationRoutes)
app.use('/api/cloud-scoring', cloudScoringRoutes)
app.use('/api/clinics', clinicRoutes)

// In-memory verification codes (email verification only)
const verificationCodes = new Map()

// Helper functions
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Check if user exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existing) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user (patient by default)
    const id = uuidv4()
    const createdAt = new Date().toISOString()
    db.prepare(
      `INSERT INTO users (id, name, email, password, userType, verified, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(id, name, email, hashedPassword, 'patient', 0, createdAt)

    const user = { id, name, email, verified: false }

    // Generate verification code
    const code = generateVerificationCode()
    verificationCodes.set(email, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    })

    // TODO: Send verification email
    console.log(`Verification code for ${email}: ${code}`)

    res.status(201).json({
      message: 'Account created. Please verify your email.',
      email
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/auth/verify', (req, res) => {
  try {
    const { email, code } = req.body

    const stored = verificationCodes.get(email)
    if (!stored || stored.code !== code) {
      return res.status(400).json({ message: 'Invalid verification code' })
    }

    if (Date.now() > stored.expiresAt) {
      verificationCodes.delete(email)
      return res.status(400).json({ message: 'Verification code expired' })
    }

    // Mark user as verified
    const userRow = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    const user = userRow
    if (user) {
      db.prepare('UPDATE users SET verified = 1 WHERE email = ?').run(email)
      verificationCodes.delete(email)

      const token = generateToken(user)
      res.json({
        message: 'Email verified successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          verified: user.verified
        }
      })
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    console.error('Verify error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/auth/resend-verification', (req, res) => {
  try {
    const { email } = req.body

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.verified) {
      return res.status(400).json({ message: 'Email already verified' })
    }

    // Generate new code
    const code = generateVerificationCode()
    verificationCodes.set(email, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000
    })

    // TODO: Send verification email
    console.log(`New verification code for ${email}: ${code}`)

    res.json({ message: 'Verification code resent' })
  } catch (error) {
    console.error('Resend error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Patient Login (separate from clinic login)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Reject clinic accounts - they should use clinic login
    if (user.userType === 'clinic' || user.userType === 'optometrist') {
      return res.status(403).json({ 
        message: 'This is a clinic account. Please use the clinic login portal.' 
      })
    }

    const validPassword = await bcrypt.compare(password, user.password || '')
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(user)
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType || 'patient',
        verified: user.verified
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' })
    }
    req.user = user
    next()
  })
}

// Test Results Routes
app.post('/api/tests/results', authenticateToken, (req, res) => {
  try {
    const id = uuidv4()
    const timestamp = new Date().toISOString()
    const data = JSON.stringify(req.body)

    db.prepare(
      `INSERT INTO test_results (id, userId, data, timestamp)
       VALUES (?, ?, ?, ?)`
    ).run(id, req.user.userId, data, timestamp)

    res.status(201).json({
      message: 'Test result saved',
      result: { id, userId: req.user.userId, ...req.body, timestamp }
    })
  } catch (error) {
    console.error('Save test error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

app.get('/api/tests/results', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT id, data, timestamp FROM test_results WHERE userId = ? ORDER BY timestamp DESC'
    ).all(req.user.userId)

    const results = rows.map(r => ({
      id: r.id,
      ...JSON.parse(r.data),
      timestamp: r.timestamp
    }))

    res.json({ results })
  } catch (error) {
    console.error('Get tests error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Game Results Routes
app.post('/api/games/results', authenticateToken, (req, res) => {
  try {
    const id = uuidv4()
    const timestamp = new Date().toISOString()
    const data = JSON.stringify(req.body)

    db.prepare(
      `INSERT INTO game_results (id, userId, data, timestamp)
       VALUES (?, ?, ?, ?)`
    ).run(id, req.user.userId, data, timestamp)

    res.status(201).json({
      message: 'Game result saved',
      result: { id, userId: req.user.userId, ...req.body, timestamp }
    })
  } catch (error) {
    console.error('Save game error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

app.get('/api/games/results', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT id, data, timestamp FROM game_results WHERE userId = ? ORDER BY timestamp DESC'
    ).all(req.user.userId)

    const results = rows.map(r => ({
      id: r.id,
      ...JSON.parse(r.data),
      timestamp: r.timestamp
    }))

    res.json({ results })
  } catch (error) {
    console.error('Get games error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Payment Routes
app.post('/api/payment/initiate', (req, res) => {
  try {
    const { plan, method, amount, testResults } = req.body

    // Generate transaction ID
    const transactionId = uuidv4()
    
    // Simulate payment initiation
    // In production, integrate with M-Pesa API or Paystack API
    const paymentData = {
      transactionId,
      method,
      amount,
      plan,
      status: 'pending',
      instructions: method === 'mpesa' 
        ? 'Check your phone for M-Pesa prompt. Enter PIN to complete payment.'
        : 'You will be redirected to Paystack payment page.',
      timestamp: new Date().toISOString()
    }

    res.json({
      success: true,
      transactionId,
      paymentData
    })
  } catch (error) {
    console.error('Payment initiation error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/payment/verify', (req, res) => {
  try {
    const { email, paymentCode, paymentMethod, amount } = req.body

    // In production, verify with M-Pesa/Paystack API
    // For now, accept any code that matches format
    if (!paymentCode || paymentCode.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid payment code format' 
      })
    }

    // Check if user already exists
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    let userId
    let user

    if (existing) {
      userId = existing.id
      db.prepare(
        'UPDATE users SET verified = 1, paymentConfirmed = 1, paymentMethod = ? WHERE email = ?'
      ).run(paymentMethod, email)
      user = { id: existing.id, email: existing.email, verified: 1 }
    } else {
      userId = uuidv4()
      const createdAt = new Date().toISOString()
      db.prepare(
        `INSERT INTO users (id, email, verified, paymentConfirmed, paymentMethod, createdAt)
         VALUES (?, ?, 1, 1, ?, ?)`
      ).run(userId, email, paymentMethod, createdAt)
      user = { id: userId, email, verified: 1 }
    }

    // Record payment
    const paymentId = uuidv4()
    const createdAt = new Date().toISOString()
    db.prepare(
      `INSERT INTO payments (
        id, userId, email, transactionId, method, amount, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(paymentId, userId, email, `PAY-${Date.now()}`, paymentMethod, amount, 'confirmed', createdAt)

    res.json({
      success: true,
      message: 'Payment verified and account activated',
      user: {
        id: user.id,
        email: user.email,
        verified: user.verified
      }
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// OTP Auth Routes
app.post('/api/auth/request-otp', (req, res) => {
  try {
    const { email } = req.body

    // Check if user exists and has paid
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user || !user.paymentConfirmed) {
      return res.status(400).json({ 
        message: 'No account found. Please complete payment first.' 
      })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store OTP with expiration
    const otpExpires = Date.now() + 10 * 60 * 1000 // 10 minutes
    db.prepare(
      'UPDATE users SET otp = ?, otpExpires = ? WHERE email = ?'
    ).run(otp, otpExpires, email)

    // TODO: Send OTP via email/SMS
    console.log(`OTP for ${email}: ${otp}`)

    res.json({
      success: true,
      message: 'OTP sent to your email'
    })
  } catch (error) {
    console.error('OTP request error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/auth/login-otp', (req, res) => {
  try {
    const { email, otp } = req.body

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(401).json({ message: 'Invalid OTP code' })
    }

    if (Date.now() > user.otpExpires) {
      return res.status(401).json({ message: 'OTP expired. Please request a new one.' })
    }

    // Clear OTP
    db.prepare('UPDATE users SET otp = NULL, otpExpires = NULL WHERE email = ?').run(email)

    const token = generateToken(user)
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        verified: user.verified
      }
    })
  } catch (error) {
    console.error('OTP login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// CVIE routes are now handled by separate route modules

// Current user (session) route
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, verified, paymentConfirmed, paymentMethod FROM users WHERE id = ?').get(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({ user })
  } catch (error) {
    console.error('Me error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Mobile session tracking
app.post('/api/mobile/session', (req, res) => {
  try {
    const {
      userId,
      deviceInfo,
      speechSupported
    } = req.body

    const sessionId = uuidv4()
    const timestamp = new Date().toISOString()
    const userAgent = req.headers['user-agent'] || ''

    db.prepare(`
      INSERT INTO mobile_sessions (
        id, userId, deviceInfo, userAgent, speechSupported, 
        lastActivity, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      sessionId,
      userId || null,
      JSON.stringify(deviceInfo || {}),
      userAgent,
      speechSupported ? 1 : 0,
      timestamp,
      timestamp
    )

    res.json({
      success: true,
      sessionId,
      message: 'Mobile session created'
    })
  } catch (error) {
    console.error('Mobile session error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update mobile session activity
app.put('/api/mobile/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params
    const { speechSupported, lastError } = req.body
    const timestamp = new Date().toISOString()

    const updates = ['lastActivity = ?']
    const params = [timestamp]

    if (typeof speechSupported === 'boolean') {
      updates.push('speechSupported = ?')
      params.push(speechSupported ? 1 : 0)
    }

    params.push(sessionId)

    const result = db.prepare(`
      UPDATE mobile_sessions 
      SET ${updates.join(', ')} 
      WHERE id = ?
    `).run(...params)

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Session not found' })
    }

    res.json({
      success: true,
      message: 'Session updated'
    })
  } catch (error) {
    console.error('Update mobile session error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get mobile session analytics
app.get('/api/mobile/analytics', (req, res) => {
  try {
    const stats = {}

    // Total sessions
    const totalSessions = db.prepare(
      'SELECT COUNT(*) as count FROM mobile_sessions'
    ).get()
    stats.totalSessions = totalSessions.count

    // Speech support stats
    const speechStats = db.prepare(`
      SELECT 
        speechSupported,
        COUNT(*) as count
      FROM mobile_sessions 
      GROUP BY speechSupported
    `).all()

    stats.speechSupport = {
      supported: 0,
      notSupported: 0
    }

    speechStats.forEach(stat => {
      if (stat.speechSupported === 1) {
        stats.speechSupport.supported = stat.count
      } else {
        stats.speechSupport.notSupported = stat.count
      }
    })

    // Device type distribution (simplified)
    const deviceStats = db.prepare(`
      SELECT 
        CASE 
          WHEN userAgent LIKE '%iPhone%' OR userAgent LIKE '%iPad%' THEN 'iOS'
          WHEN userAgent LIKE '%Android%' THEN 'Android'
          ELSE 'Other'
        END as deviceType,
        COUNT(*) as count
      FROM mobile_sessions 
      GROUP BY deviceType
    `).all()

    stats.deviceTypes = {}
    deviceStats.forEach(stat => {
      stats.deviceTypes[stat.deviceType] = stat.count
    })

    res.json({ stats })
  } catch (error) {
    console.error('Mobile analytics error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    features: {
      annotations: true,
      cloudScoring: true,
      mobileSupport: true,
      speechTracking: true
    }
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Quick Optics AI Backend running on port ${PORT}`)
  console.log(`📡 API available at http://localhost:${PORT}/api`)
})

