import { useState, useEffect, useRef } from 'react'
import './ARCalibrationVisualizer.css'

/**
 * AR Calibration Visualizer
 * Shows where AI thinks pupils are and allows tap-to-calibrate
 */
const ARCalibrationVisualizer = ({ 
  gazePoint, 
  faceDetected, 
  onCalibrate,
  landmarks 
}) => {
  const [calibrationMode, setCalibrationMode] = useState(false)
  const [calibrationPoints, setCalibrationPoints] = useState([])
  const [pupilOverlay, setPupilOverlay] = useState(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (landmarks && faceDetected) {
      // Extract pupil positions from landmarks
      const leftIris = landmarks[468]
      const rightIris = landmarks[473]
      
      if (leftIris && rightIris) {
        setPupilOverlay({
          left: { x: leftIris.x, y: leftIris.y },
          right: { x: rightIris.x, y: rightIris.y }
        })
      }
    }
  }, [landmarks, faceDetected])

  const handleTap = (e) => {
    if (!calibrationMode || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    const newPoint = { x, y, timestamp: Date.now() }
    setCalibrationPoints(prev => [...prev, newPoint])

    // After 3 calibration points, apply calibration
    if (calibrationPoints.length >= 2) {
      if (onCalibrate) {
        onCalibrate(calibrationPoints.concat([newPoint]))
      }
      setCalibrationMode(false)
      setCalibrationPoints([])
    }
  }

  const startCalibration = () => {
    setCalibrationMode(true)
    setCalibrationPoints([])
  }

  const cancelCalibration = () => {
    setCalibrationMode(false)
    setCalibrationPoints([])
  }

  if (!faceDetected) return null

  return (
    <div 
      ref={containerRef}
      className={`ar-calibration-overlay ${calibrationMode ? 'calibrating' : ''}`}
      onClick={handleTap}
    >
      {/* Pupil position indicators */}
      {pupilOverlay && (
        <>
          <div 
            className="pupil-marker left-pupil"
            style={{
              left: `${pupilOverlay.left.x * 100}%`,
              top: `${pupilOverlay.left.y * 100}%`
            }}
          >
            <div className="pupil-ring"></div>
            <div className="pupil-center"></div>
            <span className="pupil-label">L</span>
          </div>
          <div 
            className="pupil-marker right-pupil"
            style={{
              left: `${pupilOverlay.right.x * 100}%`,
              top: `${pupilOverlay.right.y * 100}%`
            }}
          >
            <div className="pupil-ring"></div>
            <div className="pupil-center"></div>
            <span className="pupil-label">R</span>
          </div>
        </>
      )}

      {/* Gaze point indicator */}
      {gazePoint && (
        <div 
          className="gaze-indicator"
          style={{
            left: `${gazePoint.x * 100}%`,
            top: `${gazePoint.y * 100}%`
          }}
        />
      )}

      {/* Calibration points */}
      {calibrationPoints.map((point, index) => (
        <div
          key={index}
          className="calibration-point"
          style={{
            left: `${point.x * 100}%`,
            top: `${point.y * 100}%`
          }}
        >
          <div className="calibration-ring"></div>
          <span className="calibration-number">{index + 1}</span>
        </div>
      ))}

      {/* Calibration controls */}
      <div className="calibration-controls">
        {!calibrationMode ? (
          <button 
            className="calibration-btn"
            onClick={startCalibration}
            title="Tap to calibrate pupil detection"
          >
            Calibrate
          </button>
        ) : (
          <div className="calibration-active">
            <span>Tap {3 - calibrationPoints.length} more points to calibrate</span>
            <button 
              className="calibration-cancel"
              onClick={cancelCalibration}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Info overlay */}
      {calibrationMode && (
        <div className="calibration-instructions">
          <p>Tap on your actual pupil centers to improve detection accuracy</p>
        </div>
      )}
    </div>
  )
}

export default ARCalibrationVisualizer

