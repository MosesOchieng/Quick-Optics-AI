/**
 * Adaptive Learning System
 * Enables AI to learn from new image datasets and user interactions
 */

class AdaptiveLearning {
  constructor() {
    this.learnedPatterns = new Map()
    this.interactionHistory = []
    this.modelWeights = {}
    this.datasetCache = new Map()
    this.learningEnabled = true
  }

  /**
   * Learn from new image dataset
   * @param {Array} imageDataset - Array of {image, label, features, metadata}
   * @param {Object} options - Learning options
   */
  async learnFromDataset(imageDataset, options = {}) {
    if (!this.learningEnabled) {
      console.warn('Learning is disabled')
      return { success: false, message: 'Learning disabled' }
    }

    try {
      console.log(`📚 Learning from ${imageDataset.length} new images...`)
      
      const {
        batchSize = 10,
        epochs = 1,
        validationSplit = 0.2,
        updateModel = true
      } = options

      // Process dataset in batches
      const batches = this.createBatches(imageDataset, batchSize)
      let learnedFeatures = []
      let learnedLabels = []

      for (const batch of batches) {
        const batchFeatures = await this.extractFeatures(batch)
        const batchLabels = batch.map(item => item.label)
        
        learnedFeatures.push(...batchFeatures)
        learnedLabels.push(...batchLabels)
        
        // Update learned patterns
        this.updatePatterns(batchFeatures, batchLabels)
      }

      // Update model weights if enabled
      if (updateModel) {
        await this.updateModelWeights(learnedFeatures, learnedLabels)
      }

      // Cache dataset for future reference
      const datasetId = `dataset_${Date.now()}`
      this.datasetCache.set(datasetId, {
        images: imageDataset.length,
        features: learnedFeatures.length,
        labels: new Set(learnedLabels),
        timestamp: new Date().toISOString()
      })

      console.log(`✅ Learned from ${imageDataset.length} images. Patterns updated.`)
      
      return {
        success: true,
        datasetId,
        patternsLearned: learnedFeatures.length,
        labelsLearned: Array.from(new Set(learnedLabels)),
        modelUpdated: updateModel
      }
    } catch (error) {
      console.error('❌ Learning from dataset failed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Learn from user interaction
   * @param {Object} interaction - {type, input, response, feedback, outcome}
   */
  learnFromInteraction(interaction) {
    if (!this.learningEnabled) return

    try {
      const {
        type, // 'question', 'answer', 'feedback', 'correction'
        input,
        response,
        feedback, // 'positive', 'negative', 'neutral'
        outcome, // 'success', 'failure', 'partial'
        metadata = {}
      } = interaction

      // Store interaction
      this.interactionHistory.push({
        ...interaction,
        timestamp: new Date().toISOString()
      })

      // Learn from feedback
      if (feedback === 'positive') {
        this.reinforcePattern(input, response)
      } else if (feedback === 'negative') {
        this.adjustPattern(input, response)
      }

      // Learn from corrections
      if (type === 'correction' && outcome) {
        this.learnCorrection(input, outcome, metadata)
      }

      // Keep only last 1000 interactions
      if (this.interactionHistory.length > 1000) {
        this.interactionHistory = this.interactionHistory.slice(-1000)
      }

      console.log(`🧠 Learned from interaction: ${type} - ${feedback || 'neutral'}`)
      
      return { success: true, learned: true }
    } catch (error) {
      console.error('Learning from interaction failed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Extract features from images
   */
  async extractFeatures(images) {
    // Simulate feature extraction (in production, use actual ML model)
    return images.map(img => ({
      brightness: img.features?.brightness || Math.random(),
      sharpness: img.features?.sharpness || Math.random(),
      contrast: img.features?.contrast || Math.random(),
      colorBalance: img.features?.colorBalance || Math.random(),
      texture: img.features?.texture || Math.random(),
      edges: img.features?.edges || Math.random(),
      // Add more features as needed
    }))
  }

  /**
   * Update learned patterns
   */
  updatePatterns(features, labels) {
    labels.forEach((label, index) => {
      if (!this.learnedPatterns.has(label)) {
        this.learnedPatterns.set(label, {
          features: [],
          count: 0,
          confidence: 0,
          lastUpdated: new Date().toISOString()
        })
      }

      const pattern = this.learnedPatterns.get(label)
      pattern.features.push(features[index])
      pattern.count += 1
      pattern.lastUpdated = new Date().toISOString()
      
      // Update confidence based on pattern consistency
      pattern.confidence = this.calculatePatternConfidence(pattern.features)
    })
  }

  /**
   * Calculate pattern confidence
   */
  calculatePatternConfidence(features) {
    if (features.length < 2) return 0.5
    
    // Calculate variance in features
    const variances = Object.keys(features[0]).map(key => {
      const values = features.map(f => f[key])
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
      return variance
    })
    
    // Lower variance = higher confidence
    const avgVariance = variances.reduce((a, b) => a + b, 0) / variances.length
    return Math.max(0, Math.min(1, 1 - avgVariance))
  }

  /**
   * Update model weights (simulated - in production, use actual ML training)
   */
  async updateModelWeights(features, labels) {
    // Simulate model weight update
    // In production, this would retrain or fine-tune the model
    console.log('🔄 Updating model weights...')
    
    // Update weights for each label
    const uniqueLabels = new Set(labels)
    uniqueLabels.forEach(label => {
      if (!this.modelWeights[label]) {
        this.modelWeights[label] = {}
      }
      
      // Simulate weight adjustment
      const labelFeatures = features.filter((_, i) => labels[i] === label)
      const avgFeatures = this.averageFeatures(labelFeatures)
      
      // Update weights (simplified)
      Object.keys(avgFeatures).forEach(key => {
        if (!this.modelWeights[label][key]) {
          this.modelWeights[label][key] = 0.5
        }
        // Adjust weight based on feature importance
        this.modelWeights[label][key] = 
          this.modelWeights[label][key] * 0.9 + avgFeatures[key] * 0.1
      })
    })
    
    console.log('✅ Model weights updated')
  }

  /**
   * Average features
   */
  averageFeatures(features) {
    if (features.length === 0) return {}
    
    const keys = Object.keys(features[0])
    return keys.reduce((avg, key) => {
      avg[key] = features.reduce((sum, f) => sum + (f[key] || 0), 0) / features.length
      return avg
    }, {})
  }

  /**
   * Reinforce successful pattern
   */
  reinforcePattern(input, response) {
    const patternKey = this.getPatternKey(input)
    if (!this.learnedPatterns.has(patternKey)) {
      this.learnedPatterns.set(patternKey, {
        responses: [],
        successCount: 0,
        failureCount: 0
      })
    }
    
    const pattern = this.learnedPatterns.get(patternKey)
    pattern.responses.push(response)
    pattern.successCount += 1
    pattern.lastUpdated = new Date().toISOString()
  }

  /**
   * Adjust pattern based on negative feedback
   */
  adjustPattern(input, response) {
    const patternKey = this.getPatternKey(input)
    if (this.learnedPatterns.has(patternKey)) {
      const pattern = this.learnedPatterns.get(patternKey)
      pattern.failureCount += 1
      pattern.lastUpdated = new Date().toISOString()
      
      // Remove unsuccessful response
      pattern.responses = pattern.responses.filter(r => r !== response)
    }
  }

  /**
   * Learn from correction
   */
  learnCorrection(input, correctOutcome, metadata) {
    const patternKey = this.getPatternKey(input)
    this.learnedPatterns.set(patternKey, {
      correctOutcome,
      metadata,
      learnedAt: new Date().toISOString(),
      confidence: 1.0 // High confidence for corrections
    })
  }

  /**
   * Get pattern key from input
   */
  getPatternKey(input) {
    if (typeof input === 'string') {
      return input.toLowerCase().trim()
    }
    return JSON.stringify(input)
  }

  /**
   * Create batches from dataset
   */
  createBatches(dataset, batchSize) {
    const batches = []
    for (let i = 0; i < dataset.length; i += batchSize) {
      batches.push(dataset.slice(i, i + batchSize))
    }
    return batches
  }

  /**
   * Get learned patterns
   */
  getLearnedPatterns(label = null) {
    if (label) {
      return this.learnedPatterns.get(label) || null
    }
    return Array.from(this.learnedPatterns.entries()).map(([key, value]) => ({
      label: key,
      ...value
    }))
  }

  /**
   * Get interaction statistics
   */
  getInteractionStats() {
    const stats = {
      total: this.interactionHistory.length,
      byType: {},
      byFeedback: {},
      successRate: 0
    }

    this.interactionHistory.forEach(interaction => {
      stats.byType[interaction.type] = (stats.byType[interaction.type] || 0) + 1
      if (interaction.feedback) {
        stats.byFeedback[interaction.feedback] = (stats.byFeedback[interaction.feedback] || 0) + 1
      }
    })

    const positive = stats.byFeedback.positive || 0
    const total = stats.byFeedback.positive + (stats.byFeedback.negative || 0)
    stats.successRate = total > 0 ? positive / total : 0

    return stats
  }

  /**
   * Export learned data
   */
  exportLearnedData() {
    return {
      patterns: Array.from(this.learnedPatterns.entries()),
      modelWeights: this.modelWeights,
      interactionStats: this.getInteractionStats(),
      datasetCache: Array.from(this.datasetCache.entries()),
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Import learned data
   */
  importLearnedData(data) {
    try {
      if (data.patterns) {
        this.learnedPatterns = new Map(data.patterns)
      }
      if (data.modelWeights) {
        this.modelWeights = data.modelWeights
      }
      if (data.datasetCache) {
        this.datasetCache = new Map(data.datasetCache)
      }
      console.log('✅ Learned data imported successfully')
      return { success: true }
    } catch (error) {
      console.error('Failed to import learned data:', error)
      return { success: false, error: error.message }
    }
  }
}

export default new AdaptiveLearning()

