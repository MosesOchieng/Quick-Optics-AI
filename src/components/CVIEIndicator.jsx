import { motion } from 'framer-motion'
import cvie from '../services/CVIE'
import './CVIEIndicator.css'

/**
 * CVIE Indicator Component
 * Shows that AI is actively analyzing
 */
const CVIEIndicator = ({ isActive, confidence }) => {
  if (!isActive) return null

  const confidenceLevel = confidence?.level || 'medium'
  const confidenceScore = confidence?.score || 75

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="cvie-indicator"
    >
      <div className="cvie-header">
        <div className="cvie-icon">🧠</div>
        <div className="cvie-text">
          <span className="cvie-label">CVIE Active</span>
          <span className="cvie-status">Analyzing patterns...</span>
        </div>
      </div>
      {confidence && (
        <div className="cvie-confidence">
          <div className="confidence-bar">
            <motion.div
              className={`confidence-fill ${confidenceLevel}`}
              initial={{ width: 0 }}
              animate={{ width: `${confidenceScore}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="confidence-text">
            {confidenceScore}% confidence - {confidenceLevel}
          </span>
        </div>
      )}
    </motion.div>
  )
}

export default CVIEIndicator

