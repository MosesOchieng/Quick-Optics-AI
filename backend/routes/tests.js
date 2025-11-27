/**
 * Test Results Routes
 * Handles saving and retrieving eye test results
 */

const express = require('express')
const router = express.Router()
const db = require('../db')

// Save test result
router.post('/results', async (req, res) => {
  try {
    const {
      testType,
      results,
      metadata,
      userId,
      sessionId
    } = req.body

    // Validate required fields
    if (!testType || !results) {
      return res.status(400).json({
        success: false,
        message: 'Test type and results are required'
      })
    }

    const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Store test result
    const stmt = db.prepare(`
      INSERT INTO test_results (
        test_id, user_id, session_id, test_type, 
        results_data, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `)

    stmt.run(
      testId,
      userId || null,
      sessionId || null,
      testType,
      JSON.stringify(results),
      JSON.stringify(metadata || {})
    )

    res.json({
      success: true,
      testId,
      message: 'Test result saved successfully'
    })

  } catch (error) {
    console.error('Save test result error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to save test result',
      error: error.message
    })
  }
})

// Get test results
router.get('/results', async (req, res) => {
  try {
    const { userId, testType, limit = 50 } = req.query

    let query = `
      SELECT * FROM test_results 
      WHERE 1=1
    `
    const params = []

    if (userId) {
      query += ` AND user_id = ?`
      params.push(userId)
    }

    if (testType) {
      query += ` AND test_type = ?`
      params.push(testType)
    }

    query += ` ORDER BY created_at DESC LIMIT ?`
    params.push(parseInt(limit))

    const results = db.prepare(query).all(...params)

    const parsedResults = results.map(result => ({
      ...result,
      results_data: JSON.parse(result.results_data),
      metadata: JSON.parse(result.metadata || '{}')
    }))

    res.json({
      success: true,
      results: parsedResults
    })

  } catch (error) {
    console.error('Get test results error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test results',
      error: error.message
    })
  }
})

// Get test statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const stats = {
      totalTests: 0,
      testsByType: {},
      recentActivity: [],
      trends: {}
    }

    // Get total tests
    const totalResult = db.prepare(`
      SELECT COUNT(*) as count FROM test_results WHERE user_id = ?
    `).get(userId)
    stats.totalTests = totalResult.count

    // Get tests by type
    const typeResults = db.prepare(`
      SELECT test_type, COUNT(*) as count 
      FROM test_results 
      WHERE user_id = ? 
      GROUP BY test_type
    `).all(userId)
    
    typeResults.forEach(row => {
      stats.testsByType[row.test_type] = row.count
    })

    // Get recent activity (last 30 days)
    const recentResults = db.prepare(`
      SELECT test_type, created_at 
      FROM test_results 
      WHERE user_id = ? 
        AND created_at >= datetime('now', '-30 days')
      ORDER BY created_at DESC
      LIMIT 10
    `).all(userId)
    stats.recentActivity = recentResults

    // Calculate trends (simplified)
    const trendResults = db.prepare(`
      SELECT 
        test_type,
        COUNT(*) as count,
        DATE(created_at) as test_date
      FROM test_results 
      WHERE user_id = ? 
        AND created_at >= datetime('now', '-7 days')
      GROUP BY test_type, DATE(created_at)
      ORDER BY test_date DESC
    `).all(userId)

    // Process trends
    const trendsByType = {}
    trendResults.forEach(row => {
      if (!trendsByType[row.test_type]) {
        trendsByType[row.test_type] = []
      }
      trendsByType[row.test_type].push({
        date: row.test_date,
        count: row.count
      })
    })
    stats.trends = trendsByType

    res.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Get test stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test statistics',
      error: error.message
    })
  }
})

// Delete test result
router.delete('/results/:testId', async (req, res) => {
  try {
    const { testId } = req.params
    const { userId } = req.query // For authorization

    const stmt = db.prepare(`
      DELETE FROM test_results 
      WHERE test_id = ? AND (user_id = ? OR user_id IS NULL)
    `)
    
    const result = stmt.run(testId, userId)

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Test result not found or unauthorized'
      })
    }

    res.json({
      success: true,
      message: 'Test result deleted successfully'
    })

  } catch (error) {
    console.error('Delete test result error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete test result',
      error: error.message
    })
  }
})

module.exports = router
