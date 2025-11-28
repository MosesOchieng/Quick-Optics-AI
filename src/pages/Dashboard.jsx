import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import storage from '../utils/storage'
import api from '../utils/api'
import EmptyState from '../components/EmptyState'
import VoiceBot from '../components/VoiceBot'
import TestReminders from '../components/TestReminders'
import DataVisualization from '../components/DataVisualization'
import './Dashboard.css'

const Dashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [testHistory, setTestHistory] = useState([])
  const [recentTest, setRecentTest] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDate, setFilterDate] = useState('all') // 'all', 'week', 'month', 'year'

  useEffect(() => {
    // Load current user from backend session (optional - don't redirect if not authenticated)
    const loadUser = async () => {
      try {
        const data = await api.getCurrentUser()
        setUser(data.user)
        localStorage.setItem('user_data', JSON.stringify(data.user))
      } catch (err) {
        // If not authenticated, try to load from localStorage
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser))
          } catch (e) {
            console.log('No saved user data')
          }
        }
        // Don't redirect - allow using the app without login
      }
    }
    loadUser()

    // Load test history
    const history = storage.getTestHistory()
    setTestHistory(history)
    if (history.length > 0) {
      setRecentTest(history[0])
    }
  }, [])

  const getOverallScore = () => {
    if (!recentTest) return 0
    return recentTest.overallScore || 85
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const getFilteredHistory = () => {
    let filtered = [...testHistory]

    // Filter by date
    if (filterDate !== 'all') {
      const now = Date.now()
      const filterMap = {
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        year: 365 * 24 * 60 * 60 * 1000
      }
      const cutoff = now - filterMap[filterDate]
      filtered = filtered.filter(test => {
        const testDate = new Date(test.timestamp || Date.now()).getTime()
        return testDate >= cutoff
      })
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(test => {
        const dateStr = new Date(test.timestamp || Date.now()).toLocaleDateString()
        const scoreStr = String(test.overallScore || '')
        return dateStr.includes(query) || scoreStr.includes(query)
      })
    }

    return filtered
  }

  const coreTests = [
    { id: 'myopia', label: 'Myopia (short‑sightedness)', icon: '🔍' },
    { id: 'hyperopia', label: 'Hyperopia (long‑sightedness)', icon: '🕶️' },
    { id: 'astigmatism', label: 'Astigmatism', icon: '✨' },
    { id: 'color', label: 'Color vision', icon: '🎨' }
  ]

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome back{user?.name ? `, ${user.name}` : ''}!</h1>
          <p>Your personal vision health companion</p>
        </div>

        {/* Pre-Test Consultation Card */}
        <motion.div
          className="consultation-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="consultation-icon">🩺</div>
          <div className="consultation-content">
            <h3>Ready for your vision assessment?</h3>
            <p>Let Dr. AI explain the process and recommend the best tests for you</p>
            <div className="consultation-actions">
              <button 
                className="btn btn-primary consultation-btn"
                onClick={() => navigate('/pre-test-consultation')}
              >
                Start Consultation
              </button>
            </div>
          </div>
        </motion.div>

        {/* Test Reminders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <TestReminders />
        </motion.div>

        {recentTest ? (
          <div className="dashboard-content">
            <motion.div
              className="score-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="score-circle">
                <svg className="score-svg" viewBox="0 0 120 120">
                  <circle
                    className="score-bg"
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                  />
                  <circle
                    className="score-progress"
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke={getScoreColor(getOverallScore())}
                    strokeWidth="10"
                    strokeDasharray={`${(getOverallScore() / 100) * 314} 314`}
                    strokeDashoffset="78.5"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="score-value">
                  <span className="score-number">{getOverallScore()}</span>
                  <span className="score-label">Overall Score</span>
                </div>
              </div>
              <div className="score-details">
                <p className="score-date">
                  Last test: {new Date(recentTest.timestamp || Date.now()).toLocaleDateString()}
                </p>
                <p className="score-status">
                  {getOverallScore() >= 80 ? '✓ Good' : getOverallScore() >= 60 ? '⚠ Fair' : '⚠ Needs Attention'}
                </p>
              </div>
            </motion.div>

            <motion.div
              className="quick-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2>Quick Actions</h2>
              <div className="actions-grid">
                <button
                  className="action-card"
                  onClick={() => navigate('/eye-scan')}
                >
                  <span className="action-icon">👁️</span>
                  <span className="action-label">Start Eye Scan</span>
                </button>
                <button
                  className="action-card"
                  onClick={() => navigate('/results')}
                >
                  <span className="action-icon">📊</span>
                  <span className="action-label">View Results</span>
                </button>
                <button
                  className="action-card"
                  onClick={() => navigate('/vision-trainer')}
                >
                  <span className="action-icon">🎮</span>
                  <span className="action-label">Vision Trainer</span>
                </button>
                <button
                  className="action-card"
                  onClick={() => navigate('/profile')}
                >
                  <span className="action-icon">👤</span>
                  <span className="action-label">Profile</span>
                </button>
              </div>
            </motion.div>

            {testHistory.length > 0 && (
              <motion.div
                className="test-history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="history-header">
                <h2>Recent Tests</h2>
                  <div className="history-filters">
                    <input
                      type="text"
                      placeholder="Search tests..."
                      className="history-search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <select
                      className="history-filter"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                    >
                      <option value="all">All Time</option>
                      <option value="week">Last Week</option>
                      <option value="month">Last Month</option>
                      <option value="year">Last Year</option>
                    </select>
                  </div>
                </div>
                {getFilteredHistory().length > 0 ? (
                <div className="history-list">
                    {getFilteredHistory().slice(0, 5).map((test, index) => (
                    <div key={index} className="history-item">
                      <div className="history-date">
                        {new Date(test.timestamp || Date.now()).toLocaleDateString()}
                      </div>
                      <div className="history-score">
                        Score: {test.overallScore || 85}
                      </div>
                      <button
                        className="history-view"
                        onClick={() => navigate('/results', { state: { results: test.results } })}
                      >
                        View →
                      </button>
                    </div>
                  ))}
                </div>
                ) : (
                  <EmptyState
                    icon="🔍"
                    title="No tests found"
                    message="Try adjusting your search or filter criteria."
                    actionLabel="Clear Filters"
                    onAction={() => {
                      setSearchQuery('')
                      setFilterDate('all')
                    }}
                  />
                )}
              </motion.div>
            )}

            {/* Data Visualization */}
            {testHistory.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <DataVisualization testHistory={testHistory} />
              </motion.div>
            )}

            <motion.div
              className="test-hub"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2>Test Hub</h2>
              <p className="test-hub-subtitle">
                Jump back into the core Quick Optics AI tests any time.
              </p>
              <div className="test-hub-grid">
                {coreTests.map(test => (
                  <button
                    key={test.id}
                    className="test-hub-card"
                    onClick={() => navigate('/vision-tests')}
                  >
                    <span className="test-hub-icon">{test.icon}</span>
                    <span className="test-hub-label">{test.label}</span>
                    <span className="test-hub-cta">Open tests →</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <EmptyState
            icon="👁️"
            title="No eye health data yet"
            message="Run your first eye scan to unlock your AI eye health overview and track your vision health over time."
            actionLabel="Start Eye Scan"
            onAction={() => navigate('/eye-scan')}
          />
        )}
      </div>
      
      {/* Floating Voice Bot */}
      <div className="dashboard-voice-bot">
        <VoiceBot 
          screenContent={{
            title: 'Dashboard',
            description: 'Your vision health overview and test history'
          }}
        />
      </div>
    </div>
  )
}

export default Dashboard
