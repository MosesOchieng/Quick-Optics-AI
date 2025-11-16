// Local storage utilities for persisting user data

const STORAGE_KEYS = {
  TEST_HISTORY: 'quick_optics_test_history',
  PRESCRIPTIONS: 'quick_optics_prescriptions',
  MEASUREMENTS: 'quick_optics_measurements',
  PROFILE: 'quick_optics_profile',
  PREFERENCES: 'quick_optics_preferences'
}

export const storage = {
  // Test History
  saveTestResult: (testData) => {
    const history = storage.getTestHistory()
    const newTest = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...testData
    }
    history.unshift(newTest)
    localStorage.setItem(STORAGE_KEYS.TEST_HISTORY, JSON.stringify(history))
    return newTest
  },

  getTestHistory: () => {
    const data = localStorage.getItem(STORAGE_KEYS.TEST_HISTORY)
    return data ? JSON.parse(data) : []
  },

  // Prescriptions
  savePrescription: (prescription) => {
    const prescriptions = storage.getPrescriptions()
    const newPrescription = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...prescription
    }
    prescriptions.unshift(newPrescription)
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(prescriptions))
    return newPrescription
  },

  getPrescriptions: () => {
    const data = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS)
    return data ? JSON.parse(data) : []
  },

  // Measurements
  saveMeasurements: (measurements) => {
    localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(measurements))
  },

  getMeasurements: () => {
    const data = localStorage.getItem(STORAGE_KEYS.MEASUREMENTS)
    return data ? JSON.parse(data) : null
  },

  // Profile
  saveProfile: (profile) => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile))
  },

  getProfile: () => {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE)
    return data ? JSON.parse(data) : null
  },

  // Preferences
  savePreferences: (preferences) => {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences))
  },

  getPreferences: () => {
    const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES)
    return data ? JSON.parse(data) : {}
  },

  // Clear all data
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }
}

export default storage

