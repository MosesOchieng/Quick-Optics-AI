/**
 * Clinic Routes
 * Handles clinic authentication, patient management, and license operations
 */

const express = require('express')
const router = express.Router()
const db = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const { authenticateToken } = require('../middleware/auth')

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_production'

// Helper function
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email, userType: user.userType },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// Clinic Signup
router.post('/signup', async (req, res) => {
  try {
    const { 
      clinicName, 
      email, 
      password, 
      licenseNumber, 
      address, 
      phone,
      website 
    } = req.body

    // Validate input
    if (!clinicName || !email || !password) {
      return res.status(400).json({ message: 'Clinic name, email, and password are required' })
    }

    // Check if user exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create clinic user
    const userId = uuidv4()
    const createdAt = new Date().toISOString()
    
    db.prepare(
      `INSERT INTO users (id, name, email, password, userType, verified, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(userId, clinicName, email, hashedPassword, 'clinic', 1, createdAt)

    // Create clinic record
    const clinicId = uuidv4()
    const licenseExpires = new Date()
    licenseExpires.setFullYear(licenseExpires.getFullYear() + 1) // 1 year license
    
    db.prepare(
      `INSERT INTO clinics (
        id, user_id, clinicName, licenseNumber, address, phone, website,
        licenseTier, maxPatients, licenseExpires, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      clinicId, userId, clinicName, licenseNumber || null, address || null,
      phone || null, website || null, 'basic', 50, licenseExpires.toISOString(), createdAt
    )

    const user = { 
      id: userId, 
      name: clinicName, 
      email, 
      userType: 'clinic',
      verified: 1,
      clinicId,
      clinicName
    }

    const token = generateToken(user)

    res.status(201).json({
      message: 'Clinic account created successfully',
      token,
      user
    })
  } catch (error) {
    console.error('Clinic signup error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Clinic Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Verify it's a clinic account
    if (user.userType !== 'clinic' && user.userType !== 'optometrist') {
      return res.status(403).json({ message: 'This account is not a clinic account. Please use patient login.' })
    }

    const validPassword = await bcrypt.compare(password, user.password || '')
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Get clinic details
    const clinic = db.prepare('SELECT * FROM clinics WHERE user_id = ?').get(user.id)

    const token = generateToken(user)
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        verified: user.verified,
        clinicId: clinic?.id,
        clinicName: clinic?.clinicName || user.name,
        licenseTier: clinic?.licenseTier,
        maxPatients: clinic?.maxPatients,
        activePatients: clinic?.activePatients || 0
      }
    })
  } catch (error) {
    console.error('Clinic login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get clinic dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId

    // Verify clinic account
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
    if (!user || (user.userType !== 'clinic' && user.userType !== 'optometrist')) {
      return res.status(403).json({ message: 'Access denied. Clinic account required.' })
    }

    // Get clinic info
    const clinic = db.prepare('SELECT * FROM clinics WHERE user_id = ?').get(userId)
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' })
    }

    // Get patient count
    const patientCount = db.prepare(
      'SELECT COUNT(*) as count FROM clinic_patients WHERE clinic_id = ? AND status = ?'
    ).get(clinic.id, 'active')

    // Get tests today
    const today = new Date().toISOString().split('T')[0]
    const testsToday = db.prepare(
      `SELECT COUNT(*) as count FROM test_results 
       WHERE user_id IN (
         SELECT patient_id FROM clinic_patients WHERE clinic_id = ?
       ) AND DATE(created_at) = ?`
    ).get(clinic.id, today)

    // Get recent patients
    const recentPatients = db.prepare(
      `SELECT 
        u.id, u.name, u.email,
        cp.assignedAt, cp.status,
        (SELECT MAX(created_at) FROM test_results WHERE user_id = u.id) as lastTest,
        (SELECT results_data FROM test_results WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as latestResults
       FROM clinic_patients cp
       JOIN users u ON cp.patient_id = u.id
       WHERE cp.clinic_id = ? AND cp.status = 'active'
       ORDER BY cp.assignedAt DESC
       LIMIT 10`
    ).all(clinic.id)

    // Get license info
    const licenses = db.prepare(
      'SELECT COUNT(*) as total, SUM(CASE WHEN status = "active" THEN 1 ELSE 0 END) as active FROM patient_licenses WHERE clinic_id = ?'
    ).get(clinic.id)

    res.json({
      clinic: {
        id: clinic.id,
        clinicName: clinic.clinicName,
        licenseNumber: clinic.licenseNumber,
        address: clinic.address,
        phone: clinic.phone,
        website: clinic.website,
        licenseTier: clinic.licenseTier,
        maxPatients: clinic.maxPatients,
        activePatients: patientCount?.count || 0,
        licenseExpires: clinic.licenseExpires
      },
      stats: {
        totalPatients: patientCount?.count || 0,
        testsToday: testsToday?.count || 0,
        activeLicenses: licenses?.active || 0,
        totalLicenses: licenses?.total || 0
      },
      recentPatients: recentPatients.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        lastTest: p.lastTest,
        status: p.status,
        assignedAt: p.assignedAt,
        latestResults: p.latestResults ? JSON.parse(p.latestResults) : null
      }))
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all clinic patients
router.get('/patients', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId

    // Verify clinic account
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
    if (!user || (user.userType !== 'clinic' && user.userType !== 'optometrist')) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const clinic = db.prepare('SELECT * FROM clinics WHERE user_id = ?').get(userId)
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' })
    }

    const patients = db.prepare(
      `SELECT 
        u.id, u.name, u.email, u.verified,
        cp.assignedAt, cp.status, cp.notes,
        pl.licenseCode, pl.expiresAt as licenseExpires,
        (SELECT MAX(created_at) FROM test_results WHERE user_id = u.id) as lastTest,
        (SELECT COUNT(*) FROM test_results WHERE user_id = u.id) as totalTests
       FROM clinic_patients cp
       JOIN users u ON cp.patient_id = u.id
       LEFT JOIN patient_licenses pl ON pl.patient_id = u.id AND pl.clinic_id = ?
       WHERE cp.clinic_id = ?
       ORDER BY cp.assignedAt DESC`
    ).all(clinic.id, clinic.id)

    res.json({
      patients: patients.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        verified: p.verified,
        assignedAt: p.assignedAt,
        status: p.status,
        notes: p.notes,
        licenseCode: p.licenseCode,
        licenseExpires: p.licenseExpires,
        lastTest: p.lastTest,
        totalTests: p.totalTests || 0
      }))
    })
  } catch (error) {
    console.error('Get patients error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Assign license to patient
router.post('/patients/assign-license', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const { patientEmail, notes } = req.body

    // Verify clinic account
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
    if (!user || (user.userType !== 'clinic' && user.userType !== 'optometrist')) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const clinic = db.prepare('SELECT * FROM clinics WHERE user_id = ?').get(userId)
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' })
    }

    // Check license capacity
    if (clinic.activePatients >= clinic.maxPatients) {
      return res.status(400).json({ 
        message: `License limit reached. Maximum ${clinic.maxPatients} patients allowed.` 
      })
    }

    // Find or create patient
    let patient = db.prepare('SELECT * FROM users WHERE email = ?').get(patientEmail)
    if (!patient) {
      // Create patient account
      const patientId = uuidv4()
      const createdAt = new Date().toISOString()
      db.prepare(
        `INSERT INTO users (id, name, email, userType, verified, createdAt)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(patientId, patientEmail.split('@')[0], patientEmail, 'patient', 0, createdAt)
      patient = db.prepare('SELECT * FROM users WHERE id = ?').get(patientId)
    }

    // Check if already assigned
    const existing = db.prepare(
      'SELECT * FROM clinic_patients WHERE clinic_id = ? AND patient_id = ?'
    ).get(clinic.id, patient.id)

    if (existing) {
      return res.status(400).json({ message: 'Patient already assigned to this clinic' })
    }

    // Assign patient to clinic
    const assignmentId = uuidv4()
    const assignedAt = new Date().toISOString()
    db.prepare(
      `INSERT INTO clinic_patients (id, clinic_id, patient_id, assignedBy, assignedAt, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(assignmentId, clinic.id, patient.id, userId, assignedAt, 'active', notes || null)

    // Create license
    const licenseId = uuidv4()
    const licenseCode = `LIC-${clinic.id.substring(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)
    
    db.prepare(
      `INSERT INTO patient_licenses (id, clinic_id, patient_id, licenseCode, status, assignedAt, expiresAt, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(licenseId, clinic.id, patient.id, licenseCode, 'active', assignedAt, expiresAt.toISOString(), notes || null)

    // Update clinic active patients count
    db.prepare(
      'UPDATE clinics SET activePatients = activePatients + 1 WHERE id = ?'
    ).run(clinic.id)

    res.json({
      message: 'License assigned successfully',
      license: {
        licenseCode,
        patientId: patient.id,
        patientName: patient.name,
        patientEmail: patient.email,
        expiresAt: expiresAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Assign license error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Revoke patient license
router.post('/patients/revoke-license', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const { patientId } = req.body

    // Verify clinic account
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
    if (!user || (user.userType !== 'clinic' && user.userType !== 'optometrist')) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const clinic = db.prepare('SELECT * FROM clinics WHERE user_id = ?').get(userId)
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' })
    }

    // Update patient status
    db.prepare(
      'UPDATE clinic_patients SET status = ? WHERE clinic_id = ? AND patient_id = ?'
    ).run('revoked', clinic.id, patientId)

    // Update license status
    db.prepare(
      'UPDATE patient_licenses SET status = ? WHERE clinic_id = ? AND patient_id = ?'
    ).run('revoked', clinic.id, patientId)

    // Update clinic active patients count
    db.prepare(
      'UPDATE clinics SET activePatients = GREATEST(0, activePatients - 1) WHERE id = ?'
    ).run(clinic.id)

    res.json({ message: 'License revoked successfully' })
  } catch (error) {
    console.error('Revoke license error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get patient test results
router.get('/patients/:patientId/results', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const { patientId } = req.params

    // Verify clinic account
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
    if (!user || (user.userType !== 'clinic' && user.userType !== 'optometrist')) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const clinic = db.prepare('SELECT * FROM clinics WHERE user_id = ?').get(userId)
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' })
    }

    // Verify patient belongs to clinic
    const patientCheck = db.prepare(
      'SELECT * FROM clinic_patients WHERE clinic_id = ? AND patient_id = ?'
    ).get(clinic.id, patientId)

    if (!patientCheck) {
      return res.status(403).json({ message: 'Patient not assigned to this clinic' })
    }

    // Get test results
    const results = db.prepare(
      'SELECT * FROM test_results WHERE user_id = ? ORDER BY created_at DESC'
    ).all(patientId)

    res.json({
      patientId,
      results: results.map(r => ({
        id: r.test_id,
        testType: r.test_type,
        results: JSON.parse(r.results_data),
        metadata: r.metadata ? JSON.parse(r.metadata) : null,
        createdAt: r.created_at
      }))
    })
  } catch (error) {
    console.error('Get patient results error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get clinic license info
router.get('/license', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId

    // Verify clinic account
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
    if (!user || (user.userType !== 'clinic' && user.userType !== 'optometrist')) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const clinic = db.prepare('SELECT * FROM clinics WHERE user_id = ?').get(userId)
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' })
    }

    res.json({
      license: {
        tier: clinic.licenseTier,
        maxPatients: clinic.maxPatients,
        activePatients: clinic.activePatients,
        availableSlots: clinic.maxPatients - clinic.activePatients,
        expiresAt: clinic.licenseExpires,
        isExpired: new Date(clinic.licenseExpires) < new Date()
      }
    })
  } catch (error) {
    console.error('Get license error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router

