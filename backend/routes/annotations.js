/**
 * Annotation Routes for Dataset Management
 * Handles image annotations for AI training
 */

const express = require('express')
const { v4: uuidv4 } = require('uuid')
const db = require('../db')
const router = express.Router()

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  const jwt = require('jsonwebtoken')
  const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_production'

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' })
    }
    req.user = user
    next()
  })
}

// Save annotation
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      imageId,
      imageName,
      condition,
      severity,
      confidence,
      notes,
      landmarks
    } = req.body

    // Validate required fields
    if (!imageId || !imageName || !condition) {
      return res.status(400).json({ 
        message: 'Missing required fields: imageId, imageName, condition' 
      })
    }

    const id = uuidv4()
    const timestamp = new Date().toISOString()
    const landmarksJson = JSON.stringify(landmarks || [])

    db.prepare(`
      INSERT INTO annotations (
        id, userId, imageId, imageName, condition, severity, 
        confidence, notes, landmarks, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, req.user.userId, imageId, imageName, condition, 
      severity || 'mild', confidence || 1.0, notes || '', 
      landmarksJson, timestamp
    )

    res.status(201).json({
      message: 'Annotation saved successfully',
      annotation: {
        id,
        imageId,
        imageName,
        condition,
        severity,
        confidence,
        notes,
        landmarks,
        timestamp
      }
    })
  } catch (error) {
    console.error('Save annotation error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get user's annotations
router.get('/', authenticateToken, (req, res) => {
  try {
    const { condition, limit = 50, offset = 0 } = req.query

    let query = `
      SELECT id, imageId, imageName, condition, severity, confidence, 
             notes, landmarks, timestamp 
      FROM annotations 
      WHERE userId = ?
    `
    const params = [req.user.userId]

    if (condition) {
      query += ' AND condition = ?'
      params.push(condition)
    }

    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?'
    params.push(parseInt(limit), parseInt(offset))

    const rows = db.prepare(query).all(...params)

    const annotations = rows.map(row => ({
      ...row,
      landmarks: JSON.parse(row.landmarks || '[]')
    }))

    res.json({ annotations, total: annotations.length })
  } catch (error) {
    console.error('Get annotations error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get annotation statistics
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const stats = {
      total: 0,
      byCondition: {},
      bySeverity: {},
      averageConfidence: 0
    }

    // Get total count
    const totalResult = db.prepare(
      'SELECT COUNT(*) as count FROM annotations WHERE userId = ?'
    ).get(req.user.userId)
    stats.total = totalResult.count

    if (stats.total > 0) {
      // Get condition distribution
      const conditionRows = db.prepare(`
        SELECT condition, COUNT(*) as count 
        FROM annotations 
        WHERE userId = ? 
        GROUP BY condition
      `).all(req.user.userId)

      conditionRows.forEach(row => {
        stats.byCondition[row.condition] = row.count
      })

      // Get severity distribution
      const severityRows = db.prepare(`
        SELECT severity, COUNT(*) as count 
        FROM annotations 
        WHERE userId = ? 
        GROUP BY severity
      `).all(req.user.userId)

      severityRows.forEach(row => {
        stats.bySeverity[row.severity] = row.count
      })

      // Get average confidence
      const confidenceResult = db.prepare(
        'SELECT AVG(confidence) as avgConfidence FROM annotations WHERE userId = ?'
      ).get(req.user.userId)
      stats.averageConfidence = confidenceResult.avgConfidence || 0
    }

    res.json({ stats })
  } catch (error) {
    console.error('Get annotation stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Export annotations in different formats
router.get('/export/:format', authenticateToken, (req, res) => {
  try {
    const { format } = req.params
    const { condition } = req.query

    let query = `
      SELECT id, imageId, imageName, condition, severity, confidence, 
             notes, landmarks, timestamp 
      FROM annotations 
      WHERE userId = ?
    `
    const params = [req.user.userId]

    if (condition) {
      query += ' AND condition = ?'
      params.push(condition)
    }

    query += ' ORDER BY timestamp DESC'

    const rows = db.prepare(query).all(...params)
    const annotations = rows.map(row => ({
      ...row,
      landmarks: JSON.parse(row.landmarks || '[]')
    }))

    switch (format.toLowerCase()) {
      case 'json':
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Content-Disposition', `attachment; filename="annotations_${Date.now()}.json"`)
        res.json({
          metadata: {
            exportDate: new Date().toISOString(),
            totalAnnotations: annotations.length,
            userId: req.user.userId
          },
          annotations
        })
        break

      case 'csv':
        const csvHeaders = [
          'id', 'imageId', 'imageName', 'condition', 'severity', 
          'confidence', 'notes', 'landmarkCount', 'timestamp'
        ]
        
        const csvRows = annotations.map(ann => [
          ann.id,
          ann.imageId,
          ann.imageName,
          ann.condition,
          ann.severity,
          ann.confidence,
          `"${(ann.notes || '').replace(/"/g, '""')}"`,
          ann.landmarks.length,
          ann.timestamp
        ])

        const csvContent = [
          csvHeaders.join(','),
          ...csvRows.map(row => row.join(','))
        ].join('\n')

        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', `attachment; filename="annotations_${Date.now()}.csv"`)
        res.send(csvContent)
        break

      default:
        res.status(400).json({ message: 'Unsupported export format' })
    }
  } catch (error) {
    console.error('Export annotations error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete annotation
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params

    const result = db.prepare(
      'DELETE FROM annotations WHERE id = ? AND userId = ?'
    ).run(id, req.user.userId)

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Annotation not found' })
    }

    res.json({ message: 'Annotation deleted successfully' })
  } catch (error) {
    console.error('Delete annotation error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router








