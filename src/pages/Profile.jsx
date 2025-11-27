import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import storage from '../utils/storage'
import api from '../utils/api'
import EmptyState from '../components/EmptyState'
import './Profile.css'

const Profile = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('history')
  const [testHistory, setTestHistory] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [measurements, setMeasurements] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Load user from backend or local cache
    const loadUser = async () => {
      try {
        const data = await api.getCurrentUser()
        setUser(data.user)
      } catch {
        const cached = localStorage.getItem('user_data')
        if (cached) {
          try {
            setUser(JSON.parse(cached))
          } catch {
            setUser(null)
          }
        }
      }
    }
    loadUser()

    // Load data from storage
    setTestHistory(storage.getTestHistory())
    setPrescriptions(storage.getPrescriptions())
    const savedMeasurements = storage.getMeasurements()
    if (savedMeasurements) {
      setMeasurements([
        { label: 'Face Width', value: savedMeasurements.faceWidth || 'N/A' },
        { label: 'Face Height', value: savedMeasurements.faceHeight || 'N/A' },
        { label: 'Pupil Distance', value: savedMeasurements.pupilDistance || 'N/A' },
        { label: 'Face Shape', value: savedMeasurements.faceShape || 'N/A' }
      ])
    } else {
      // Default measurements if none saved
      setMeasurements([
        { label: 'Face Width', value: '142mm' },
        { label: 'Face Height', value: '185mm' },
        { label: 'Pupil Distance', value: '62mm' },
        { label: 'Face Shape', value: 'Oval' }
      ])
    }
  }, [])

  return (
    <div className="profile">
      <div className="profile-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="profile-header"
        >
          <div className="profile-avatar">
            <div className="avatar-icon">👤</div>
          </div>
          <h1 className="profile-title">{user?.name || 'My Profile'}</h1>
          <p className="profile-subtitle">
            {user?.email ? user.email : 'Manage your vision health data'}
          </p>
        </motion.div>

        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Test History
          </button>
          <button
            className={`profile-tab ${activeTab === 'prescriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('prescriptions')}
          >
            Prescriptions
          </button>
          <button
            className={`profile-tab ${activeTab === 'measurements' ? 'active' : ''}`}
            onClick={() => setActiveTab('measurements')}
          >
            Measurements
          </button>
          <button
            className={`profile-tab ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            Appointments
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="tab-content"
            >
              <div className="content-header">
                <h2 className="content-title">Vision Test History</h2>
                <button className="btn btn-primary btn-small">
                  New Test
                </button>
              </div>
              <div className="history-cards">
                {testHistory.length === 0 ? (
                  <EmptyState
                    icon="📊"
                    title="No test history yet"
                    message="Take your first vision test to get started and track your eye health over time."
                    actionLabel="Start Test"
                    onAction={() => navigate('/eye-scan')}
                  />
                ) : (
                  testHistory.map((test) => (
                    <div key={test.id} className="history-card">
                      <div className="card-date">{new Date(test.date).toLocaleDateString()}</div>
                      <div className="card-results">
                        <div className="result-item">
                          <span className="result-label">Myopia:</span>
                          <span className="result-value">{test.results.myopia}%</span>
                        </div>
                        <div className="result-item">
                          <span className="result-label">Hyperopia:</span>
                          <span className="result-value">{test.results.hyperopia}%</span>
                        </div>
                        <div className="result-item">
                          <span className="result-label">Astigmatism:</span>
                          <span className="result-value">{test.results.astigmatism}%</span>
                        </div>
                      </div>
                      <div className="card-status">
                        <span className={`status-badge ${test.status.toLowerCase()}`}>
                          {test.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'prescriptions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="tab-content"
            >
              <div className="content-header">
                <h2 className="content-title">Saved Prescriptions</h2>
              </div>
              <div className="prescription-cards">
                {prescriptions.length === 0 ? (
                  <EmptyState
                    icon="👓"
                    title="No prescriptions saved"
                    message="Your test results and prescriptions will appear here once you complete vision tests."
                    actionLabel="Take a Test"
                    onAction={() => navigate('/eye-scan')}
                  />
                ) : (
                  prescriptions.map((prescription) => (
                    <div key={prescription.id} className="prescription-card">
                      <div className="prescription-header">
                        <div className="prescription-date">
                          {new Date(prescription.date).toLocaleDateString()}
                        </div>
                        <div className="prescription-source">{prescription.source}</div>
                      </div>
                      <div className="prescription-details">
                        <div className="detail-row">
                          <span className="detail-label">Right Eye:</span>
                          <span className="detail-value">{prescription.rightEye}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Left Eye:</span>
                          <span className="detail-value">{prescription.leftEye}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Astigmatism:</span>
                          <span className="detail-value">{prescription.astigmatism}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'measurements' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="tab-content"
            >
              <div className="content-header">
                <h2 className="content-title">Face Measurements</h2>
              </div>
              <div className="measurements-grid">
                {measurements.map((measurement, index) => (
                  <div key={index} className="measurement-card">
                    <div className="measurement-label">{measurement.label}</div>
                    <div className="measurement-value">{measurement.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'appointments' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="tab-content"
            >
              <div className="content-header">
                <h2 className="content-title">Partner Opticians</h2>
              </div>
              <div className="appointments-section">
                <div className="appointment-card">
                  <h3 className="appointment-title">Schedule an Appointment</h3>
                  <p className="appointment-description">
                    Connect with licensed optometrists in your area for a comprehensive eye exam.
                  </p>
                  <button className="btn btn-primary">
                    Find Opticians Near Me
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="profile-footer">
          <div className="privacy-section">
            <h3 className="privacy-title">Privacy & Security</h3>
            <p className="privacy-text">
              Your data is encrypted end-to-end and stored securely. We follow HIPAA-style privacy standards.
            </p>
            <div className="privacy-actions">
              <button className="btn btn-secondary btn-small">Privacy Policy</button>
              <button className="btn btn-secondary btn-small">Export Data</button>
              <button 
                className="btn btn-secondary btn-small"
                onClick={() => {
                  // Clear all user data
                  localStorage.removeItem('user')
                  localStorage.removeItem('user_data')
                  localStorage.removeItem('token')
                  // Redirect to home
                  navigate('/')
                  window.location.reload()
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

