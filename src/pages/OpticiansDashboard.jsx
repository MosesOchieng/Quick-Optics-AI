import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import './OpticiansDashboard.css'

const OpticiansDashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [patients, setPatients] = useState([])
  const [stats, setStats] = useState({
    totalPatients: 0,
    testsToday: 0,
    avgScore: 0,
    referrals: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // Load clinic user data
      const userData = await api.getCurrentUser()
      setUser(userData.user)
      
      // Load patient data (mock for now - replace with actual API call)
      // const patientData = await api.getClinicPatients()
      // setPatients(patientData.patients)
      
      // Mock data for demonstration
      setPatients([
        { id: 1, name: 'John Doe', lastTest: '2024-01-15', score: 85, status: 'normal' },
        { id: 2, name: 'Jane Smith', lastTest: '2024-01-14', score: 72, status: 'needs_followup' },
        { id: 3, name: 'Bob Johnson', lastTest: '2024-01-13', score: 90, status: 'normal' }
      ])
      
      setStats({
        totalPatients: 3,
        testsToday: 5,
        avgScore: 82,
        referrals: 1
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return '#10b981'
      case 'needs_followup': return '#f59e0b'
      case 'urgent': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'normal': return 'Normal'
      case 'needs_followup': return 'Needs Follow-up'
      case 'urgent': return 'Urgent'
      default: return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="opticians-dashboard loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  return (
    <div className="opticians-dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Clinic Dashboard</h1>
            <p>Welcome back, {user?.name || 'Clinic Admin'}</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => navigate('/login', { state: { userType: 'clinic' } })}>
              Manage Clinic
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{stats.totalPatients}</h3>
              <p>Total Patients</p>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{stats.testsToday}</h3>
              <p>Tests Today</p>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>{stats.avgScore}%</h3>
              <p>Average Score</p>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="stat-icon">🔔</div>
            <div className="stat-content">
              <h3>{stats.referrals}</h3>
              <p>Referrals</p>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          className="quick-actions-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-card" onClick={() => navigate('/start-test')}>
              <span className="action-icon">👁️</span>
              <span className="action-label">Run Patient Test</span>
            </button>
            <button className="action-card" onClick={() => navigate('/dashboard')}>
              <span className="action-icon">📋</span>
              <span className="action-label">View All Results</span>
            </button>
            <button className="action-card">
              <span className="action-icon">📧</span>
              <span className="action-label">Send Reports</span>
            </button>
            <button className="action-card">
              <span className="action-icon">⚙️</span>
              <span className="action-label">Clinic Settings</span>
            </button>
          </div>
        </motion.div>

        {/* Patients Table */}
        <motion.div
          className="patients-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="section-header">
            <h2>Recent Patients</h2>
            <button className="btn btn-outline">View All</button>
          </div>
          
          <div className="patients-table">
            <table>
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Last Test</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(patient => (
                  <tr key={patient.id}>
                    <td>{patient.name}</td>
                    <td>{new Date(patient.lastTest).toLocaleDateString()}</td>
                    <td>{patient.score}%</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(patient.status) }}
                      >
                        {getStatusLabel(patient.status)}
                      </span>
                    </td>
                    <td>
                      <button className="btn-link">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Licensing Info */}
        <motion.div
          className="licensing-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="licensing-card">
            <h3>🚀 Quick Optics AI for Clinics</h3>
            <p>
              License our advanced AI vision testing technology for your clinic. 
              Provide professional-grade eye health screening to your patients with our comprehensive platform.
            </p>
            <div className="licensing-features">
              <div className="feature-item">
                <span className="feature-icon">✅</span>
                <span>HIPAA Compliant</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✅</span>
                <span>Patient Management</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✅</span>
                <span>Analytics & Reports</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✅</span>
                <span>White-label Options</span>
              </div>
            </div>
            <button className="btn btn-primary">Learn More About Licensing</button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default OpticiansDashboard

