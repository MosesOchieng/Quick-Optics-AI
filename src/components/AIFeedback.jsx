import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import cvie from '../services/CVIE'
import './AIFeedback.css'

const AIFeedback = ({ scanData, onAdjustment }) => {
  const [feedback, setFeedback] = useState(null)
  const [confidence, setConfidence] = useState(null)

  useEffect(() => {
    if (scanData) {
      // Get real-time feedback
      const realTimeFeedback = cvie.provideRealTimeFeedback(scanData)
      setFeedback(realTimeFeedback)

      // Calculate confidence
      const confidenceData = cvie.calculateConfidence(scanData)
      setConfidence(confidenceData)

      // Trigger adjustments if needed
      if (realTimeFeedback.adjustments.length > 0 && onAdjustment) {
        onAdjustment(realTimeFeedback.adjustments[0])
      }
    }
  }, [scanData, onAdjustment])

  if (!feedback && !confidence) return null

  return (
    <div className="ai-feedback">
      <AnimatePresence>
        {feedback?.adjustments.map((adjustment, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`feedback-item ${adjustment.type}`}
          >
            <span className="feedback-icon">
              {adjustment.type === 'alignment' && '📐'}
              {adjustment.type === 'lighting' && '💡'}
              {adjustment.type === 'stability' && '🤲'}
            </span>
            <span className="feedback-message">{adjustment.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {confidence && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="confidence-indicator"
        >
          <div className="confidence-label">AI Confidence</div>
          <div className={`confidence-badge ${confidence.level}`}>
            {confidence.score}% - {confidence.level.toUpperCase()}
          </div>
          {confidence.recommendations.length > 0 && (
            <div className="confidence-recommendations">
              {confidence.recommendations.map((rec, idx) => (
                <div key={idx} className="recommendation-item">• {rec}</div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default AIFeedback

