/**
 * Comparative Vision Intelligence Engine (CVIE)
 * Core AI system for vision analysis and pattern detection
 */

import conditionMatcher from './conditionMatcher'

// Population benchmarks (simulated - in production, these would come from ML models)
const POPULATION_BENCHMARKS = {
  ageGroups: {
    '18-25': { avgReactionTime: 280, avgFocusScore: 85, avgStability: 88 },
    '26-35': { avgReactionTime: 300, avgFocusScore: 82, avgStability: 85 },
    '36-45': { avgReactionTime: 320, avgFocusScore: 78, avgStability: 82 },
    '46-55': { avgReactionTime: 350, avgFocusScore: 75, avgStability: 78 },
    '56+': { avgReactionTime: 380, avgFocusScore: 72, avgStability: 75 }
  },
  deviceTypes: {
    'high-end': { qualityMultiplier: 1.0 },
    'mid-range': { qualityMultiplier: 0.95 },
    'low-end': { qualityMultiplier: 0.90 }
  }
}

class CVIE {
  constructor() {
    this.userBaseline = null
    this.patternHistory = []
    this.adaptiveDifficulty = {}
    this.conditionMatches = null
  }

  /**
   * 1. Baseline Modelling AI
   * Builds personal visual baseline from user data
   */
  buildBaseline(userData) {
    const {
      focusSpeed,
      blinkPattern,
      gazeStability,
      lightAdaptation,
      headMovement,
      reactionTimes
    } = userData

    // Gaussian Mixture Model simulation for pattern detection
    const focusPattern = this.detectFocusPattern(focusSpeed, reactionTimes)
    const blinkModel = this.modelBlinkPattern(blinkPattern)
    const stabilityModel = this.calculateStability(gazeStability, headMovement)

    this.userBaseline = {
      focusIndex: this.calculateFocusIndex(focusPattern),
      lightSensitivityIndex: this.calculateLightSensitivity(lightAdaptation),
      stabilityScore: stabilityModel.score,
      clarityConfidence: this.calculateClarityConfidence(userData),
      blinkRate: blinkModel.avgRate,
      reactionTimeCurve: this.fitReactionCurve(reactionTimes),
      timestamp: new Date().toISOString()
    }

    return this.userBaseline
  }

  /**
   * 2. AI Comparison Layer
   * Compares user performance to benchmarks and past performance
   */
  comparePerformance(currentData, userAge = 30, deviceType = 'mid-range') {
    const comparisons = {
      population: this.compareToPopulation(currentData, userAge, deviceType),
      personal: this.compareToPersonalHistory(currentData),
      expected: this.compareToExpectedBehavior(currentData)
    }

    // Calculate composite scores
    const focusIndex = this.calculateFocusIndex(currentData)
    const lightSensitivityIndex = this.calculateLightSensitivity(currentData.lightAdaptation)
    const stabilityScore = this.calculateStability(currentData.gazeStability, currentData.headMovement).score
    const clarityConfidence = this.calculateClarityConfidence(currentData)

    return {
      comparisons,
      scores: {
        focusIndex,
        lightSensitivityIndex,
        stabilityScore,
        clarityConfidence
      },
      insights: this.generateInsights(comparisons, currentData)
    }
  }

  /**
   * Compare to population-level benchmarks
   */
  compareToPopulation(data, age, deviceType) {
    const ageGroup = this.getAgeGroup(age)
    const benchmark = POPULATION_BENCHMARKS.ageGroups[ageGroup]
    const deviceBenchmark = POPULATION_BENCHMARKS.deviceTypes[deviceType]

    const reactionTime = data.reactionTime || data.avgReactionTime || 300
    const focusScore = data.focusScore || 80
    const stability = data.stability || 85

    return {
      ageGroup,
      reactionTimePercentile: this.calculatePercentile(reactionTime, benchmark.avgReactionTime),
      focusPercentile: this.calculatePercentile(focusScore, benchmark.avgFocusScore),
      stabilityPercentile: this.calculatePercentile(stability, benchmark.avgStability),
      deviceAdjustment: deviceBenchmark.qualityMultiplier,
      comparison: {
        betterThan: this.getBetterThan(reactionTime, benchmark.avgReactionTime),
        performance: this.getPerformanceLevel(reactionTime, benchmark.avgReactionTime)
      }
    }
  }

