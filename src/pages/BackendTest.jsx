import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../utils/api'
import './BackendTest.css'

const BackendTest = () => {
  const [testResults, setTestResults] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [backendStatus, setBackendStatus] = useState('unknown')

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { message, type, timestamp }])
  }

  const updateTestResult = (testName, result) => {
    setTestResults(prev => ({
      ...prev,
      [testName]: result
    }))
  }

  // Test 1: Backend Health Check
  const testBackendHealth = async () => {
    addLog('🏥 Testing backend health check...', 'info')
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/health`)
      
      if (response.ok) {
        const data = await response.json()
        addLog('✅ Backend health check passed', 'success')
        addLog(`Server status: ${data.status}`, 'success')
        addLog(`Features available: ${Object.keys(data.features).join(', ')}`, 'success')
        setBackendStatus('healthy')
        updateTestResult('health', { status: 'success', data })
        return true
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      addLog(`❌ Backend health check failed: ${error.message}`, 'error')
      setBackendStatus('unhealthy')
      updateTestResult('health', { status: 'error', error: error.message })
      return false
    }
  }

  // Test 2: Database Connection
  const testDatabaseConnection = async () => {
    addLog('🗄️ Testing database connection...', 'info')
    
    try {
      // Test by trying to register a test user
      const testUser = {
        name: 'Backend Test User',
        email: `test_${Date.now()}@example.com`,
        password: 'TestPassword123!'
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      })
      
      if (response.ok) {
        const data = await response.json()
        addLog('✅ Database connection working', 'success')
        addLog('✅ User registration endpoint functional', 'success')
        updateTestResult('database', { status: 'success', data })
        return true
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }
    } catch (error) {
      addLog(`❌ Database test failed: ${error.message}`, 'error')
      updateTestResult('database', { status: 'error', error: error.message })
      return false
    }
  }

  // Test 3: CVIE Service
  const testCVIEService = async () => {
    addLog('🧠 Testing CVIE analysis service...', 'info')
    
    try {
      const mockCVIEData = {
        userId: 'test_user',
        sessionId: 'test_session',
        analysisData: {
          focusIndex: 0.85,
          lightSensitivityIndex: 0.72,
          stabilityScore: 0.91,
          clarityConfidence: 0.88,
          blinkRate: 15.2,
          reactionTimeCurve: [0.3, 0.25, 0.22, 0.21]
        }
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/cvie/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCVIEData)
      })
      
      if (response.ok) {
        const data = await response.json()
        addLog('✅ CVIE service working', 'success')
        addLog(`Analysis ID: ${data.analysisId}`, 'success')
        updateTestResult('cvie', { status: 'success', data })
        return true
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      addLog(`❌ CVIE service test failed: ${error.message}`, 'error')
      updateTestResult('cvie', { status: 'error', error: error.message })
      return false
    }
  }

  // Test 4: Cloud Scoring Service
  const testCloudScoring = async () => {
    addLog('☁️ Testing cloud scoring service...', 'info')
    
    try {
      const mockFeatures = {
        features: {
          brightness: 0.75,
          contrast: 0.82,
          sharpness: 0.91,
          symmetry: 0.88,
          pupilSize: 3.2,
          blinkRate: 14.5
        },
        metadata: {
          deviceType: 'mobile',
          timestamp: Date.now()
        }
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/cloud-scoring/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockFeatures)
      })
      
      if (response.ok) {
        const data = await response.json()
        addLog('✅ Cloud scoring service working', 'success')
        addLog(`Confidence: ${data.result.confidence}`, 'success')
        updateTestResult('cloudScoring', { status: 'success', data })
        return true
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      addLog(`❌ Cloud scoring test failed: ${error.message}`, 'error')
      updateTestResult('cloudScoring', { status: 'error', error: error.message })
      return false
    }
  }

  // Test 5: Test Results Storage
  const testResultsStorage = async () => {
    addLog('💾 Testing test results storage...', 'info')
    
    try {
      const mockTestResult = {
        testId: `test_${Date.now()}`,
        userId: 'test_user',
        sessionId: 'test_session',
        testType: 'eye_scan',
        resultsData: {
          overallScore: 85,
          leftEye: { score: 87, conditions: [] },
          rightEye: { score: 83, conditions: [] },
          recommendations: ['Regular eye exams recommended']
        },
        metadata: {
          deviceType: 'mobile',
          duration: 180000
        }
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/tests/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockTestResult)
      })
      
      if (response.ok) {
        const data = await response.json()
        addLog('✅ Test results storage working', 'success')
        addLog(`Stored test ID: ${data.testId}`, 'success')
        updateTestResult('storage', { status: 'success', data })
        return true
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      addLog(`❌ Results storage test failed: ${error.message}`, 'error')
      updateTestResult('storage', { status: 'error', error: error.message })
      return false
    }
  }

  // Test 6: Frontend-Backend Integration
  const testFrontendIntegration = async () => {
    addLog('🔗 Testing frontend-backend integration...', 'info')
    
    try {
      // Test using the api utility
      const testData = await api.getCurrentUser()
      addLog('✅ API utility working', 'success')
      updateTestResult('integration', { status: 'success', data: testData })
      return true
    } catch (error) {
      // This is expected if no user is logged in
      if (error.message.includes('401') || error.message.includes('No token')) {
        addLog('✅ API utility working (no user logged in)', 'success')
        updateTestResult('integration', { status: 'success', note: 'No user logged in (expected)' })
        return true
      } else {
        addLog(`❌ Frontend integration test failed: ${error.message}`, 'error')
        updateTestResult('integration', { status: 'error', error: error.message })
        return false
      }
    }
  }

  // Run all tests
  const runAllTests = async () => {
    setIsLoading(true)
    setLogs([])
    setTestResults({})
    
    addLog('🚀 Starting comprehensive backend tests...', 'info')
    
    const tests = [
      { name: 'Backend Health', fn: testBackendHealth },
      { name: 'Database Connection', fn: testDatabaseConnection },
      { name: 'CVIE Service', fn: testCVIEService },
      { name: 'Cloud Scoring', fn: testCloudScoring },
      { name: 'Results Storage', fn: testResultsStorage },
      { name: 'Frontend Integration', fn: testFrontendIntegration }
    ]
    
    let passedTests = 0
    
    for (const test of tests) {
      addLog(`\n--- Testing ${test.name} ---`, 'info')
      const result = await test.fn()
      if (result) passedTests++
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    addLog(`\n🎉 Tests completed: ${passedTests}/${tests.length} passed`, passedTests === tests.length ? 'success' : 'error')
    
    setIsLoading(false)
  }

  const clearLogs = () => {
    setLogs([])
    setTestResults({})
    setBackendStatus('unknown')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return '#10b981'
      case 'unhealthy': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getTestStatusIcon = (result) => {
    if (!result) return '⏳'
    return result.status === 'success' ? '✅' : '❌'
  }

  return (
    <div className="backend-test-page">
      <div className="test-container">
        <div className="test-header">
          <h1>Backend System Status</h1>
          <p>Comprehensive testing of all backend services and integrations</p>
          
          <div className="status-indicator">
            <div 
              className="status-dot"
              style={{ backgroundColor: getStatusColor(backendStatus) }}
            />
            <span className="status-text">
              Backend Status: {backendStatus === 'healthy' ? 'Healthy' : backendStatus === 'unhealthy' ? 'Issues Detected' : 'Unknown'}
            </span>
          </div>
        </div>

        <div className="test-controls">
          <button 
            className="btn btn-primary btn-large"
            onClick={runAllTests}
            disabled={isLoading}
          >
            {isLoading ? 'Running Tests...' : '🚀 Run All Backend Tests'}
          </button>
          
          <button 
            className="btn btn-outline"
            onClick={clearLogs}
            disabled={isLoading}
          >
            Clear Results
          </button>
        </div>

        <div className="test-results-grid">
          {/* Test Status Overview */}
          <div className="test-overview">
            <h3>Test Results Overview</h3>
            <div className="test-status-grid">
              <div className="status-item">
                <span className="status-icon">{getTestStatusIcon(testResults.health)}</span>
                <span className="status-label">Health Check</span>
              </div>
              <div className="status-item">
                <span className="status-icon">{getTestStatusIcon(testResults.database)}</span>
                <span className="status-label">Database</span>
              </div>
              <div className="status-item">
                <span className="status-icon">{getTestStatusIcon(testResults.cvie)}</span>
                <span className="status-label">CVIE Service</span>
              </div>
              <div className="status-item">
                <span className="status-icon">{getTestStatusIcon(testResults.cloudScoring)}</span>
                <span className="status-label">Cloud Scoring</span>
              </div>
              <div className="status-item">
                <span className="status-icon">{getTestStatusIcon(testResults.storage)}</span>
                <span className="status-label">Data Storage</span>
              </div>
              <div className="status-item">
                <span className="status-icon">{getTestStatusIcon(testResults.integration)}</span>
                <span className="status-label">Integration</span>
              </div>
            </div>
          </div>

          {/* Logs Section */}
          <div className="logs-section">
            <h3>Test Logs</h3>
            <div className="logs-container">
              {logs.length === 0 ? (
                <div className="no-logs">
                  <p>No test logs yet. Run tests to see detailed results.</p>
                </div>
              ) : (
                logs.map((log, index) => (
                  <motion.div
                    key={index}
                    className={`log-entry ${log.type}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <span className="log-timestamp">{log.timestamp}</span>
                    <span className="log-message">{log.message}</span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="detailed-results">
            <h3>Detailed Test Results</h3>
            <div className="results-container">
              <pre className="results-json">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Backend Info */}
        <div className="backend-info">
          <h3>Backend Configuration</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">API URL:</span>
              <span className="value">{process.env.REACT_APP_API_URL || 'http://localhost:5000'}</span>
            </div>
            <div className="info-item">
              <span className="label">Environment:</span>
              <span className="value">{process.env.NODE_ENV || 'development'}</span>
            </div>
            <div className="info-item">
              <span className="label">Frontend Services:</span>
              <span className="value">AI Processor, DITP, CVIE, Local Storage</span>
            </div>
            <div className="info-item">
              <span className="label">Backend Services:</span>
              <span className="value">Auth, Database, Cloud Scoring, CVIE API</span>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Running backend tests...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BackendTest
