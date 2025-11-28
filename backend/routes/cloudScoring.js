/**
 * Cloud Scoring Routes
 * Handles AI model inference and scoring in the cloud
 */

const express = require('express')
const { v4: uuidv4 } = require('uuid')
const db = require('../db')
const router = express.Router()

// Mock AI model for demonstration
// In production, this would connect to TensorFlow Serving, AWS SageMaker, etc.
const mockAIModel = {
  predict: (features) => {
    // Simulate AI prediction based on features
    const conditions = [
      'Healthy', 'Myopia', 'Hyperopia', 'Astigmatism', 
      'Glaucoma', 'Diabetic Retinopathy', 'Cataracts'
    ]

    // Generate realistic probabilities based on input features
    const probabilities = conditions.map((condition, index) => {
      let baseProb = Math.random() * 0.3
      
      // Add some logic based on features
      if (features.brightness < 0.3 && condition === 'Cataracts') {
        baseProb += 0.4
      }
      if (features.sharpness < 0.5 && condition === 'Myopia') {
        baseProb += 0.3
      }
      if (features.pupilSize > 0.7 && condition === 'Glaucoma') {
        baseProb += 0.2
      }
      
      return Math.min(baseProb, 1.0)
    })

    // Normalize probabilities
    const sum = probabilities.reduce((a, b) => a + b, 0)
    const normalizedProbs = probabilities.map(p => p / sum)

    return conditions.map((condition, index) => ({
      condition,
      probability: normalizedProbs[index],
      confidence: Math.random() * 0.3 + 0.7 // 0.7-1.0
    }))
  }
}