  /**
   * Compare to user's own past performance
   */
  compareToPersonalHistory(currentData) {
    if (!this.userBaseline || this.patternHistory.length === 0) {
      return {
        hasHistory: false,
        message: 'First test - baseline established'
      }
    }

    const improvements = {
      eyeStability: this.compareValue(currentData.stability, this.userBaseline.stabilityScore),
      colorSensitivity: this.compareValue(currentData.colorScore, this.userBaseline.colorSensitivity),
      blinkPattern: this.compareBlinkPattern(currentData.blinkPattern, this.userBaseline.blinkRate),
      reactionTime: this.compareReactionTime(currentData.reactionTime, this.userBaseline.reactionTimeCurve)
    }

    return {
      hasHistory: true,
      improvements,
      trend: this.calculateTrend(this.patternHistory, currentData),
      message: this.generateTrendMessage(improvements)
    }
  }

  /**
   * Compare to expected optical behavior datasets
   */
  compareToExpectedBehavior(data) {
    // Simulated comparison to validated datasets
    const expectedPatterns = {
      gazeCapture: this.compareToGazeCapture(data.gazePattern),
      colorPerception: this.compareToColorDatasets(data.colorResponses),
      motionResponse: this.compareToMotionDatasets(data.motionReactions)
    }

    return {
      patterns: expectedPatterns,
      deviation: this.calculateDeviation(expectedPatterns),
      confidence: this.calculatePatternConfidence(expectedPatterns)
    }
  }

  /**
   * 3. Pattern Analysis Engine
   * Analyzes micro-movements, blink cycles, and gaze paths
   */
  analyzePatterns(eyeData) {
    const analysis = {
      microMovements: this.detectMicroMovements(eyeData.movements),
      blinkCycle: this.analyzeBlinkCycle(eyeData.blinks),
      gazePath: this.analyzeGazePath(eyeData.gazePoints),
      attention: this.estimateAttention(eyeData),
      fatigue: this.estimateFatigue(eyeData),
      stress: this.estimateStress(eyeData)
    }

    return {
      ...analysis,
      overallHealth: this.calculateOverallHealth(analysis)
    }
  }

  /**
   * Micro-movement detection (micro-saccades)
   */
  detectMicroMovements(movements) {
    if (!movements || movements.length === 0) return null

    const microSaccades = movements.filter(m => m.amplitude < 0.5 && m.duration < 50)
    const macroSaccades = movements.filter(m => m.amplitude >= 0.5)

    return {
      microSaccadeRate: microSaccades.length / movements.length,
      macroSaccadeRate: macroSaccades.length / movements.length,
      attentionLevel: this.interpretAttention(microSaccades.length),
      fatigueLevel: this.interpretFatigue(macroSaccades.length),
      focusDifficulty: this.interpretFocusDifficulty(microSaccades, macroSaccades)
    }
  }

