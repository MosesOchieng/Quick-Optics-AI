import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import cvie from '../services/CVIE'
import './AIAnalytics.css'

const AIAnalytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [baseline, setBaseline] = useState(null)

  useEffect(() => {
    // Load saved CVIE data
    const savedAnalysis = localStorage.getItem('cvie_analysis')
    if (savedAnalysis) {
      const data = JSON.parse(savedAnalysis)
      setAnalytics(data.comparison)
      setBaseline(data.baseline)
    } else {
      // Generate sample analytics
      const sampleComparison = cvie.comparePerformance({
        reactionTime: 285,
        focusScore: 82,
        stability: 85,
        colorScore: 88
      }, 30, 'mid-range')
      setAnalytics(sampleComparison)
      setBaseline(cvie.userBaseline)
    }
  }, [])

  if (!analytics) {
    return (
      <div className="ai-analytics">
        <div className="loading">Loading AI Analytics...</div>
      </div>
    )
  }

  return (
    <div className="ai-analytics">
      <div className="analytics-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="analytics-header"
        >
          <h1>AI Vision Intelligence</h1>
          <p>Comparative analysis powered by CVIE</p>
        </motion.div>

        {baseline && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="baseline-card"
          >
            <h2>Your Baseline Profile</h2>
            <div className="baseline-metrics">
              <div className="metric">
                <span className="metric-label">Focus Index</span>
                <span className="metric-value">{baseline.focusIndex}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Light Sensitivity</span>
                <span className="metric-value">{baseline.lightSensitivityIndex}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Stability Score</span>
                <span className="metric-value">{baseline.stabilityScore}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Clarity Confidence</span>
                <span className="metric-value">{baseline.clarityConfidence}%</span>
              </div>
            </div>
          </motion.div>
        )}

        {analytics.comparisons.population && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="comparison-card"
          >
            <h2>Population Comparison</h2>
            <div className="comparison-stats">
              <div className="stat-item">
                <span className="stat-label">Reaction Time Percentile</span>
                <div className="stat-bar">
                  <div
                    className="stat-fill"
                    style={{ width: `${analytics.comparisons.population.reactionTimePercentile}%` }}
                  />
                  <span className="stat-value">
                    {Math.round(analytics.comparisons.population.reactionTimePercentile)}%
                  </span>
                </div>
                <p className="stat-description">
                  {analytics.comparisons.population.comparison.betterThan} performance
                </p>
              </div>

              <div className="stat-item">
                <span className="stat-label">Focus Percentile</span>
                <div className="stat-bar">
                  <div
                    className="stat-fill"
                    style={{ width: `${analytics.comparisons.population.focusPercentile}%` }}
                  />
                  <span className="stat-value">
                    {Math.round(analytics.comparisons.population.focusPercentile)}%
                  </span>
                </div>
              </div>

              <div className="stat-item">
                <span className="stat-label">Stability Percentile</span>
                <div className="stat-bar">
                  <div
                    className="stat-fill"
                    style={{ width: `${analytics.comparisons.population.stabilityPercentile}%` }}
                  />
                  <span className="stat-value">
                    {Math.round(analytics.comparisons.population.stabilityPercentile)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {analytics.comparisons.personal?.hasHistory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="personal-trend-card"
          >
            <h2>Personal Trend Analysis</h2>
            <div className="trend-info">
              <p className="trend-message">{analytics.comparisons.personal.message}</p>
              <div className="trend-indicators">
                {Object.entries(analytics.comparisons.personal.improvements).map(([key, value]) => (
                  <div key={key} className="trend-item">
                    <span className="trend-label">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className={`trend-value ${value.improved ? 'positive' : 'negative'}`}>
                      {value.improved ? '↑' : '↓'} {Math.abs(value.change)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {analytics.insights && analytics.insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="insights-card"
          >
            <h2>AI Insights</h2>
            <ul className="insights-list">
              {analytics.insights.map((insight, idx) => (
                <li key={idx} className="insight-item">
                  <span className="insight-icon">💡</span>
                  {insight}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <div className="scores-grid">
          <div className="score-card">
            <h3>Focus Index</h3>
            <div className="score-value-large">{analytics.scores.focusIndex}</div>
          </div>
          <div className="score-card">
            <h3>Light Sensitivity</h3>
            <div className="score-value-large">{analytics.scores.lightSensitivityIndex}</div>
          </div>
          <div className="score-card">
            <h3>Stability Score</h3>
            <div className="score-value-large">{analytics.scores.stabilityScore}</div>
          </div>
          <div className="score-card">
            <h3>Clarity Confidence</h3>
            <div className="score-value-large">{analytics.scores.clarityConfidence}%</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIAnalytics

