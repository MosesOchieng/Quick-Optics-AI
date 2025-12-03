import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import './OpticiansDashboard.css'

const OpticiansDashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [clinic, setClinic] = useState(null)
  const [patients, setPatients] = useState([])
  const [stats, setStats] = useState({
    totalPatients: 0,
    testsToday: 0,
    activeLicenses: 0,
    totalLicenses: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignForm, setAssignForm] = useState({ patientEmail: '', notes: '' })
  const [assignLoading, setAssignLoading] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load clinic dashboard data
      const dashboardData = await api.getClinicDashboard()
      setClinic(dashboardData.clinic)
      setStats(dashboardData.stats)
      setPatients(dashboardData.recentPatients || [])
      
      // Get user from localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      setUser(userData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // If unauthorized, redirect to login
      if (error.message.includes('401') || error.message.includes('403')) {
        navigate('/clinic-login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAssignLicense = async (e) => {
    e.preventDefault()
    if (!assignForm.patientEmail) {
      alert('Please enter patient email')
      return
    }

    setAssignLoading(true)
    try {
      const response = await api.assignPatientLicense(assignForm.patientEmail, assignForm.notes)
      alert(`License assigned successfully! License Code: ${response.license.licenseCode}`)
      setShowAssignModal(false)
      setAssignForm({ patientEmail: '', notes: '' })
      loadDashboardData() // Refresh data
    } catch (error) {
      alert(error.message || 'Failed to assign license')
    } finally {
      setAssignLoading(false)
    }
  }

  const handleRevokeLicense = async (patientId) => {
    if (!confirm('Are you sure you want to revoke this patient\'s license?')) {
      return
    }

    try {
      await api.revokePatientLicense(patientId)
      alert('License revoked successfully')
      loadDashboardData() // Refresh data
    } catch (error) {
      alert(error.message || 'Failed to revoke license')
    }
  }

  const handleViewPatientResults = async (patientId) => {
    try {
      const results = await api.getPatientResults(patientId)
      // Navigate to results page or show in modal
      navigate(`/patient-results/${patientId}`, { state: { results } })
    } catch (error) {
      alert(error.message || 'Failed to load patient results')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981'
      case 'revoked': return '#ef4444'
      case 'expired': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
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
            <p>Welcome back, {clinic?.clinicName || user?.name || 'Clinic Admin'}</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-primary" 
              onClick={() => setShowAssignModal(true)}
            >
              + Assign License
            </button>
            <button 
              className="btn btn-outline" 
              onClick={() => {
                localStorage.clear()
                navigate('/clinic-login')
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* License Info Banner */}
        {clinic && (
          <motion.div
            className="license-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="license-info">
              <div>
                <h3>License: {clinic.licenseTier?.toUpperCase() || 'BASIC'}</h3>
                <p>
                  {clinic.activePatients} / {clinic.maxPatients} patients active
                  {clinic.maxPatients - clinic.activePatients > 0 && (
                    <span className="available-slots">
                      {' '}({clinic.maxPatients - clinic.activePatients} slots available)
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="license-expiry">
                  Expires: {formatDate(clinic.licenseExpires)}
                  {new Date(clinic.licenseExpires) < new Date() && (
                    <span className="expired-badge"> EXPIRED</span>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        )}

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
            <div className="stat-icon">🔑</div>
            <div className="stat-content">
              <h3>{stats.activeLicenses}</h3>
              <p>Active Licenses</p>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>{stats.totalLicenses}</h3>
              <p>Total Licenses</p>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => setActiveTab('patients')}
          >
            All Patients
          </button>
          <button
            className={`tab ${activeTab === 'license' ? 'active' : ''}`}
            onClick={() => setActiveTab('license')}
          >
            License Info
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <motion.div
            className="tab-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Quick Actions */}
            <div className="quick-actions-section">
              <h2>Quick Actions</h2>
              <div className="actions-grid">
                <button 
                  className="action-card" 
                  onClick={() => navigate('/eye-scan')}
                >
                  <span className="action-icon">👁️</span>
                  <span className="action-label">Run Patient Test</span>
                </button>
                <button 
                  className="action-card" 
                  onClick={() => setActiveTab('patients')}
                >
                  <span className="action-icon">📋</span>
                  <span className="action-label">View All Patients</span>
                </button>
                <button 
                  className="action-card"
                  onClick={() => setShowAssignModal(true)}
                >
                  <span className="action-icon">🔑</span>
                  <span className="action-label">Assign License</span>
                </button>
                <button 
                  className="action-card"
                  onClick={() => setActiveTab('license')}
                >
                  <span className="action-icon">⚙️</span>
                  <span className="action-label">License Settings</span>
                </button>
              </div>
            </div>

            {/* Recent Patients */}
            <div className="patients-section">
              <div className="section-header">
                <h2>Recent Patients</h2>
                <button 
                  className="btn btn-outline"
                  onClick={() => setActiveTab('patients')}
                >
                  View All
                </button>
              </div>
              
              <div className="patients-table">
                <table>
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Email</th>
                      <th>Last Test</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.length > 0 ? (
                      patients.map(patient => (
                        <tr key={patient.id}>
                          <td>{patient.name}</td>
                          <td>{patient.email}</td>
                          <td>{formatDate(patient.lastTest)}</td>
                          <td>
                            <span 
                              className="status-badge"
                              style={{ backgroundColor: getStatusColor(patient.status) }}
                            >
                              {patient.status || 'active'}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn-link"
                              onClick={() => handleViewPatientResults(patient.id)}
                            >
                              View Results
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                          No patients yet. Assign a license to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'patients' && (
          <motion.div
            className="tab-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="patients-section">
              <div className="section-header">
                <h2>All Patients</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAssignModal(true)}
                >
                  + Assign New License
                </button>
              </div>
              
              <div className="patients-table">
                <table>
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Email</th>
                      <th>License Code</th>
                      <th>Assigned</th>
                      <th>Last Test</th>
                      <th>Total Tests</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.length > 0 ? (
                      patients.map(patient => (
                        <tr key={patient.id}>
                          <td>{patient.name}</td>
                          <td>{patient.email}</td>
                          <td>
                            <code className="license-code">
                              {patient.licenseCode || 'N/A'}
                            </code>
                          </td>
                          <td>{formatDate(patient.assignedAt)}</td>
                          <td>{formatDate(patient.lastTest)}</td>
                          <td>{patient.totalTests || 0}</td>
                          <td>
                            <span 
                              className="status-badge"
                              style={{ backgroundColor: getStatusColor(patient.status) }}
                            >
                              {patient.status || 'active'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="btn-link"
                                onClick={() => handleViewPatientResults(patient.id)}
                              >
                                View
                              </button>
                              <button 
                                className="btn-link text-danger"
                                onClick={() => handleRevokeLicense(patient.id)}
                              >
                                Revoke
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                          No patients assigned yet. Click "Assign New License" to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'license' && (
          <motion.div
            className="tab-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="licensing-section">
              <div className="licensing-card">
                <h3>🚀 Quick Optics AI for Clinics</h3>
                <p>
                  License our advanced AI vision testing technology for your clinic. 
                  Provide professional-grade eye health screening to your patients with our comprehensive platform.
                </p>
                
                {clinic && (
                  <div className="license-details">
                    <div className="detail-row">
                      <span className="detail-label">License Tier:</span>
                      <span className="detail-value">{clinic.licenseTier?.toUpperCase() || 'BASIC'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Max Patients:</span>
                      <span className="detail-value">{clinic.maxPatients}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Active Patients:</span>
                      <span className="detail-value">{clinic.activePatients}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Available Slots:</span>
                      <span className="detail-value">{clinic.maxPatients - clinic.activePatients}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">License Expires:</span>
                      <span className="detail-value">{formatDate(clinic.licenseExpires)}</span>
                    </div>
                  </div>
                )}

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
                <button className="btn btn-primary">Upgrade License</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Assign License Modal */}
        {showAssignModal && (
          <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Assign License to Patient</h2>
              <form onSubmit={handleAssignLicense}>
                <div className="form-group">
                  <label>Patient Email</label>
                  <input
                    type="email"
                    value={assignForm.patientEmail}
                    onChange={(e) => setAssignForm({ ...assignForm, patientEmail: e.target.value })}
                    placeholder="patient@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Notes (Optional)</label>
                  <textarea
                    value={assignForm.notes}
                    onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                    placeholder="Additional notes about this patient..."
                    rows={3}
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowAssignModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={assignLoading}
                  >
                    {assignLoading ? 'Assigning...' : 'Assign License'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OpticiansDashboard