  /**
   * Blink cycle analysis
   */
  analyzeBlinkCycle(blinks) {
    if (!blinks || blinks.length < 3) return null

    const intervals = []
    for (let i = 1; i < blinks.length; i++) {
      intervals.push(blinks[i].timestamp - blinks[i - 1].timestamp)
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const variance = this.calculateVariance(intervals)

    return {
      avgInterval,
      variance,
      rate: 60000 / avgInterval, // blinks per minute
      pattern: this.classifyBlinkPattern(avgInterval, variance),
      health: this.assessBlinkHealth(avgInterval, variance)
    }
  }

  /**
   * Gaze path analysis
   */
  analyzeGazePath(gazePoints) {
    if (!gazePoints || gazePoints.length < 2) return null

    const smoothness = this.calculateSmoothness(gazePoints)
    const jumps = this.detectJumps(gazePoints)
    const fixationPoints = this.detectFixations(gazePoints)

    return {
      smoothness,
      jumpCount: jumps.length,
      fixationCount: fixationPoints.length,
      trackingQuality: this.assessTrackingQuality(smoothness, jumps.length),
      interpretation: this.interpretGazePath(smoothness, jumps, fixationPoints)
    }
  }

  /**
   * 4. Adaptive AI for Mini-Games
   * Adjusts difficulty based on performance
   */
  adaptDifficulty(gameId, performance) {
    if (!this.adaptiveDifficulty[gameId]) {
      this.adaptiveDifficulty[gameId] = { base: 1.0, history: [] }
    }

    const history = this.adaptiveDifficulty[gameId].history
    history.push(performance)

    // Calculate accuracy
    const recentAccuracy = history.slice(-5).filter(p => p.correct).length / Math.min(5, history.length)
    
    // Adjust difficulty
    let newDifficulty = this.adaptiveDifficulty[gameId].base
    
    if (recentAccuracy > 0.8 && history.length >= 3) {
      // Too easy - increase difficulty
      newDifficulty = Math.min(newDifficulty * 1.15, 3.0)
    } else if (recentAccuracy < 0.5 && history.length >= 3) {
      // Too hard - decrease difficulty
      newDifficulty = Math.max(newDifficulty * 0.85, 0.5)
    }

    this.adaptiveDifficulty[gameId].base = newDifficulty

    return {
      difficulty: newDifficulty,
      reason: this.getDifficultyReason(recentAccuracy, history.length),
      recommendation: this.getDifficultyRecommendation(newDifficulty)
    }
  }

  /**
   * 5. AI Confidence Scoring
   */
  calculateConfidence(data) {
    const factors = {
      imageQuality: this.assessImageQuality(data.imageData),
      movementSpeed: this.assessMovementSpeed(data.movements),
      lightingConsistency: this.assessLighting(data.lighting),
      eyeCentering: this.assessEyeCentering(data.eyePosition),
      dataCompleteness: this.assessDataCompleteness(data)
    }

    const confidence = this.computeConfidenceScore(factors)

    return {
      score: confidence,
      level: this.getConfidenceLevel(confidence),
      factors,
      recommendations: this.getConfidenceRecommendations(factors, confidence)
    }
  }

  /**
   * 8. Image-based condition comparison
   * Uses precomputed embeddings from /original-data-sets to find closest matches
   * for a captured pupil/eye snapshot (data URL string).
   */
  async compareEyeImage(dataUrl) {
    const result = await conditionMatcher.matchUserSnapshot(dataUrl)
    this.conditionMatches = result.matches
    return result
  }

  /**
   * 7. Real-Time AI Feedback Loop
   */
  provideRealTimeFeedback(scanData) {
    const feedback = {
      alignment: this.checkAlignment(scanData.eyePosition),
      lighting: this.checkLighting(scanData.lighting),
      stability: this.checkStability(scanData.movements),
      exposure: this.checkExposure(scanData.imageData),
      adjustments: []
    }

    // Generate adjustment recommendations
    if (!feedback.alignment.optimal) {
      feedback.adjustments.push({
        type: 'alignment',
        message: feedback.alignment.message,
        action: 'adjustFrame'
      })
    }

    if (!feedback.lighting.optimal) {
      feedback.adjustments.push({
        type: 'lighting',
        message: feedback.lighting.message,
        action: 'adjustExposure'
      })
    }

    if (!feedback.stability.optimal) {
      feedback.adjustments.push({
        type: 'stability',
        message: feedback.stability.message,
        action: 'holdStill'
      })
    }

    return feedback
  }

  // Helper methods
  detectFocusPattern(focusSpeed, reactionTimes) {
    const avgSpeed = focusSpeed || 0.5
    const avgReaction = reactionTimes?.reduce((a, b) => a + b, 0) / reactionTimes.length || 300
    return { avgSpeed, avgReaction, consistency: this.calculateConsistency(reactionTimes) }
  }

  modelBlinkPattern(blinks) {
    if (!blinks || blinks.length === 0) return { avgRate: 15, pattern: 'normal' }
    const intervals = blinks.map((b, i) => i > 0 ? b - blinks[i - 1] : 0).filter(i => i > 0)
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    return { avgRate: 60000 / avgInterval, pattern: this.classifyBlinkPattern(avgInterval, 0) }
  }

  calculateStability(gazeStability, headMovement) {
    const stability = (gazeStability || 0.8) * (1 - (headMovement || 0.1))
    return { score: Math.round(stability * 100), level: stability > 0.8 ? 'high' : stability > 0.6 ? 'medium' : 'low' }
  }

  calculateFocusIndex(data) {
    const reactionTime = data.reactionTime || data.avgReactionTime || 300
    const focusScore = Math.max(0, Math.min(100, 100 - (reactionTime - 200) / 5))
    return Math.round(focusScore)
  }

  calculateLightSensitivity(adaptation) {
    if (!adaptation) return 75
    const sensitivity = Math.max(0, Math.min(100, 100 - adaptation * 10))
    return Math.round(sensitivity)
  }

  calculateClarityConfidence(data) {
    const factors = [
      data.imageQuality || 0.8,
      data.stability || 0.8,
      data.lighting || 0.8
    ]
    return Math.round(factors.reduce((a, b) => a + b, 0) / factors.length * 100)
  }

  fitReactionCurve(reactionTimes) {
    if (!reactionTimes || reactionTimes.length === 0) return { avg: 300, trend: 'stable' }
    const avg = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
    const trend = reactionTimes.length > 1 
      ? (reactionTimes[reactionTimes.length - 1] < reactionTimes[0] ? 'improving' : 'stable')
      : 'stable'
    return { avg, trend }
  }

  getAgeGroup(age) {
    if (age <= 25) return '18-25'
    if (age <= 35) return '26-35'
    if (age <= 45) return '36-45'
    if (age <= 55) return '46-55'
    return '56+'
  }

  calculatePercentile(value, benchmark) {
    const diff = ((benchmark - value) / benchmark) * 100
    return Math.max(0, Math.min(100, 50 + diff))
  }

  getBetterThan(value, benchmark) {
    return value < benchmark ? 'average' : value > benchmark ? 'below average' : 'average'
  }

  getPerformanceLevel(value, benchmark) {
    const diff = Math.abs(value - benchmark) / benchmark
    if (diff < 0.1) return 'excellent'
    if (diff < 0.2) return 'good'
    if (diff < 0.3) return 'average'
    return 'needs improvement'
  }

  compareValue(current, baseline) {
    const change = ((current - baseline) / baseline) * 100
    return {
      change: Math.round(change),
      improved: change < 0 || (change > 0 && current > baseline),
      significant: Math.abs(change) > 10
    }
  }

  compareBlinkPattern(current, baseline) {
    const change = ((current - baseline) / baseline) * 100
    return {
      change: Math.round(change),
      interpretation: change > 20 ? 'increased fatigue' : change < -20 ? 'improved' : 'stable'
    }
  }

  compareReactionTime(current, baseline) {
    const baselineAvg = baseline.avg || baseline
    const change = ((current - baselineAvg) / baselineAvg) * 100
    return {
      change: Math.round(change),
      improved: change < 0,
      significant: Math.abs(change) > 15
    }
  }

  calculateTrend(history, current) {
    if (history.length < 2) return 'insufficient data'
    const recent = history.slice(-3).map(h => h.score || h.focusIndex || 75)
    const trend = recent[recent.length - 1] > recent[0] ? 'improving' : 'declining'
    return trend
  }

  generateTrendMessage(improvements) {
    const positive = Object.values(improvements).filter(i => i.improved).length
    if (positive > 2) return 'Your vision performance is improving!'
    if (positive === 0) return 'Performance is stable'
    return 'Some areas need attention'
  }

  compareToGazeCapture(gazePattern) {
    // Simulated comparison
    return { similarity: 0.85, quality: 'good' }
  }

  compareToColorDatasets(colorResponses) {
    // Simulated comparison
    return { accuracy: 0.92, deviation: 0.08 }
  }

  compareToMotionDatasets(motionReactions) {
    // Simulated comparison
    return { responseTime: 0.88, consistency: 0.85 }
  }

  calculateDeviation(patterns) {
    const values = Object.values(patterns).map(p => p.similarity || p.accuracy || p.responseTime || 0.8)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    return Math.abs(1 - avg)
  }

  calculatePatternConfidence(patterns) {
    const deviation = this.calculateDeviation(patterns)
    return Math.round((1 - deviation) * 100)
  }

  interpretAttention(microSaccades) {
    if (microSaccades < 5) return 'low'
    if (microSaccades < 15) return 'normal'
    return 'high'
  }

  interpretFatigue(macroSaccades) {
    if (macroSaccades < 3) return 'low'
    if (macroSaccades < 8) return 'moderate'
    return 'high'
  }

  interpretFocusDifficulty(micro, macro) {
    const ratio = micro.length / (macro.length || 1)
    if (ratio > 3) return 'high'
    if (ratio > 1.5) return 'moderate'
    return 'low'
  }

  calculateVariance(values) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const squaredDiffs = values.map(v => Math.pow(v - avg, 2))
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length
  }

