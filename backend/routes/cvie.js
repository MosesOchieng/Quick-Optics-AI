/**
 * CVIE (Computer Vision Intelligence Engine) Routes
 * Handles AI analysis, condition scoring, and pattern matching
 */

const express = require('express')
const router = express.Router()
const db = require('../db')
const { optionalAuth, authenticateToken } = require('../middleware/auth')

// CVIE Analysis endpoint
router.post('/analyze', optionalAuth, async (req, res) => {
  try {
    const { 
      eyeData, 
      computerVisionMetrics, 
      userBaseline, 
      sessionId 
    } = req.body

    // Simulate AI analysis processing
    const analysisResult = {
      conditionProbabilities: [
        { condition: 'Healthy', probability: 0.85, confidence: 0.92 },
        { condition: 'Myopia', probability: 0.12, confidence: 0.78 },
        { condition: 'Astigmatism', probability: 0.08, confidence: 0.65 },
        { condition: 'Hyperopia', probability: 0.05, confidence: 0.58 }
      ],
      qualityScore: calculateQualityScore(computerVisionMetrics),
      riskFactors: identifyRiskFactors(eyeData),
      recommendations: generateRecommendations(eyeData),
      analysisId: `cvie_${Date.now()}`,
      timestamp: new Date().toISOString()
    }

    // Store analysis result
    if (sessionId) {
      try {
        db.prepare(`
          INSERT INTO cvie_analyses (session_id, analysis_data, created_at)
          VALUES (?, ?, datetime('now'))
        `).run(sessionId, JSON.stringify(analysisResult))
      } catch (dbError) {
        console.warn('Failed to store CVIE analysis:', dbError)
      }
    }

    res.json({
      success: true,
      analysis: analysisResult
    })

  } catch (error) {
    console.error('CVIE analysis error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Analysis processing failed',
      error: error.message 
    })
  }
})

// Cloud condition scoring endpoint
router.post('/condition-score', optionalAuth, async (req, res) => {
  try {
    const { featureVector, metadata } = req.body

    // Simulate cloud-based condition scoring
    const cloudScore = {
      predictions: {
        'Healthy': Math.random() * 0.4 + 0.6, // 0.6-1.0
        'Myopia': Math.random() * 0.3 + 0.1,  // 0.1-0.4
        'Glaucoma': Math.random() * 0.2,       // 0.0-0.2
        'Diabetic Retinopathy': Math.random() * 0.15,
        'Cataracts': Math.random() * 0.1
      },
      confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
      modelVersion: '2.1.0',
      processingTime: Math.random() * 200 + 50, // 50-250ms
      timestamp: new Date().toISOString()
    }

    // Normalize predictions to sum to 1
    const total = Object.values(cloudScore.predictions).reduce((sum, val) => sum + val, 0)
    Object.keys(cloudScore.predictions).forEach(key => {
      cloudScore.predictions[key] /= total
    })

    res.json({
      success: true,
      cloudScore
    })

  } catch (error) {
    console.error('Cloud condition scoring error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Cloud scoring failed',
      error: error.message 
    })
  }
})

// Get analysis history
router.get('/history/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params
    const { limit = 10 } = req.query

    const analyses = db.prepare(`
      SELECT * FROM cvie_analyses 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(userId, parseInt(limit))

    const parsedAnalyses = analyses.map(analysis => ({
      ...analysis,
      analysis_data: JSON.parse(analysis.analysis_data)
    }))

    res.json({
      success: true,
      analyses: parsedAnalyses
    })

  } catch (error) {
    console.error('CVIE history error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analysis history',
      error: error.message 
    })
  }
})

// Helper functions
function calculateQualityScore(metrics) {
  if (!metrics) return 0.5

  const {
    brightness = 0.5,
    sharpness = 0.5,
    alignment = { horizontalBalance: 0.1, verticalBalance: 0.1 }
  } = metrics

  // Calculate composite quality score
  const brightnessScore = Math.max(0, 1 - Math.abs(brightness - 0.6) * 2)
  const sharpnessScore = Math.min(sharpness * 2, 1)
  const alignmentScore = Math.max(0, 1 - (alignment.horizontalBalance + alignment.verticalBalance))

  return (brightnessScore * 0.4 + sharpnessScore * 0.4 + alignmentScore * 0.2)
}

function identifyRiskFactors(eyeData) {
  const riskFactors = []

  if (eyeData?.blinkRate && eyeData.blinkRate < 10) {
    riskFactors.push({
      factor: 'Low blink rate',
      severity: 'medium',
      description: 'May indicate dry eyes or screen fatigue'
    })
  }

  if (eyeData?.pupilAsymmetry && eyeData.pupilAsymmetry > 0.3) {
    riskFactors.push({
      factor: 'Pupil asymmetry',
      severity: 'high',
      description: 'Significant difference between left and right pupil size'
    })
  }

  if (eyeData?.lightSensitivity && eyeData.lightSensitivity > 0.8) {
    riskFactors.push({
      factor: 'High light sensitivity',
      severity: 'low',
      description: 'May indicate photophobia or migraine tendency'
    })
  }

  return riskFactors
}

function generateRecommendations(eyeData) {
  const recommendations = []

  recommendations.push({
    category: 'General',
    text: 'Schedule regular eye exams with an optometrist',
    priority: 'medium'
  })

  if (eyeData?.screenTime && eyeData.screenTime > 8) {
    recommendations.push({
      category: 'Digital Wellness',
      text: 'Follow the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds',
      priority: 'high'
    })
  }

  recommendations.push({
    category: 'Nutrition',
    text: 'Include omega-3 fatty acids and antioxidants in your diet',
    priority: 'low'
  })

  return recommendations
}

module.exports = router