// Score eye scan features
router.post('/score', async (req, res) => {
  try {
    const {
      features,
      metadata,
      userId,
      scanId
    } = req.body

    // Validate input
    if (!features || typeof features !== 'object') {
      return res.status(400).json({ 
        message: 'Invalid features data' 
      })
    }

    // Extract relevant features for AI model
    const modelFeatures = {
      brightness: features.brightness || 0,
      sharpness: features.sharpness || 0,
      pupilSize: features.pupilSize || 0,
      leftEyeBrightness: features.leftEye?.brightness || 0,
      rightEyeBrightness: features.rightEye?.brightness || 0,
      symmetry: features.symmetry || 0,
      qualityScore: features.qualityScore || 0
    }

    // Get AI predictions
    const predictions = mockAIModel.predict(modelFeatures)

    // Calculate overall confidence
    const overallConfidence = predictions.reduce((sum, pred) => 
      sum + pred.confidence * pred.probability, 0
    )

    // Generate insights
    const insights = []
    const topPrediction = predictions.reduce((max, pred) => 
      pred.probability > max.probability ? pred : max
    )

    if (topPrediction.probability > 0.6) {
      insights.push(`High probability of ${topPrediction.condition} detected`)
    }

    if (modelFeatures.brightness < 0.3) {
      insights.push('Low brightness detected - may affect accuracy')
    }

    if (Math.abs(modelFeatures.leftEyeBrightness - modelFeatures.rightEyeBrightness) > 0.3) {
      insights.push('Significant brightness asymmetry between eyes')
    }

    const result = {
      id: uuidv4(),
      predictions: predictions.sort((a, b) => b.probability - a.probability),
      overallConfidence,
      insights,
      modelVersion: '1.0.0',
      processingTime: Math.random() * 500 + 200, // 200-700ms
      timestamp: new Date().toISOString()
    }

    // Save scoring result if userId provided
    if (userId) {
      try {
        db.prepare(`
          INSERT INTO cloud_scores (
            id, userId, scanId, features, predictions, confidence, 
            insights, modelVersion, timestamp
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          result.id,
          userId,
          scanId || null,
          JSON.stringify(modelFeatures),
          JSON.stringify(result.predictions),
          result.overallConfidence,
          JSON.stringify(result.insights),
          result.modelVersion,
          result.timestamp
        )
      } catch (dbError) {
        console.error('Failed to save cloud score:', dbError)
        // Continue without saving - don't fail the request
      }
    }

    res.json({
      success: true,
      result
    })

  } catch (error) {
    console.error('Cloud scoring error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Cloud scoring service error' 
    })
  }
})

// Get scoring history for user
router.get('/history', async (req, res) => {
  try {
    const { userId, limit = 20, offset = 0 } = req.query

    if (!userId) {
      return res.status(400).json({ message: 'userId required' })
    }

    const rows = db.prepare(`
      SELECT id, scanId, predictions, confidence, insights, 
             modelVersion, timestamp
      FROM cloud_scores 
      WHERE userId = ? 
      ORDER BY timestamp DESC 
      LIMIT ? OFFSET ?
    `).all(userId, parseInt(limit), parseInt(offset))

    const history = rows.map(row => ({
      id: row.id,
      scanId: row.scanId,
      predictions: JSON.parse(row.predictions),
      confidence: row.confidence,
      insights: JSON.parse(row.insights),
      modelVersion: row.modelVersion,
      timestamp: row.timestamp
    }))

    res.json({ history })

  } catch (error) {
    console.error('Get scoring history error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Compare on-device vs cloud predictions
router.post('/compare', async (req, res) => {
  try {
    const {
      onDevicePredictions,
      cloudPredictions,
      features
    } = req.body

    if (!onDevicePredictions || !cloudPredictions) {
      return res.status(400).json({ 
        message: 'Both on-device and cloud predictions required' 
      })
    }

    // Calculate agreement metrics
    const agreement = {
      topConditionMatch: false,
      averageProbabilityDifference: 0,
      correlationScore: 0,
      recommendations: []
    }

    // Check if top conditions match
    const onDeviceTop = onDevicePredictions[0]
    const cloudTop = cloudPredictions[0]
    agreement.topConditionMatch = onDeviceTop.condition === cloudTop.condition

    // Calculate average probability difference
    let totalDiff = 0
    let matchCount = 0

    onDevicePredictions.forEach(onDevice => {
      const cloudMatch = cloudPredictions.find(cloud => 
        cloud.condition === onDevice.condition
      )
      if (cloudMatch) {
        totalDiff += Math.abs(onDevice.probability - cloudMatch.probability)
        matchCount++
      }
    })

    agreement.averageProbabilityDifference = matchCount > 0 ? totalDiff / matchCount : 1

    // Calculate correlation score (simplified)
    agreement.correlationScore = Math.max(0, 1 - agreement.averageProbabilityDifference)

    // Generate recommendations
    if (!agreement.topConditionMatch) {
      agreement.recommendations.push('Significant disagreement between models - recommend professional consultation')
    }

    if (agreement.averageProbabilityDifference > 0.3) {
      agreement.recommendations.push('High variance in predictions - consider retaking scan with better lighting')
    }

    if (agreement.correlationScore > 0.8) {
      agreement.recommendations.push('High model agreement - results are likely reliable')
    }

    res.json({
      success: true,
      agreement,
      summary: {
        reliable: agreement.correlationScore > 0.7,
        needsReview: !agreement.topConditionMatch || agreement.averageProbabilityDifference > 0.4
      }
    })

  } catch (error) {
    console.error('Compare predictions error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Model health check
router.get('/health', (req, res) => {
  try {
    // Test the model with sample data
    const testFeatures = {
      brightness: 0.7,
      sharpness: 0.8,
      pupilSize: 0.5,
      symmetry: 0.9,
      qualityScore: 0.85
    }

    const testPredictions = mockAIModel.predict(testFeatures)
    
    res.json({
      status: 'healthy',
      modelVersion: '1.0.0',
      lastUpdate: '2024-01-01T00:00:00Z',
      testPrediction: testPredictions[0],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Model health check error:', error)
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message 
    })
  }
})

module.exports = router