  classifyBlinkPattern(interval, variance) {
    if (interval < 3000) return 'rapid'
    if (interval > 8000) return 'slow'
    if (variance > 2000000) return 'irregular'
    return 'normal'
  }

  assessBlinkHealth(interval, variance) {
    if (interval >= 3000 && interval <= 6000 && variance < 1000000) return 'healthy'
    if (interval < 2000 || interval > 10000) return 'concerning'
    return 'moderate'
  }

  calculateSmoothness(gazePoints) {
    if (gazePoints.length < 2) return 0
    let totalDistance = 0
    let totalChange = 0
    for (let i = 1; i < gazePoints.length; i++) {
      const dist = Math.sqrt(
        Math.pow(gazePoints[i].x - gazePoints[i-1].x, 2) +
        Math.pow(gazePoints[i].y - gazePoints[i-1].y, 2)
      )
      totalDistance += dist
      totalChange += Math.abs(gazePoints[i].x - gazePoints[i-1].x) + Math.abs(gazePoints[i].y - gazePoints[i-1].y)
    }
    return totalDistance > 0 ? totalChange / totalDistance : 0
  }

  detectJumps(gazePoints) {
    const jumps = []
    for (let i = 1; i < gazePoints.length; i++) {
      const dist = Math.sqrt(
        Math.pow(gazePoints[i].x - gazePoints[i-1].x, 2) +
        Math.pow(gazePoints[i].y - gazePoints[i-1].y, 2)
      )
      if (dist > 50) jumps.push({ from: i-1, to: i, distance: dist })
    }
    return jumps
  }

