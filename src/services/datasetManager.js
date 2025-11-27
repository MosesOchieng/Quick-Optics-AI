// Dataset Management Service for AI Training
class DatasetManager {
  constructor() {
    this.annotations = []
    this.loadAnnotations()
  }

  // Load annotations from localStorage
  loadAnnotations() {
    try {
      const saved = localStorage.getItem('eyeAnnotations')
      if (saved) {
        this.annotations = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Error loading annotations:', error)
      this.annotations = []
    }
  }

  // Save annotations to localStorage
  saveAnnotations() {
    try {
      localStorage.setItem('eyeAnnotations', JSON.stringify(this.annotations))
    } catch (error) {
      console.error('Error saving annotations:', error)
    }
  }

  // Add new annotation
  addAnnotation(annotation) {
    const existingIndex = this.annotations.findIndex(a => a.imageId === annotation.imageId)
    
    if (existingIndex >= 0) {
      this.annotations[existingIndex] = annotation
    } else {
      this.annotations.push(annotation)
    }
    
    this.saveAnnotations()
    return annotation
  }

  // Get all annotations
  getAllAnnotations() {
    return this.annotations
  }

  // Get annotations by condition
  getAnnotationsByCondition(condition) {
    return this.annotations.filter(a => a.condition === condition)
  }

  // Get annotation statistics
  getStatistics() {
    const stats = {
      total: this.annotations.length,
      byCondition: {},
      bySeverity: {},
      averageConfidence: 0,
      landmarkCounts: {}
    }

    let totalConfidence = 0

    this.annotations.forEach(annotation => {
      // Count by condition
      stats.byCondition[annotation.condition] = (stats.byCondition[annotation.condition] || 0) + 1
      
      // Count by severity
      stats.bySeverity[annotation.severity] = (stats.bySeverity[annotation.severity] || 0) + 1
      
      // Sum confidence
      totalConfidence += annotation.confidence || 0
      
      // Count landmarks
      annotation.landmarks?.forEach(landmark => {
        stats.landmarkCounts[landmark.type] = (stats.landmarkCounts[landmark.type] || 0) + 1
      })
    })

    stats.averageConfidence = this.annotations.length > 0 ? totalConfidence / this.annotations.length : 0

    return stats
  }

  // Export annotations in different formats
  exportAnnotations(format = 'json') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    
    switch (format) {
      case 'json':
        return this.exportJSON(timestamp)
      case 'csv':
        return this.exportCSV(timestamp)
      case 'coco':
        return this.exportCOCO(timestamp)
      case 'yolo':
        return this.exportYOLO(timestamp)
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  }

  // Export as JSON
  exportJSON(timestamp) {
    const data = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalAnnotations: this.annotations.length,
        statistics: this.getStatistics()
      },
      annotations: this.annotations
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    this.downloadBlob(blob, `eye_annotations_${timestamp}.json`)
    
    return data
  }

