import { useState, useEffect } from 'react'

const FaceDetectionDebug = ({ faceDetected, faceMetrics, confidence }) => {
  const [debugInfo, setDebugInfo] = useState({
    mediaDevicesSupported: false,
    cameraPermission: null,
    videoReady: false,
    faceMeshLoaded: false,
    lastDetection: null
  })

  useEffect(() => {
    // Check media devices support
    setDebugInfo(prev => ({
      ...prev,
      mediaDevicesSupported: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
    }))

    // Check if FaceMesh is loaded
    const checkFaceMesh = () => {
      setDebugInfo(prev => ({
        ...prev,
        faceMeshLoaded: typeof window !== 'undefined' && 'FaceMesh' in window
      }))
    }

    checkFaceMesh()
    const interval = setInterval(checkFaceMesh, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (faceDetected) {
      setDebugInfo(prev => ({
        ...prev,
        lastDetection: new Date().toLocaleTimeString()
      }))
    }
  }, [faceDetected])

  // Only show in development
  if (process.env.NODE_ENV !== 'development' && window.location.hostname !== 'localhost') {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#14b8a6' }}>Face Detection Debug</h4>
      
      <div style={{ marginBottom: '5px' }}>
        <strong>Status:</strong> {faceDetected ? '✅ Detected' : '❌ Not Detected'}
      </div>
      
      <div style={{ marginBottom: '5px' }}>
        <strong>Confidence:</strong> {confidence ? `${Math.round(confidence * 100)}%` : 'N/A'}
      </div>
      
      <div style={{ marginBottom: '5px' }}>
        <strong>Media Devices:</strong> {debugInfo.mediaDevicesSupported ? '✅' : '❌'}
      </div>
      
      <div style={{ marginBottom: '5px' }}>
        <strong>FaceMesh Loaded:</strong> {debugInfo.faceMeshLoaded ? '✅' : '❌'}
      </div>
      
      <div style={{ marginBottom: '5px' }}>
        <strong>Last Detection:</strong> {debugInfo.lastDetection || 'Never'}
      </div>
      
      {faceMetrics && (
        <>
          <div style={{ marginBottom: '5px' }}>
            <strong>Face Size:</strong> {Math.round(faceMetrics.faceWidth * 100)}% x {Math.round(faceMetrics.faceHeight * 100)}%
          </div>
          
          {faceMetrics.alignment && (
            <div style={{ marginBottom: '5px' }}>
              <strong>Alignment:</strong> 
              <div style={{ fontSize: '10px', marginLeft: '10px' }}>
                H: {Math.round(faceMetrics.alignment.horizontalOffset * 100)} 
                V: {Math.round(faceMetrics.alignment.verticalOffset * 100)}
              </div>
              <div style={{ fontSize: '10px', marginLeft: '10px' }}>
                {faceMetrics.alignment.isWellAligned ? '✅ Aligned' : '❌ Not Aligned'}
              </div>
            </div>
          )}
        </>
      )}
      
      <div style={{ fontSize: '10px', marginTop: '10px', opacity: 0.7 }}>
        Check browser console for more details
      </div>
    </div>
  )
}

export default FaceDetectionDebug