  detectFixations(gazePoints) {
    const fixations = []
    let currentFixation = null
    for (let i = 1; i < gazePoints.length; i++) {
      const dist = Math.sqrt(
        Math.pow(gazePoints[i].x - gazePoints[i-1].x, 2) +
        Math.pow(gazePoints[i].y - gazePoints[i-1].y, 2)
      )
      if (dist < 10) {
        if (!currentFixation) currentFixation = { start: i-1, points: [gazePoints[i-1]] }
        currentFixation.points.push(gazePoints[i])
      } else {
        if (currentFixation && currentFixation.points.length > 5) fixations.push(currentFixation)
        currentFixation = null
      }
    }
    return fixations
  }

  assessTrackingQuality(smoothness, jumpCount) {
    if (smoothness > 0.8 && jumpCount < 3) return 'excellent'
    if (smoothness > 0.6 && jumpCount < 5) return 'good'
    if (smoothness > 0.4 && jumpCount < 8) return 'fair'
    return 'poor'
  }

  interpretGazePath(smoothness, jumps, fixations) {
    if (smoothness > 0.7 && jumps.length < 3) return 'Smooth tracking, good focus'
    if (jumps.length > 5) return 'Multiple jumps detected, may indicate difficulty'
    if (fixations.length < 2) return 'Limited fixations, may need more time'
    return 'Normal gaze pattern'
  }

