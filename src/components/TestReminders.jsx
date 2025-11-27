import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import testReminders from '../utils/testReminders'
import './TestReminders.css'

const TestReminders = () => {
  const [reminders, setReminders] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    frequency: 'monthly',
    message: 'Time for your regular eye test!'
  })
  const [notificationPermission, setNotificationPermission] = useState('default')

  useEffect(() => {
    loadReminders()
    checkNotificationPermission()
  }, [])

  const loadReminders = () => {
    const loaded = testReminders.getReminders()
    setReminders(loaded)
  }

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
      
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        setNotificationPermission(permission)
      }
    }
  }

  const handleSchedule = () => {
    if (!formData.date) {
      alert('Please select a date')
      return
    }

    const reminderDate = new Date(formData.date)
    if (reminderDate < new Date()) {
      alert('Please select a future date')
      return
    }

    testReminders.scheduleReminder({
      date: reminderDate,
      frequency: formData.frequency,
      message: formData.message
    })

    loadReminders()
    setShowForm(false)
    setFormData({
      date: '',
      frequency: 'monthly',
      message: 'Time for your regular eye test!'
    })
  }

  const handleDelete = (reminderId) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      testReminders.deleteReminder(reminderId)
      loadReminders()
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFrequencyLabel = (frequency) => {
    const labels = {
      once: 'Once',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Every 3 Months'
    }
    return labels[frequency] || frequency
  }

  return (
    <div className="test-reminders">
      <div className="reminders-header">
        <h2 className="reminders-title">Test Reminders</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Schedule Reminder'}
        </button>
      </div>

      {notificationPermission === 'denied' && (
        <div className="notification-warning">
          <span>⚠️</span>
          <p>Notifications are blocked. Please enable them in your browser settings to receive reminders.</p>
        </div>
      )}

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="reminder-form"
        >
          <h3>Schedule New Reminder</h3>
          <div className="form-group">
            <label>Date & Time</label>
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          <div className="form-group">
            <label>Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            >
              <option value="once">Once</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Every 3 Months</option>
            </select>
          </div>
          <div className="form-group">
            <label>Message</label>
            <input
              type="text"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Reminder message"
            />
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleSchedule}>
              Schedule Reminder
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowForm(false)
                setFormData({
                  date: '',
                  frequency: 'monthly',
                  message: 'Time for your regular eye test!'
                })
              }}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="reminders-list">
        {reminders.length === 0 ? (
          <div className="empty-reminders">
            <p>No reminders scheduled</p>
            <p className="hint">Schedule a reminder to stay on top of your eye health</p>
          </div>
        ) : (
          reminders.map((reminder) => {
            const reminderDate = new Date(reminder.date)
            const isPast = reminderDate < new Date()

            return (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`reminder-item ${isPast ? 'past' : ''}`}
              >
                <div className="reminder-content">
                  <div className="reminder-date">
                    <span className="date-icon">📅</span>
                    <div>
                      <strong>{formatDate(reminder.date)}</strong>
                      <span className="frequency-badge">
                        {getFrequencyLabel(reminder.frequency)}
                      </span>
                    </div>
                  </div>
                  <p className="reminder-message">{reminder.message}</p>
                </div>
                <div className="reminder-actions">
                  <button
                    className="btn-icon"
                    onClick={() => {
                      testReminders.addToCalendar(reminder)
                    }}
                    title="Add to Calendar"
                  >
                    📆
                  </button>
                  <button
                    className="btn-icon delete"
                    onClick={() => handleDelete(reminder.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default TestReminders


