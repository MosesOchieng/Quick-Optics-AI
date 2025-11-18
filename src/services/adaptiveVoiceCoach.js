/**
 * Adaptive voice coaching service
 * Tracks user patterns and provides personalized tips
 */
class AdaptiveVoiceCoach {
  constructor() {
    this.userProfile = this.loadProfile()
    this.alignmentHistory = []
    this.tipCooldown = {}
  }

  loadProfile() {
    try {
      const stored = localStorage.getItem('voice_coach_profile')
      return stored ? JSON.parse(stored) : {
        alignmentTendencies: {},
        commonIssues: [],
        personalizedTips: []
      }
    } catch {
      return {
        alignmentTendencies: {},
        commonIssues: [],
        personalizedTips: []
      }
    }
  }

  saveProfile() {
    try {
      localStorage.setItem('voice_coach_profile', JSON.stringify(this.userProfile))
    } catch (error) {
      console.warn('Failed to save voice coach profile:', error)
    }
  }

  /**
   * Track alignment corrections
   */
  trackAlignment(alignmentData) {
    if (!alignmentData) return

    const { horizontalBalance, verticalBalance, leftBrightness, rightBrightness } = alignmentData
    
    // Track horizontal tendency
    if (horizontalBalance > 0.1) {
      const direction = leftBrightness > rightBrightness ? 'left' : 'right'
      this.alignmentHistory.push({
        type: 'horizontal',
        direction,
        timestamp: Date.now()
      })
    }

    // Track vertical tendency
    if (verticalBalance > 0.1) {
      const direction = alignmentData.topBrightness > alignmentData.bottomBrightness ? 'up' : 'down'
      this.alignmentHistory.push({
        type: 'vertical',
        direction,
        timestamp: Date.now()
      })
    }

    // Keep only recent history (last 10 scans)
    this.alignmentHistory = this.alignmentHistory
      .filter(h => Date.now() - h.timestamp < 7 * 24 * 60 * 60 * 1000)
      .slice(-50)

    this.updateProfile()
  }

  /**
   * Update user profile based on history
   */
  updateProfile() {
    const horizontal = this.alignmentHistory.filter(h => h.type === 'horizontal')
    const vertical = this.alignmentHistory.filter(h => h.type === 'vertical')

    // Calculate tendencies
    const leftCount = horizontal.filter(h => h.direction === 'left').length
    const rightCount = horizontal.filter(h => h.direction === 'right').length
    const upCount = vertical.filter(h => h.direction === 'up').length
    const downCount = vertical.filter(h => h.direction === 'down').length

    this.userProfile.alignmentTendencies = {
      horizontal: leftCount > rightCount ? 'leans_left' : rightCount > leftCount ? 'leans_right' : 'balanced',
      vertical: upCount > downCount ? 'leans_up' : downCount > upCount ? 'leans_down' : 'balanced'
    }

    // Generate personalized tips
    this.userProfile.personalizedTips = this.generateTips()
    this.saveProfile()
  }

  /**
   * Generate personalized coaching tips
   */
  generateTips() {
    const tips = []
    const { horizontal, vertical } = this.userProfile.alignmentTendencies

    if (horizontal === 'leans_left') {
      tips.push({
        id: 'anchor_right',
        message: 'You tend to lean left. Try anchoring your right elbow on the table for better stability.',
        priority: 'medium'
      })
    } else if (horizontal === 'leans_right') {
      tips.push({
        id: 'anchor_left',
        message: 'You tend to lean right. Try anchoring your left elbow on the table for better stability.',
        priority: 'medium'
      })
    }

    if (vertical === 'leans_up') {
      tips.push({
        id: 'lower_screen',
        message: 'You tend to look up. Try lowering your screen or raising your chair slightly.',
        priority: 'low'
      })
    } else if (vertical === 'leans_down') {
      tips.push({
        id: 'raise_screen',
        message: 'You tend to look down. Try raising your screen or adjusting your posture.',
        priority: 'low'
      })
    }

    // Add general tips if no specific tendencies
    if (tips.length === 0) {
      tips.push({
        id: 'maintain_posture',
        message: 'Great alignment! Maintain this posture for consistent results.',
        priority: 'low'
      })
    }

    return tips
  }

  /**
   * Get adaptive coaching message
   */
  getCoachingMessage(alignmentData, isFirstTime = false) {
    if (isFirstTime) {
      return 'Welcome! I\'ll help you get aligned. Follow my instructions.'
    }

    this.trackAlignment(alignmentData)

    const tips = this.userProfile.personalizedTips
    if (tips.length === 0) return null

    // Return highest priority tip that hasn't been shown recently
    const now = Date.now()
    const availableTips = tips.filter(tip => {
      const lastShown = this.tipCooldown[tip.id] || 0
      return now - lastShown > 30000 // 30 second cooldown
    })

    if (availableTips.length === 0) return null

    const tip = availableTips[0]
    this.tipCooldown[tip.id] = now

    return tip.message
  }

  /**
   * Get reinforcement message after successful alignment
   */
  getReinforcementMessage() {
    const { horizontal, vertical } = this.userProfile.alignmentTendencies
    
    if (horizontal === 'balanced' && vertical === 'balanced') {
      return 'Perfect alignment! Your consistency is improving.'
    }

    return 'Great job maintaining alignment! Keep it up.'
  }
}

export default new AdaptiveVoiceCoach()