  estimateAttention(eyeData) {
    const microMovements = this.detectMicroMovements(eyeData.movements)
    if (!microMovements) return 'unknown'
    return microMovements.attentionLevel
  }

  estimateFatigue(eyeData) {
    const blinkCycle = this.analyzeBlinkCycle(eyeData.blinks)
    const microMovements = this.detectMicroMovements(eyeData.movements)
    if (!blinkCycle || !microMovements) return 'unknown'
    return blinkCycle.health === 'concerning' || microMovements.fatigueLevel === 'high' ? 'high' : 'low'
  }

  estimateStress(eyeData) {
    const microMovements = this.detectMicroMovements(eyeData.movements)
    if (!microMovements) return 'unknown'
    return microMovements.focusDifficulty === 'high' ? 'elevated' : 'normal'
  }

  calculateOverallHealth(analysis) {
    const factors = []
    if (analysis.blinkCycle) factors.push(analysis.blinkCycle.health === 'healthy' ? 1 : 0.5)
    if (analysis.gazePath) factors.push(analysis.gazePath.trackingQuality === 'excellent' ? 1 : 0.7)
    if (analysis.fatigue === 'low') factors.push(1)
    const score = factors.length > 0 ? factors.reduce((a, b) => a + b, 0) / factors.length : 0.75
    return { score: Math.round(score * 100), level: score > 0.8 ? 'good' : score > 0.6 ? 'moderate' : 'needs attention' }
  }

  getDifficultyReason(accuracy, historyLength) {
    if (accuracy > 0.8) return 'Performance is excellent - increasing challenge'
    if (accuracy < 0.5) return 'Adjusting to your comfort level'
    return 'Maintaining optimal difficulty'
  }

  getDifficultyRecommendation(difficulty) {
    if (difficulty > 2.5) return 'Expert level'
    if (difficulty > 1.5) return 'Advanced level'
    if (difficulty > 1.0) return 'Intermediate level'
    return 'Beginner level'
  }

  assessImageQuality(imageData) {
    // Simulated assessment
    return imageData?.sharpness || 0.85
  }

  assessMovementSpeed(movements) {
    if (!movements || movements.length === 0) return 0.8
    const avgSpeed = movements.reduce((a, b) => a + (b.speed || 0), 0) / movements.length
    return avgSpeed < 5 ? 0.9 : avgSpeed < 10 ? 0.7 : 0.5
  }

  assessLighting(lighting) {
    return lighting?.consistency || 0.8
  }

  assessEyeCentering(eyePosition) {
    if (!eyePosition) return 0.8
    const centerX = 0.5, centerY = 0.5
    const distance = Math.sqrt(
      Math.pow(eyePosition.x - centerX, 2) +
      Math.pow(eyePosition.y - centerY, 2)
    )
    return Math.max(0, 1 - distance * 2)
  }

  assessDataCompleteness(data) {
    const required = ['imageData', 'movements', 'lighting', 'eyePosition']
    const present = required.filter(key => data[key] !== undefined && data[key] !== null).length
    return present / required.length
  }

