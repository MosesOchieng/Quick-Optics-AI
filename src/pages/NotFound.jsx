import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './NotFound.css'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="not-found">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="not-found-container"
      >
        <div className="not-found-icon">🔍</div>
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Page Not Found</h2>
        <p className="not-found-message">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="not-found-btn primary">
            Go Home
          </Link>
          <button
            className="not-found-btn secondary"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>

        <div className="not-found-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/how-it-works">How It Works</Link>
          <Link to="/profile">Profile</Link>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFound

