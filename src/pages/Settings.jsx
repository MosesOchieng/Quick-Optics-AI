import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Toast from '../components/Toast'
import ConfirmationDialog from '../components/ConfirmationDialog'
import './Settings.css'

const Settings = () => {
  const [settings, setSettings] = useState({
    theme: 'dark',
    notifications: true,
    voiceGuidance: true,
    language: 'en',
    dataExport: false,
    autoSave: true
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    // Load saved settings
    const saved = localStorage.getItem('app_settings')
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load settings:', e)
      }
    }
  }, [])

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('app_settings', JSON.stringify(newSettings))
    setSuccessMessage('Settings saved!')
    setShowSuccess(true)
  }

  const handleExportData = () => {
    try {
      const testHistory = JSON.parse(localStorage.getItem('test_history') || '[]')
      const userData = localStorage.getItem('user_data')
      const cvieData = localStorage.getItem('cvie_analysis')

      const exportData = {
        testHistory,
        userData: userData ? JSON.parse(userData) : null,
        cvieData: cvieData ? JSON.parse(cvieData) : null,
        exportDate: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `quick-optics-data-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setSuccessMessage('Data exported successfully!')
      setShowSuccess(true)
    } catch (error) {
      console.error('Export failed:', error)
      setSuccessMessage('Export failed. Please try again.')
      setShowSuccess(true)
    }
  }

  const handleClearData = () => {
    setShowClearDialog(true)
  }

  const confirmClearData = async () => {
    setClearing(true)
    try {
      // Clear all localStorage data
      localStorage.clear()
      setSuccessMessage('All data cleared!')
      setShowSuccess(true)
      setShowClearDialog(false)
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
    } catch (error) {
      console.error('Clear data failed:', error)
      setSuccessMessage('Failed to clear data. Please try again.')
      setShowSuccess(true)
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="settings-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="settings-container"
      >
        <h1 className="settings-title">Settings</h1>

        <div className="settings-section">
          <h2 className="section-title">Appearance</h2>
          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">Theme</label>
              <span className="setting-description">Choose your preferred theme</span>
            </div>
            <select
              className="setting-control"
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Notifications</h2>
          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">Enable Notifications</label>
              <span className="setting-description">Receive notifications for test reminders</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Voice & Audio</h2>
          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">Voice Guidance</label>
              <span className="setting-description">Enable voice instructions during tests</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.voiceGuidance}
                onChange={(e) => handleSettingChange('voiceGuidance', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Language</h2>
          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">Language</label>
              <span className="setting-description">Select your preferred language</span>
            </div>
            <select
              className="setting-control"
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Data Management</h2>
          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">Auto-save Results</label>
              <span className="setting-description">Automatically save test results</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">Export Data</label>
              <span className="setting-description">Download all your data as JSON</span>
            </div>
            <button className="setting-btn" onClick={handleExportData}>
              Export Data
            </button>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">Clear All Data</label>
              <span className="setting-description warning">This will delete all local data</span>
            </div>
            <button className="setting-btn danger" onClick={handleClearData}>
              Clear Data
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">About</h2>
          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">App Version</label>
              <span className="setting-description">Quick Optics AI v1.0.0</span>
            </div>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">Privacy Policy</label>
              <span className="setting-description">View our privacy policy</span>
            </div>
            <a href="/privacy" className="setting-link">
              View Policy
            </a>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">Terms of Service</label>
              <span className="setting-description">Read our terms of service</span>
            </div>
            <a href="/terms" className="setting-link">
              View Terms
            </a>
          </div>
        </div>
      </motion.div>

      {showSuccess && (
        <Toast
          message={successMessage}
          type="success"
          onClose={() => setShowSuccess(false)}
        />
      )}

      <ConfirmationDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={confirmClearData}
        title="Clear All Data"
        message="Are you sure you want to clear all local data? This will delete all test results, settings, and saved information. This action cannot be undone."
        confirmLabel="Clear All Data"
        cancelLabel="Cancel"
        variant="danger"
        loading={clearing}
      />
    </div>
  )
}

export default Settings

