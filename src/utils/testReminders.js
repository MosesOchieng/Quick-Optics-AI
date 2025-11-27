/**
 * Test Reminders & Calendar Integration
 * Handles scheduling test reminders and calendar integration
 */

class TestReminderManager {
  constructor() {
    this.reminders = this.loadReminders()
  }

  loadReminders() {
    try {
      const stored = localStorage.getItem('test_reminders')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading reminders:', error)
      return []
    }
  }

  saveReminders() {
    try {
      localStorage.setItem('test_reminders', JSON.stringify(this.reminders))
    } catch (error) {
      console.error('Error saving reminders:', error)
    }
  }

  /**
   * Schedule a test reminder
   * @param {Object} options - Reminder options
   * @param {Date} options.date - When to remind
   * @param {string} options.frequency - 'once', 'weekly', 'monthly', 'quarterly'
   * @param {string} options.message - Custom reminder message
   * @returns {string} - Reminder ID
   */
  scheduleReminder({ date, frequency = 'once', message = 'Time for your eye test!' }) {
    const reminderId = `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const reminder = {
      id: reminderId,
      date: date.toISOString(),
      frequency,
      message,
      enabled: true,
      createdAt: new Date().toISOString()
    }

    this.reminders.push(reminder)
    this.saveReminders()
    this.scheduleNotification(reminder)
    this.addToCalendar(reminder)

    return reminderId
  }

  /**
   * Schedule browser notification
   */
  async scheduleNotification(reminder) {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications')
      return
    }

    // Request permission if not granted
    if (Notification.permission === 'default') {
      await Notification.requestPermission()
    }

    if (Notification.permission === 'granted') {
      const reminderDate = new Date(reminder.date)
      const now = new Date()
      const timeUntil = reminderDate.getTime() - now.getTime()

      if (timeUntil > 0) {
        setTimeout(() => {
          new Notification('Quick Optics AI - Eye Test Reminder', {
            body: reminder.message,
            icon: '/Logo.jpeg',
            badge: '/Logo.jpeg',
            tag: reminder.id,
            requireInteraction: true
          })

          // Handle recurring reminders
          if (reminder.frequency !== 'once') {
            this.scheduleNextRecurring(reminder)
          }
        }, timeUntil)
      }
    }
  }

  /**
   * Schedule next occurrence for recurring reminders
   */
  scheduleNextRecurring(reminder) {
    const currentDate = new Date(reminder.date)
    let nextDate

    switch (reminder.frequency) {
      case 'weekly':
        nextDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)
        break
      case 'monthly':
        nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate())
        break
      case 'quarterly':
        nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, currentDate.getDate())
        break
      default:
        return
    }

    const nextReminder = {
      ...reminder,
      id: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: nextDate.toISOString()
    }

    this.reminders.push(nextReminder)
    this.saveReminders()
    this.scheduleNotification(nextReminder)
  }

  /**
   * Add reminder to calendar (Google Calendar, Apple Calendar, etc.)
   */
  addToCalendar(reminder) {
    const reminderDate = new Date(reminder.date)
    const endDate = new Date(reminderDate.getTime() + 30 * 60 * 1000) // 30 minutes duration

    // Format dates for calendar
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const calendarData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Quick Optics AI//Eye Test Reminder//EN',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(reminderDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${reminder.message}`,
      `DESCRIPTION:Quick Optics AI Eye Test Reminder\n\nTime for your regular eye health screening.`,
      'LOCATION:Quick Optics AI App',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')

    // Create downloadable .ics file
    const blob = new Blob([calendarData], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `eye-test-reminder-${reminder.id}.ics`
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Get all reminders
   */
  getReminders() {
    return this.reminders.filter(r => r.enabled)
  }

  /**
   * Cancel a reminder
   */
  cancelReminder(reminderId) {
    const index = this.reminders.findIndex(r => r.id === reminderId)
    if (index !== -1) {
      this.reminders[index].enabled = false
      this.saveReminders()
    }
  }

  /**
   * Delete a reminder
   */
  deleteReminder(reminderId) {
    this.reminders = this.reminders.filter(r => r.id !== reminderId)
    this.saveReminders()
  }

  /**
   * Get upcoming reminders
   */
  getUpcomingReminders(limit = 5) {
    const now = new Date()
    return this.reminders
      .filter(r => r.enabled && new Date(r.date) > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, limit)
  }
}

export default new TestReminderManager()


