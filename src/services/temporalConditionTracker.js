/**
 * Temporal condition tracking service
 * Tracks condition probabilities over time and detects trends
 */
class TemporalConditionTracker {
  constructor() {
    this.history = this.loadHistory()
    this.maxHistorySize = 20 // Keep last 20 scans
  }

  loadHistory() {
    try {
      const stored = localStorage.getItem('temporal_condition_history')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  saveHistory() {
    try {
      localStorage.setItem('temporal_condition_history', JSON.stringify(this.history))
    } catch (error) {
      console.warn('Failed to save temporal history:', error)
    }
  }

  /**
   * Record condition probabilities from a scan
   */
  recordScan(probabilities, timestamp = Date.now()) {
    if (!probabilities || !Array.isArray(probabilities)) return

    const record = {
      timestamp,
      conditions: probabilities.map(p => ({
        label: p.label,
        probability: p.value || p.probability || 0
      })),
      topCondition: probabilities[0] ? {
        label: probabilities[0].label,
        probability: probabilities[0].value || probabilities[0].probability || 0
      } : null
    }

    this.history.push(record)
    
    // Keep only recent history
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize)
    }

    this.saveHistory()
  }

  /**
   * Get trend analysis for a specific condition
   */
  getConditionTrend(conditionLabel, days = 7) {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000)
    const recent = this.history.filter(r => r.timestamp >= cutoff)

    if (recent.length < 2) return null

    const conditionData = recent.map(record => {
      const condition = record.conditions.find(c => c.label === conditionLabel)
      return {
        timestamp: record.timestamp,
        probability: condition ? condition.probability : 0
      }
    })

    if (conditionData.length < 2) return null

    // Calculate trend
    const first = conditionData[0].probability
    const last = conditionData[conditionData.length - 1].probability
    const delta = last - first
    const percentChange = first > 0 ? ((delta / first) * 100) : 0

    // Calculate average
    const avg = conditionData.reduce((sum, d) => sum + d.probability, 0) / conditionData.length

    // Detect pattern (increasing, decreasing, stable)
    let pattern = 'stable'
    if (Math.abs(percentChange) > 5) {
      pattern = percentChange > 0 ? 'increasing' : 'decreasing'
    }

    return {
      condition: conditionLabel,
      delta: delta.toFixed(1),
      percentChange: percentChange.toFixed(1),
      average: avg.toFixed(1),
      pattern,
      dataPoints: conditionData.length,
      trend: delta > 0 ? 'up' : delta < 0 ? 'down' : 'stable'
    }
  }

  /**
   * Get all condition trends
   */
  getAllTrends(days = 7) {
    if (this.history.length < 2) return []

    // Get all unique conditions from history
    const allConditions = new Set()
    this.history.forEach(record => {
      record.conditions.forEach(c => allConditions.add(c.label))
    })

    const trends = Array.from(allConditions).map(label => this.getConditionTrend(label, days))
    return trends.filter(t => t !== null)
  }

  /**
   * Get comparison with previous scan
   */
  getPreviousComparison() {
    if (this.history.length < 2) return null

    const latest = this.history[this.history.length - 1]
    const previous = this.history[this.history.length - 2]

    const comparisons = latest.conditions.map(current => {
      const prev = previous.conditions.find(c => c.label === current.label)
      if (!prev) return null

      const delta = current.probability - prev.probability
      return {
        label: current.label,
        current: current.probability,
        previous: prev.probability,
        delta: delta.toFixed(1),
        trend: delta > 0 ? 'up' : delta < 0 ? 'down' : 'stable'
      }
    }).filter(c => c !== null)

    return {
      timeSinceLastScan: latest.timestamp - previous.timestamp,
      comparisons
    }
  }

  /**
   * Get summary insights
   */
  getInsights() {
    if (this.history.length < 2) return null

    const trends = this.getAllTrends(7)
    const significantChanges = trends.filter(t => Math.abs(parseFloat(t.percentChange)) > 6)

    const insights = {
      totalScans: this.history.length,
      significantChanges: significantChanges.length,
      topTrendingUp: trends
        .filter(t => t.trend === 'up')
        .sort((a, b) => parseFloat(b.percentChange) - parseFloat(a.percentChange))
        .slice(0, 3),
      topTrendingDown: trends
        .filter(t => t.trend === 'down')
        .sort((a, b) => parseFloat(a.percentChange) - parseFloat(b.percentChange))
        .slice(0, 3)
    }

    return insights
  }
}

export default new TemporalConditionTracker()