  computeConfidenceScore(factors) {
    const weights = {
      imageQuality: 0.3,
      movementSpeed: 0.2,
      lightingConsistency: 0.2,
      eyeCentering: 0.2,
      dataCompleteness: 0.1
    }
    let score = 0
    for (const [key, value] of Object.entries(factors)) {
      score += value * (weights[key] || 0.1)
    }
    return Math.round(score * 100)
  }

  getConfidenceLevel(score) {
    if (score >= 80) return 'high'
    if (score >= 60) return 'medium'
    return 'low'
  }

  getConfidenceRecommendations(factors, confidence) {
    const recommendations = []
    if (factors.imageQuality < 0.7) recommendations.push('Improve image quality - ensure good lighting')
    if (factors.movementSpeed < 0.6) recommendations.push('Hold still during scan')
    if (factors.lightingConsistency < 0.7) recommendations.push('Find more consistent lighting')
    if (factors.eyeCentering < 0.7) recommendations.push('Center your eyes in the frame')
    if (confidence < 60) recommendations.push('Consider retaking the test for better results')
    return recommendations
  }

  checkAlignment(eyePosition) {
    if (!eyePosition) return { optimal: false, message: 'Position face in frame' }
    const distance = Math.sqrt(
      Math.pow(eyePosition.x - 0.5, 2) +
      Math.pow(eyePosition.y - 0.5, 2)
    )
    return {
      optimal: distance < 0.1,
      message: distance < 0.1 ? 'Perfect alignment' : 'Move face to center'
    }
  }

  checkLighting(lighting) {
    if (!lighting) return { optimal: false, message: 'Check lighting conditions' }
    return {
      optimal: lighting.brightness > 0.5 && lighting.consistency > 0.7,
      message: lighting.brightness < 0.5 ? 'Increase lighting' : 'Lighting looks good'
    }
  }

  checkStability(movements) {
    if (!movements || movements.length === 0) return { optimal: true, message: 'Stable' }
    const avgSpeed = movements.reduce((a, b) => a + (b.speed || 0), 0) / movements.length
    return {
      optimal: avgSpeed < 5,
      message: avgSpeed < 5 ? 'Holding still' : 'Please hold still'
    }
  }

  checkExposure(imageData) {
    if (!imageData) return { optimal: false, message: 'Adjusting exposure' }
    return {
      optimal: imageData.exposure > 0.5 && imageData.exposure < 0.9,
      message: imageData.exposure < 0.5 ? 'Too dark' : imageData.exposure > 0.9 ? 'Too bright' : 'Exposure good'
    }
  }

  calculateConsistency(values) {
    if (!values || values.length < 2) return 1
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)
    return Math.max(0, 1 - (stdDev / avg))
  }

  generateInsights(comparisons, data) {
    const insights = []
    
    if (comparisons.population) {
      const pop = comparisons.population
      if (pop.focusPercentile > 75) {
        insights.push(`Your focus is better than ${Math.round(pop.focusPercentile)}% of people your age`)
      }
      if (pop.reactionTimePercentile > 75) {
        insights.push(`Your reaction time is faster than ${Math.round(pop.reactionTimePercentile)}% of your age group`)
      }
    }

    if (comparisons.personal?.hasHistory) {
      const personal = comparisons.personal
      if (personal.trend === 'improving') {
        insights.push('Your vision performance is improving over time')
      }
      if (personal.improvements.eyeStability?.improved) {
        insights.push('Eye stability has improved since last test')
      }
    }

    return insights
  }

  // Save pattern to history
  savePattern(pattern) {
    this.patternHistory.push({
      ...pattern,
      timestamp: new Date().toISOString()
    })
    // Keep only last 10 patterns
    if (this.patternHistory.length > 10) {
      this.patternHistory = this.patternHistory.slice(-10)
    }
  }
}

// Export singleton instance
const cvie = new CVIE()
export default cvie

