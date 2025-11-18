/**
 * Explainable AI log service
 * Generates downloadable evidence packets with annotated frames and explanations
 */
class ExplainableAILog {
  constructor() {
    this.currentScanLog = null
  }

  /**
   * Start logging a new scan
   */
  startScan(scanId) {
    this.currentScanLog = {
      scanId: scanId || `scan_${Date.now()}`,
      timestamp: new Date().toISOString(),
      frames: [],
      computerVisionData: [],
      aiPredictions: [],
      featureVectors: [],
      alignmentHistory: [],
      metadata: {}
    }
  }

  /**
   * Log a captured frame with annotations
   */
  logFrame(frameDataUrl, annotations = {}) {
    if (!this.currentScanLog) return

    this.currentScanLog.frames.push({
      timestamp: Date.now(),
      dataUrl: frameDataUrl,
      annotations: {
        gazePoint: annotations.gazePoint,
        faceDetected: annotations.faceDetected,
        alignment: annotations.alignment,
        ...annotations
      }
    })
  }

  /**
   * Log computer vision analysis
   */
  logComputerVision(cvData) {
    if (!this.currentScanLog) return

    this.currentScanLog.computerVisionData.push({
      timestamp: Date.now(),
      ...cvData
    })
  }

  /**
   * Log AI predictions
   */
  logPrediction(predictions, source = 'on-device') {
    if (!this.currentScanLog) return

    this.currentScanLog.aiPredictions.push({
      timestamp: Date.now(),
      source,
      predictions: Array.isArray(predictions) ? predictions : [predictions]
    })
  }

  /**
   * Log feature vector
   */
  logFeatureVector(features) {
    if (!this.currentScanLog) return

    this.currentScanLog.featureVectors.push({
      timestamp: Date.now(),
      features
    })
  }

  /**
   * Log alignment history
   */
  logAlignment(alignmentData) {
    if (!this.currentScanLog) return

    this.currentScanLog.alignmentHistory.push({
      timestamp: Date.now(),
      ...alignmentData
    })
  }

  /**
   * Add metadata
   */
  addMetadata(key, value) {
    if (!this.currentScanLog) return
    this.currentScanLog.metadata[key] = value
  }

  /**
   * Generate evidence packet
   */
  generateEvidencePacket() {
    if (!this.currentScanLog) return null

    const packet = {
      ...this.currentScanLog,
      summary: this.generateSummary(),
      explanations: this.generateExplanations(),
      featureHeatmaps: this.generateFeatureHeatmaps()
    }

    return packet
  }

  /**
   * Generate summary of scan
   */
  generateSummary() {
    if (!this.currentScanLog) return null

    const cvData = this.currentScanLog.computerVisionData
    const predictions = this.currentScanLog.aiPredictions
    const alignment = this.currentScanLog.alignmentHistory

    const avgBrightness = cvData.length > 0
      ? cvData.reduce((sum, d) => sum + (d.brightness || 0), 0) / cvData.length
      : 0

    const avgSharpness = cvData.length > 0
      ? cvData.reduce((sum, d) => sum + (d.sharpness || 0), 0) / cvData.length
      : 0

    const topPrediction = predictions.length > 0 && predictions[predictions.length - 1]
      ? predictions[predictions.length - 1].predictions[0]
      : null

    return {
      totalFrames: this.currentScanLog.frames.length,
      scanDuration: this.currentScanLog.frames.length > 0
        ? this.currentScanLog.frames[this.currentScanLog.frames.length - 1].timestamp - this.currentScanLog.frames[0].timestamp
        : 0,
      averageBrightness: avgBrightness.toFixed(2),
      averageSharpness: avgSharpness.toFixed(2),
      alignmentCorrections: alignment.length,
      topPrediction: topPrediction ? {
        label: topPrediction.label,
        confidence: topPrediction.value || topPrediction.probability
      } : null
    }
  }

  /**
   * Generate explanations for predictions
   */
  generateExplanations() {
    if (!this.currentScanLog) return []

    const explanations = []
    const lastPrediction = this.currentScanLog.aiPredictions[this.currentScanLog.aiPredictions.length - 1]

    if (lastPrediction && lastPrediction.predictions.length > 0) {
      const topPred = lastPrediction.predictions[0]
      const cvData = this.currentScanLog.computerVisionData[this.currentScanLog.computerVisionData.length - 1]

      explanations.push({
        prediction: topPred.label,
        confidence: topPred.value || topPred.probability,
        reasoning: [
          `Based on ${this.currentScanLog.frames.length} analyzed frames`,
          cvData ? `Image quality: ${(cvData.sharpness * 100).toFixed(0)}% sharpness, ${(cvData.brightness * 100).toFixed(0)}% brightness` : 'Image quality: analyzed',
          `Alignment stability: ${this.currentScanLog.alignmentHistory.length} corrections made`,
          `Analysis method: ${lastPrediction.source}`
        ].join('. ')
      })
    }

    return explanations
  }

  /**
   * Generate feature heatmaps (simplified - just feature importance)
   */
  generateFeatureHeatmaps() {
    if (!this.currentScanLog || this.currentScanLog.featureVectors.length === 0) return []

    const lastFeatures = this.currentScanLog.featureVectors[this.currentScanLog.featureVectors.length - 1].features

    return Object.keys(lastFeatures).map(key => ({
      feature: key,
      value: lastFeatures[key],
      importance: Math.abs(lastFeatures[key]) // Simplified importance
    })).sort((a, b) => b.importance - a.importance).slice(0, 10)
  }

  /**
   * Download evidence packet as JSON
   */
  downloadEvidencePacket() {
    const packet = this.generateEvidencePacket()
    if (!packet) {
      console.warn('No scan log to download')
      return
    }

    // Convert data URLs to references (to reduce size)
    const downloadablePacket = {
      ...packet,
      frames: packet.frames.map(frame => ({
        ...frame,
        dataUrl: '[Frame data - see frames array in full log]',
        frameIndex: packet.frames.indexOf(frame)
      }))
    }

    const blob = new Blob([JSON.stringify(downloadablePacket, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `eye_scan_evidence_${packet.scanId}_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Get current log (for display)
   */
  getCurrentLog() {
    return this.currentScanLog
  }

  /**
   * Finish scan and save
   */
  finishScan() {
    if (!this.currentScanLog) return null

    const packet = this.generateEvidencePacket()
    
    // Save to localStorage for history
    try {
      const history = JSON.parse(localStorage.getItem('ai_evidence_logs') || '[]')
      history.push(packet)
      // Keep only last 10 scans
      const trimmed = history.slice(-10)
      localStorage.setItem('ai_evidence_logs', JSON.stringify(trimmed))
    } catch (error) {
      console.warn('Failed to save evidence log:', error)
    }

    const finished = this.currentScanLog
    this.currentScanLog = null
    return packet
  }
}

export default new ExplainableAILog()

