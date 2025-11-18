/**
 * Micro-expressions and fatigue detection service
 * Analyzes blinking patterns and iris dilation for fatigue/dryness
 */
class FatigueDetector {
  constructor() {
    this.blinkHistory = []
    this.irisSizeHistory = []
    this.fatigueScore = 0
  }

  /**
   * Record blink event
   */
  recordBlink(timestamp = Date.now()) {
    this.blinkHistory.push(timestamp)
    
    // Keep only last 5 minutes
    const cutoff = timestamp - (5 * 60 * 1000)
    this.blinkHistory = this.blinkHistory.filter(t => t >= cutoff)
  }

  /**
   * Record iris size (normalized 0-1)
   */
  recordIrisSize(size, timestamp = Date.now()) {
    this.irisSizeHistory.push({ size, timestamp })
    
    // Keep only last 2 minutes
    const cutoff = timestamp - (2 * 60 * 1000)
    this.irisSizeHistory = this.irisSizeHistory.filter(d => d.timestamp >= cutoff)
  }

  /**
   * Calculate blink rate (blinks per minute)
   */
  getBlinkRate() {
    if (this.blinkHistory.length < 2) return 0
    
    const timeSpan = this.blinkHistory[this.blinkHistory.length - 1] - this.blinkHistory[0]
    if (timeSpan === 0) return 0
    
    const minutes = timeSpan / (60 * 1000)
    return this.blinkHistory.length / minutes
  }

  /**
   * Analyze blink pattern for fatigue indicators
   */
  analyzeBlinkPattern() {
    if (this.blinkHistory.length < 3) return null

    const blinkRate = this.getBlinkRate()
    
    // Normal blink rate: 15-20 blinks per minute
    // Low (< 10): possible fatigue/dryness
    // High (> 30): possible irritation
    let status = 'normal'
    let score = 0

    if (blinkRate < 10) {
      status = 'low'
      score = 30 // Fatigue indicator
    } else if (blinkRate > 30) {
      status = 'high'
      score = 20 // Irritation indicator
    } else {
      status = 'normal'
      score = 0
    }

    // Check for irregular intervals (sign of fatigue)
    const intervals = []
    for (let i = 1; i < this.blinkHistory.length; i++) {
      intervals.push(this.blinkHistory[i] - this.blinkHistory[i - 1])
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const variance = intervals.reduce((sum, interval) => {
      return sum + Math.pow(interval - avgInterval, 2)
    }, 0) / intervals.length

    // High variance = irregular pattern = fatigue
    if (variance > Math.pow(avgInterval, 2) * 0.5) {
      score += 20
      status = 'irregular'
    }

    return {
      blinkRate: blinkRate.toFixed(1),
      status,
      fatigueScore: Math.min(100, score),
      recommendation: this.getRecommendation(status, score)
    }
  }

  /**
   * Analyze iris dilation for fatigue
   */
  analyzeIrisDilation() {
    if (this.irisSizeHistory.length < 5) return null

    const recent = this.irisSizeHistory.slice(-10)
    const avgSize = recent.reduce((sum, d) => sum + d.size, 0) / recent.length

    // Smaller iris = more dilated = possible fatigue
    // Normal range: 0.4-0.6
    let status = 'normal'
    let score = 0

    if (avgSize < 0.3) {
      status = 'dilated'
      score = 25 // Fatigue indicator
    } else if (avgSize > 0.7) {
      status = 'constricted'
      score = 15 // Possible light sensitivity
    }

    return {
      avgIrisSize: avgSize.toFixed(2),
      status,
      fatigueScore: score
    }
  }

  /**
   * Get overall fatigue assessment
   */
  getFatigueAssessment() {
    const blinkAnalysis = this.analyzeBlinkPattern()
    const irisAnalysis = this.analyzeIrisDilation()

    if (!blinkAnalysis && !irisAnalysis) return null

    const blinkScore = blinkAnalysis?.fatigueScore || 0
    const irisScore = irisAnalysis?.fatigueScore || 0
    this.fatigueScore = Math.min(100, (blinkScore + irisScore) / 2)

    let level = 'none'
    if (this.fatigueScore > 60) level = 'high'
    else if (this.fatigueScore > 30) level = 'moderate'
    else if (this.fatigueScore > 10) level = 'low'

    return {
      overallScore: this.fatigueScore.toFixed(0),
      level,
      blinkAnalysis,
      irisAnalysis,
      recommendations: this.getRecommendations(level, blinkAnalysis, irisAnalysis)
    }
  }

  /**
   * Get recommendations based on fatigue level
   */
  getRecommendations(level, blinkAnalysis, irisAnalysis) {
    const recommendations = []

    if (level === 'high') {
      recommendations.push({
        type: 'hydration',
        message: 'Consider taking a break and hydrating. Your eyes may be dry.',
        priority: 'high'
      })
      recommendations.push({
        type: 'screen_break',
        message: 'Take a 20-minute screen break. Follow the 20-20-20 rule.',
        priority: 'high'
      })
    } else if (level === 'moderate') {
      recommendations.push({
        type: 'hydration',
        message: 'Stay hydrated. Consider using eye drops if needed.',
        priority: 'medium'
      })
    }

    if (blinkAnalysis?.status === 'low') {
      recommendations.push({
        type: 'blink_reminder',
        message: 'Remember to blink regularly to keep your eyes moist.',
        priority: 'low'
      })
    }

    return recommendations
  }

  getRecommendation(status, score) {
    if (status === 'low' || score > 30) {
      return 'Low blink rate detected. Consider taking a break and hydrating.'
    } else if (status === 'irregular') {
      return 'Irregular blink pattern detected. Your eyes may be tired.'
    }
    return 'Blink pattern looks healthy.'
  }

  /**
   * Reset for new scan
   */
  reset() {
    this.blinkHistory = []
    this.irisSizeHistory = []
    this.fatigueScore = 0
  }
}

export default new FatigueDetector()

