import './LoadingSpinner.css'

const LoadingSpinner = ({ size = 'medium', message, fullScreen = false }) => {
  const sizeClass = `spinner-${size}`
  const containerClass = fullScreen ? 'spinner-fullscreen' : 'spinner-container'

  return (
    <div className={containerClass}>
      <div className={`spinner ${sizeClass}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  )
}

export default LoadingSpinner