  // Export as CSV
  exportCSV(timestamp) {
    const headers = [
      'imageId', 'imageName', 'condition', 'severity', 'confidence', 
      'notes', 'landmarkCount', 'timestamp'
    ]
    
    const rows = this.annotations.map(annotation => [
      annotation.imageId,
      annotation.imageName,
      annotation.condition,
      annotation.severity,
      annotation.confidence,
      `"${annotation.notes?.replace(/"/g, '""') || ''}"`,
      annotation.landmarks?.length || 0,
      annotation.timestamp
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    this.downloadBlob(blob, `eye_annotations_${timestamp}.csv`)
    
    return csvContent
  }

  // Export in COCO format (for object detection)
  exportCOCO(timestamp) {
    const cocoData = {
      info: {
        description: 'Eye condition dataset annotations',
        version: '1.0',
        year: new Date().getFullYear(),
        contributor: 'Quick Optics AI',
        date_created: new Date().toISOString()
      },
      licenses: [{
        id: 1,
        name: 'Custom License',
        url: ''
      }],
      images: [],
      annotations: [],
      categories: []
    }

    // Create categories from unique landmark types
    const landmarkTypes = new Set()
    this.annotations.forEach(annotation => {
      annotation.landmarks?.forEach(landmark => {
        landmarkTypes.add(landmark.type)
      })
    })

    Array.from(landmarkTypes).forEach((type, index) => {
      cocoData.categories.push({
        id: index + 1,
        name: type,
        supercategory: 'eye_landmark'
      })
    })

    // Process annotations
    let annotationId = 1
    this.annotations.forEach((annotation, imageIndex) => {
      // Add image info
      cocoData.images.push({
        id: annotation.imageId,
        width: 640, // Default width - should be actual image dimensions
        height: 480, // Default height - should be actual image dimensions
        file_name: annotation.imageName,
        license: 1,
        date_captured: new Date(annotation.timestamp).toISOString()
      })

      // Add landmark annotations
      annotation.landmarks?.forEach(landmark => {
        const categoryId = Array.from(landmarkTypes).indexOf(landmark.type) + 1
        
        cocoData.annotations.push({
          id: annotationId++,
          image_id: annotation.imageId,
          category_id: categoryId,
          bbox: [landmark.x - 10, landmark.y - 10, 20, 20], // 20x20 bounding box around point
          area: 400,
          iscrowd: 0,
          keypoints: [landmark.x, landmark.y, 2], // x, y, visibility
          num_keypoints: 1
        })
      })
    })

    const blob = new Blob([JSON.stringify(cocoData, null, 2)], { type: 'application/json' })
    this.downloadBlob(blob, `eye_annotations_coco_${timestamp}.json`)
    
    return cocoData
  }

  // Export in YOLO format
  exportYOLO(timestamp) {
    const yoloData = {
      classes: [],
      annotations: {}
    }

    // Create classes file
    const landmarkTypes = new Set()
    this.annotations.forEach(annotation => {
      annotation.landmarks?.forEach(landmark => {
        landmarkTypes.add(landmark.type)
      })
    })

    yoloData.classes = Array.from(landmarkTypes)

    // Create annotation files for each image
    this.annotations.forEach(annotation => {
      const yoloAnnotations = []
      
      annotation.landmarks?.forEach(landmark => {
        const classId = yoloData.classes.indexOf(landmark.type)
        // Normalize coordinates (assuming 640x480 image)
        const x_center = landmark.x / 640
        const y_center = landmark.y / 480
        const width = 0.03125 // 20/640
        const height = 0.04167 // 20/480
        
        yoloAnnotations.push(`${classId} ${x_center} ${y_center} ${width} ${height}`)
      })
      
      yoloData.annotations[annotation.imageName] = yoloAnnotations.join('\n')
    })

    // Download classes file
    const classesBlob = new Blob([yoloData.classes.join('\n')], { type: 'text/plain' })
    this.downloadBlob(classesBlob, `classes_${timestamp}.txt`)

    // Download annotations as zip would be ideal, but for now download as JSON
    const annotationsBlob = new Blob([JSON.stringify(yoloData.annotations, null, 2)], { type: 'application/json' })
    this.downloadBlob(annotationsBlob, `yolo_annotations_${timestamp}.json`)
    
    return yoloData
  }

  // Helper method to download blob
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Clear all annotations
  clearAllAnnotations() {
    this.annotations = []
    this.saveAnnotations()
  }

  // Import annotations from file
  async importAnnotations(file) {
    try {
      const text = await file.text()
      const importedData = JSON.parse(text)
      
      if (importedData.annotations && Array.isArray(importedData.annotations)) {
        // Merge with existing annotations
        importedData.annotations.forEach(annotation => {
          this.addAnnotation(annotation)
        })
        return { success: true, count: importedData.annotations.length }
      } else if (Array.isArray(importedData)) {
        // Direct array of annotations
        importedData.forEach(annotation => {
          this.addAnnotation(annotation)
        })
        return { success: true, count: importedData.length }
      } else {
        throw new Error('Invalid annotation format')
      }
    } catch (error) {
      console.error('Error importing annotations:', error)
      return { success: false, error: error.message }
    }
  }

  // Validate annotation data
  validateAnnotation(annotation) {
    const required = ['imageId', 'imageName', 'condition']
    const missing = required.filter(field => !annotation[field])
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`)
    }

    if (annotation.landmarks && !Array.isArray(annotation.landmarks)) {
      throw new Error('Landmarks must be an array')
    }

    return true
  }

  // Get training/validation split
  getTrainValidationSplit(validationRatio = 0.2) {
    const shuffled = [...this.annotations].sort(() => Math.random() - 0.5)
    const splitIndex = Math.floor(shuffled.length * (1 - validationRatio))
    
    return {
      training: shuffled.slice(0, splitIndex),
      validation: shuffled.slice(splitIndex),
      trainCount: splitIndex,
      validationCount: shuffled.length - splitIndex
    }
  }
}

// Create singleton instance
const datasetManager = new DatasetManager()

export default datasetManager
