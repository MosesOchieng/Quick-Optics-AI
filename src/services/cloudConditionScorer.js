/**
 * Cloud-based condition scoring service
 * Sends anonymized feature vectors to backend for second opinion
 * Compares with on-device predictions
 */
import api from '../utils/api'

class CloudConditionScorer {
  constructor() {
    this.lastCloudScore = null
    this.lastComparison = null
  }

  /**
   * Extract anonymized feature vector from scan data
   * No PII or images - just numerical features
   */
  extractFeatureVector(scanData, cvData, faceMetrics, blinkStats) {
    return {
      // Alignment features
      alignmentScore: scanData?.alignmentScore || 0,
      horizontalBalance: cvData?.alignment?.horizontalBalance || 0,
      verticalBalance: cvData?.alignment?.verticalBalance || 0,
      
      // Visual quality
      brightness: cvData?.brightness || 0,
      sharpness: cvData?.sharpness || 0,
      eyeRegionBrightness: cvData?.eyeRegionBrightness || 0,
      
      // Behavioral patterns
      blinkRate: blinkStats?.rate || 0,
      blinkCount: blinkStats?.count || 0,
      gazeStability: scanData?.gazeStability || 0,
      
      // Face geometry (normalized, not PII)
      normalizedPupilDistance: faceMetrics ? (faceMetrics.pupilDistance / 100) : 0,
      normalizedFaceRatio: faceMetrics ? (faceMetrics.faceWidth / faceMetrics.faceHeight) : 0,
      
      // Color balance
      colorBalanceR: cvData?.colorBalance?.r || 0,
      colorBalanceG: cvData?.colorBalance?.g || 0,
      colorBalanceB: cvData?.colorBalance?.b || 0,
      
      // Timestamp for temporal analysis (not PII)
      timestamp: Date.now()
    }
  }

  /**
   * Get cloud-based condition scoring
   */
  async scoreConditions(featureVector, onDeviceProbabilities) {
    try {
      const response = await api.analyzeCVIE({
        type: 'condition_scoring',
        features: featureVector,
        onDevicePredictions: onDeviceProbabilities
      })
      
      this.lastCloudScore = response
      return response
    } catch (error) {
      console.warn('Cloud scoring failed, using on-device only:', error)
      return null
    }
  }

  /**
   * Compare cloud vs on-device predictions
   */
  comparePredictions(cloudScores, onDeviceProbs) {
    if (!cloudScores || !onDeviceProbs?.length) {
      return null
    }

    const cloudTop = cloudScores.conditions?.[0]
    const onDeviceTop = onDeviceProbs[0]

    if (!cloudTop || !onDeviceTop) return null

    const agreement = cloudTop.label === onDeviceTop.label
    const confidenceDiff = Math.abs((cloudTop.confidence || 0) - (onDeviceTop.value || 0))
    const avgConfidence = ((cloudTop.confidence || 0) + (onDeviceTop.value || 0)) / 2

    this.lastComparison = {
      agreement,
      confidenceDiff,
      avgConfidence,
      cloudTop: {
        label: cloudTop.label,
        confidence: cloudTop.confidence
      },
      onDeviceTop: {
        label: onDeviceTop.label,
        confidence: onDeviceTop.value
      },
      recommendation: agreement && confidenceDiff < 10 
        ? 'High agreement between cloud and on-device analysis'
        : 'Consider professional consultation for detailed analysis'
    }

    return this.lastComparison
  }
}

export default new CloudConditionScorer()

