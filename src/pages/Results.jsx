import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import storage from '../utils/storage'
import cvie from '../services/CVIE'
import './Results.css'

const Results = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [expandedCard, setExpandedCard] = useState(null)
  const [hasPaid, setHasPaid] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState(null)

  // Save results to storage when component mounts
  useEffect(() => {
    if (location.state?.results) {
      storage.saveTestResult({
        results: location.state.results,
        status: 'Completed',
        overallScore: 85 // Calculate from results
      })
    }

    // Check if user has paid
    const paymentData = localStorage.getItem('payment_data')
    if (paymentData) {
      const payment = JSON.parse(paymentData)
      setHasPaid(payment.status === 'completed')
    } else if (location.state?.paymentComplete) {
      setHasPaid(true)
    }

    // Load CVIE analysis if available
    const savedAnalysis = localStorage.getItem('cvie_analysis')
    if (savedAnalysis) {
      const data = JSON.parse(savedAnalysis)
      setAiAnalysis(data.comparison)
    } else if (location.state?.aiAnalysis) {
      setAiAnalysis(location.state.aiAnalysis)
    }
  }, [location.state])

  // Mock results data (in real app, this would come from the test results)
  const results = {
    myopia: { score: 75, status: 'Mild risk detected', correction: '-1.25D', risk: 'low' },
    hyperopia: { score: 90, status: 'Normal', correction: null, risk: 'none' },
    astigmatism: { score: 85, status: 'Slight irregularity', correction: '-0.50D', risk: 'low' },
    colorSensitivity: { score: 95, status: 'Excellent', correction: null, risk: 'none' },
    irisIrregularities: { score: 80, status: 'Minor variations', correction: null, risk: 'low' },
    dryEyeRisk: { score: 70, status: 'Moderate risk', correction: null, risk: 'moderate' }
  }

  const conditions = [
    {
      id: 'myopia',
      name: 'Myopia (Short-sightedness)',
      icon: '🔍',
      ...results.myopia,
      explanation: 'Myopia occurs when the eye focuses light in front of the retina instead of on it. This makes distant objects appear blurry while close objects remain clear.'
    },
    {
      id: 'hyperopia',
      name: 'Hyperopia (Long-sightedness)',
      icon: '👁️',
      ...results.hyperopia,
      explanation: 'Hyperopia occurs when the eye focuses light behind the retina. This makes close objects appear blurry while distant objects may remain clear.'
    },
    {
      id: 'astigmatism',
      name: 'Astigmatism',
      icon: '⚡',
      ...results.astigmatism,
      explanation: 'Astigmatism is caused by an irregularly shaped cornea or lens, causing blurred or distorted vision at all distances.'
    },
    {
      id: 'colorSensitivity',
      name: 'Color Sensitivity',
      icon: '🎨',
      ...results.colorSensitivity,
      explanation: 'Color vision tests assess your ability to distinguish between different colors and detect any color vision deficiencies.'
    },
    {
      id: 'irisIrregularities',
      name: 'Iris Irregularities',
      icon: '🌀',
      ...results.irisIrregularities,
      explanation: 'Iris irregularities refer to variations in the colored part of your eye, which are usually normal but can sometimes indicate underlying conditions.'
    },
    {
      id: 'dryEyeRisk',
      name: 'Dry Eye Risk',
      icon: '💧',
      ...results.dryEyeRisk,
      explanation: 'Dry eye occurs when your eyes don\'t produce enough tears or produce poor-quality tears. This can cause discomfort and vision problems.'
    }
  ]

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'none': return '#10b981'
      case 'low': return '#f59e0b'
      case 'moderate': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981'
    if (score >= 75) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="results">
      <div className="results-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="results-header"
        >
          <div className="results-badge">
            <div className="badge-icon">✓</div>
            <h1 className="badge-title">Your Vision Results Are Ready</h1>
            {!hasPaid && (
              <div className="payment-prompt">
                <p>🔒 Unlock full detailed report and recommendations</p>
              </div>
            )}
            {hasPaid && (
              <div className="payment-confirmed">
                <p>✓ Premium Report Unlocked</p>
              </div>
            )}
          </div>
        </motion.div>

        <div className="score-summary">
          <h2 className="summary-title">Score Summary</h2>
          <div className="score-rings">
            {conditions.map((condition, index) => (
              <motion.div
                key={condition.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="score-ring-container"
              >
                <div className="score-ring">
                  <svg className="ring-svg" viewBox="0 0 100 100">
                    <circle
                      className="ring-background"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      className="ring-progress"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={getScoreColor(condition.score)}
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - condition.score / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="ring-content">
                    <div className="ring-icon">{condition.icon}</div>
                    <div className="ring-score">{condition.score}</div>
                  </div>
                </div>
                <p className="ring-label">{condition.name.split(' ')[0]}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="insights-section">
          <h2 className="insights-title">Detailed Insights</h2>
          <div className="condition-cards">
            {conditions.map((condition, index) => (
              <motion.div
                key={condition.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`condition-card ${expandedCard === condition.id ? 'expanded' : ''}`}
              >
                <div
                  className="card-header"
                  onClick={() => setExpandedCard(expandedCard === condition.id ? null : condition.id)}
                >
                  <div className="card-title-section">
                    <span className="card-icon">{condition.icon}</span>
                    <div>
                      <h3 className="card-title">{condition.name}</h3>
                      <p className="card-status">{condition.status}</p>
                    </div>
                  </div>
                  <div className="card-actions">
                    {condition.correction && (
                      <span className="correction-badge">Suggested: {condition.correction}</span>
                    )}
                    <span className="expand-icon">
                      {expandedCard === condition.id ? '▼' : '▶'}
                    </span>
                  </div>
                </div>
                {expandedCard === condition.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="card-content"
                  >
                    <div className="explanation">
                      <h4>What does this mean?</h4>
                      <p>{condition.explanation}</p>
                    </div>
                    {condition.correction && (
                      <div className="recommendation">
                        <h4>Recommended Correction</h4>
                        <p>Based on your test results, we recommend a correction of <strong>{condition.correction}</strong>.</p>
                        <p className="recommendation-note">
                          Please consult with a licensed optometrist for a comprehensive eye exam and prescription.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {aiAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="ai-insights-section"
          >
            <h2 className="insights-title">AI Intelligence Insights</h2>
            <div className="ai-insights-grid">
              <div className="ai-insight-card">
                <div className="insight-header">
                  <span className="insight-icon">📊</span>
                  <h3>Population Comparison</h3>
                </div>
                {aiAnalysis.comparisons.population && (
                  <div className="insight-content">
                    <p className="insight-text">
                      Your reaction time is better than{' '}
                      <strong>{Math.round(aiAnalysis.comparisons.population.reactionTimePercentile)}%</strong>{' '}
                      of people your age
                    </p>
                    <p className="insight-text">
                      Focus score: <strong>{Math.round(aiAnalysis.comparisons.population.focusPercentile)}%</strong> percentile
                    </p>
                  </div>
                )}
              </div>

              {aiAnalysis.comparisons.personal?.hasHistory && (
                <div className="ai-insight-card">
                  <div className="insight-header">
                    <span className="insight-icon">📈</span>
                    <h3>Personal Trend</h3>
                  </div>
                  <div className="insight-content">
                    <p className="insight-text">{aiAnalysis.comparisons.personal.message}</p>
                    <p className="insight-text">
                      Trend: <strong>{aiAnalysis.comparisons.personal.trend}</strong>
                    </p>
                  </div>
                </div>
              )}

              <div className="ai-insight-card">
                <div className="insight-header">
                  <span className="insight-icon">🎯</span>
                  <h3>CVIE Scores</h3>
                </div>
                <div className="insight-content">
                  <div className="score-row">
                    <span>Focus Index:</span>
                    <strong>{aiAnalysis.scores.focusIndex}</strong>
                  </div>
                  <div className="score-row">
                    <span>Light Sensitivity:</span>
                    <strong>{aiAnalysis.scores.lightSensitivityIndex}</strong>
                  </div>
                  <div className="score-row">
                    <span>Stability Score:</span>
                    <strong>{aiAnalysis.scores.stabilityScore}</strong>
                  </div>
                  <div className="score-row">
                    <span>Clarity Confidence:</span>
                    <strong>{aiAnalysis.scores.clarityConfidence}%</strong>
                  </div>
                </div>
              </div>
            </div>

            {aiAnalysis.insights && aiAnalysis.insights.length > 0 && (
              <div className="ai-insights-list">
                <h3>Key Insights</h3>
                <ul>
                  {aiAnalysis.insights.map((insight, idx) => (
                    <li key={idx}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="ai-analytics-link">
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/ai-analytics')}
              >
                View Full AI Analytics →
              </button>
            </div>
          </motion.div>
        )}

        <div className="results-actions">
          <button
            className="btn btn-primary btn-large"
            onClick={() => navigate('/payment', { state: { results: location.state?.results } })}
          >
            Unlock Full Report - Pay Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default Results

