import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import datasetManager from '../services/datasetManager'
import './ImageAnnotationTool.css'

const ImageAnnotationTool = ({ onClose, onSave }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [annotations, setAnnotations] = useState({})
  const [currentAnnotation, setCurrentAnnotation] = useState({
    condition: '',
    severity: 'mild',
    landmarks: [],
    notes: '',
    confidence: 1.0
  })
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingMode, setDrawingMode] = useState('landmark') // 'landmark', 'region', 'measurement'
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [savedAnnotations, setSavedAnnotations] = useState([])

  // Sample dataset images for annotation
  const [datasetImages] = useState([
    { id: 1, src: '/Original Dataset/Healthy/Healthy1.jpg', name: 'Healthy1.jpg' },
    { id: 2, src: '/Original Dataset/Myopia/Myopia1.jpg', name: 'Myopia1.jpg' },
    { id: 3, src: '/Original Dataset/Glaucoma/Glaucoma1.jpg', name: 'Glaucoma1.jpg' },
    { id: 4, src: '/Original Dataset/Diabetic Retinopathy/DR1.jpg', name: 'DR1.jpg' },
    { id: 5, src: '/Original Dataset/Central Serous Chorioretinopathy [Color Fundus]/CSCR1.jpg', name: 'CSCR1.jpg' }
  ])

  const conditions = [
    'Healthy', 'Myopia', 'Hyperopia', 'Astigmatism', 'Glaucoma', 
    'Diabetic Retinopathy', 'Macular Degeneration', 'Cataracts', 
    'Central Serous Chorioretinopathy', 'Retinal Detachment'
  ]

  const severityLevels = ['mild', 'moderate', 'severe', 'critical']

  const landmarkTypes = [
    { id: 'optic_disc', name: 'Optic Disc', color: '#ff6b6b' },
    { id: 'macula', name: 'Macula', color: '#4ecdc4' },
    { id: 'fovea', name: 'Fovea', color: '#45b7d1' },
    { id: 'blood_vessel', name: 'Blood Vessel', color: '#96ceb4' },
    { id: 'hemorrhage', name: 'Hemorrhage', color: '#feca57' },
    { id: 'exudate', name: 'Exudate', color: '#ff9ff3' },
    { id: 'drusen', name: 'Drusen', color: '#54a0ff' },
    { id: 'microaneurysm', name: 'Microaneurysm', color: '#5f27cd' }
  ]

  const [selectedLandmarkType, setSelectedLandmarkType] = useState(landmarkTypes[0])

  useEffect(() => {
    // Load existing annotations from dataset manager
    setSavedAnnotations(datasetManager.getAllAnnotations())
  }, [])

  useEffect(() => {
    if (imageLoaded && canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current
      const image = imageRef.current
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      
      // Draw existing annotations
      redrawAnnotations()
    }
  }, [imageLoaded, currentImageIndex])

  const handleImageLoad = () => {
    setImageLoaded(true)
    // Load existing annotation for this image if available
    const imageId = datasetImages[currentImageIndex].id
    const existing = annotations[imageId]
    if (existing) {
      setCurrentAnnotation(existing)
    } else {
      setCurrentAnnotation({
        condition: '',
        severity: 'mild',
        landmarks: [],
        notes: '',
        confidence: 1.0
      })
    }
  }

  const handleCanvasClick = (e) => {
    if (!canvasRef.current || !imageRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    if (drawingMode === 'landmark') {
      const newLandmark = {
        id: Date.now(),
        type: selectedLandmarkType.id,
        name: selectedLandmarkType.name,
        x: x,
        y: y,
        color: selectedLandmarkType.color
      }

      setCurrentAnnotation(prev => ({
        ...prev,
        landmarks: [...prev.landmarks, newLandmark]
      }))

      drawLandmark(x, y, selectedLandmarkType.color, selectedLandmarkType.name)
    }
  }

  const drawLandmark = (x, y, color, name) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Draw circle
    ctx.beginPath()
    ctx.arc(x, y, 8, 0, 2 * Math.PI)
    ctx.fillStyle = color
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
    
    // Draw label
    ctx.fillStyle = '#fff'
    ctx.font = '12px Arial'
    ctx.fillText(name, x + 12, y - 5)
  }

  const redrawAnnotations = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw all landmarks
    currentAnnotation.landmarks.forEach(landmark => {
      drawLandmark(landmark.x, landmark.y, landmark.color, landmark.name)
    })
  }

  const saveAnnotation = () => {
    const imageId = datasetImages[currentImageIndex].id
    const annotationData = {
      ...currentAnnotation,
      imageId,
      imageName: datasetImages[currentImageIndex].name,
      timestamp: Date.now()
    }

    try {
      // Validate and save using dataset manager
      datasetManager.validateAnnotation(annotationData)
      datasetManager.addAnnotation(annotationData)
      
      // Update local state
      setAnnotations(prev => ({
        ...prev,
        [imageId]: annotationData
      }))
      
      setSavedAnnotations(datasetManager.getAllAnnotations())
      alert('Annotation saved successfully!')
    } catch (error) {
      alert(`Error saving annotation: ${error.message}`)
    }
  }

  const exportAnnotations = (format = 'json') => {
    try {
      datasetManager.exportAnnotations(format)
    } catch (error) {
      alert(`Error exporting annotations: ${error.message}`)
    }
  }

  const clearCurrentAnnotation = () => {
    setCurrentAnnotation({
      condition: '',
      severity: 'mild',
      landmarks: [],
      notes: '',
      confidence: 1.0
    })
    redrawAnnotations()
  }

  const removeLandmark = (landmarkId) => {
    setCurrentAnnotation(prev => ({
      ...prev,
      landmarks: prev.landmarks.filter(l => l.id !== landmarkId)
    }))
  }

  const nextImage = () => {
    if (currentImageIndex < datasetImages.length - 1) {
      setCurrentImageIndex(prev => prev + 1)
      setImageLoaded(false)
    }
  }

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1)
      setImageLoaded(false)
    }
  }

  return (
    <div className="annotation-overlay">
      <motion.div 
        className="annotation-tool"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="annotation-header">
          <h2>Eye Image Annotation Tool</h2>
          <div className="annotation-controls">
            <div className="export-controls">
              <select 
                onChange={(e) => exportAnnotations(e.target.value)}
                defaultValue=""
                className="export-format-select"
              >
                <option value="" disabled>Export Format</option>
                <option value="json">JSON ({savedAnnotations.length})</option>
                <option value="csv">CSV</option>
                <option value="coco">COCO Format</option>
                <option value="yolo">YOLO Format</option>
              </select>
              <button 
                onClick={() => {
                  const stats = datasetManager.getStatistics()
                  alert(`Dataset Statistics:\n\nTotal Annotations: ${stats.total}\nAverage Confidence: ${(stats.averageConfidence * 100).toFixed(1)}%\n\nBy Condition:\n${Object.entries(stats.byCondition).map(([k,v]) => `${k}: ${v}`).join('\n')}`)
                }}
                className="btn-stats"
              >
                📊 Stats
              </button>
            </div>
            <button onClick={onClose} className="btn-close">×</button>
          </div>
        </div>

        <div className="annotation-content">
          <div className="image-section">
            <div className="image-navigation">
              <button onClick={prevImage} disabled={currentImageIndex === 0}>
                ← Previous
              </button>
              <span>
                {currentImageIndex + 1} / {datasetImages.length} - {datasetImages[currentImageIndex].name}
              </span>
              <button onClick={nextImage} disabled={currentImageIndex === datasetImages.length - 1}>
                Next →
              </button>
            </div>

            <div className="image-container">
              <img
                ref={imageRef}
                src={datasetImages[currentImageIndex].src}
                alt="Eye scan"
                onLoad={handleImageLoad}
                className="annotation-image"
              />
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="annotation-canvas"
              />
            </div>
          </div>

          <div className="annotation-panel">
            <div className="annotation-form">
              <div className="form-group">
                <label>Condition</label>
                <select
                  value={currentAnnotation.condition}
                  onChange={(e) => setCurrentAnnotation(prev => ({ ...prev, condition: e.target.value }))}
                >
                  <option value="">Select condition</option>
                  {conditions.map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Severity</label>
                <select
                  value={currentAnnotation.severity}
                  onChange={(e) => setCurrentAnnotation(prev => ({ ...prev, severity: e.target.value }))}
                >
                  {severityLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Confidence</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={currentAnnotation.confidence}
                  onChange={(e) => setCurrentAnnotation(prev => ({ ...prev, confidence: parseFloat(e.target.value) }))}
                />
                <span>{(currentAnnotation.confidence * 100).toFixed(0)}%</span>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={currentAnnotation.notes}
                  onChange={(e) => setCurrentAnnotation(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional observations..."
                  rows={3}
                />
              </div>
            </div>

            <div className="landmark-tools">
              <h3>Landmarks</h3>
              <div className="landmark-types">
                {landmarkTypes.map(type => (
                  <button
                    key={type.id}
                    className={`landmark-btn ${selectedLandmarkType.id === type.id ? 'active' : ''}`}
                    style={{ borderColor: type.color }}
                    onClick={() => setSelectedLandmarkType(type)}
                  >
                    <span className="landmark-color" style={{ backgroundColor: type.color }}></span>
                    {type.name}
                  </button>
                ))}
              </div>

              <div className="landmark-list">
                <h4>Current Landmarks ({currentAnnotation.landmarks.length})</h4>
                {currentAnnotation.landmarks.map(landmark => (
                  <div key={landmark.id} className="landmark-item">
                    <span className="landmark-color" style={{ backgroundColor: landmark.color }}></span>
                    <span>{landmark.name}</span>
                    <button onClick={() => removeLandmark(landmark.id)}>×</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="annotation-actions">
              <button onClick={saveAnnotation} className="btn-save">
                Save Annotation
              </button>
              <button onClick={clearCurrentAnnotation} className="btn-clear">
                Clear All
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ImageAnnotationTool
