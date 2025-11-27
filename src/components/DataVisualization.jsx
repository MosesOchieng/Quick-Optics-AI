import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import './DataVisualization.css'

const DataVisualization = ({ testHistory = [] }) => {
  const canvasRef = useRef(null)

  // Calculate responsive canvas size
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!canvasRef.current) return
      const container = canvasRef.current.parentElement
      if (container) {
        const width = Math.min(container.offsetWidth, 800)
        canvasRef.current.width = width
        canvasRef.current.height = Math.max(300, width * 0.5)
      }
    }
    
    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

  useEffect(() => {
    if (!canvasRef.current || testHistory.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const width = canvas.width || 600
    const height = canvas.height || 300

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Sort history by date
    const sortedHistory = [...testHistory].sort((a, b) => {
      return new Date(a.date || a.timestamp) - new Date(b.date || b.timestamp)
    })

    if (sortedHistory.length === 0) return

    // Calculate points
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2
    const maxScore = 100
    const minScore = 0

    // Draw grid
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Draw axes
    ctx.strokeStyle = '#6b7280'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // Draw line chart for overall score
    if (sortedHistory.length > 1) {
      ctx.strokeStyle = '#14b8a6'
      ctx.lineWidth = 3
      ctx.beginPath()

      sortedHistory.forEach((test, index) => {
        const x = padding + (chartWidth / (sortedHistory.length - 1)) * index
        const score = test.overallScore || 85
        const y = height - padding - ((score - minScore) / (maxScore - minScore)) * chartHeight

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()

      // Draw points
      ctx.fillStyle = '#14b8a6'
      sortedHistory.forEach((test, index) => {
        const x = padding + (chartWidth / (sortedHistory.length - 1)) * index
        const score = test.overallScore || 85
        const y = height - padding - ((score - minScore) / (maxScore - minScore)) * chartHeight

        ctx.beginPath()
        ctx.arc(x, y, 5, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // Draw labels
    ctx.fillStyle = '#6b7280'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    sortedHistory.forEach((test, index) => {
      const x = padding + (chartWidth / (sortedHistory.length - 1)) * index
      const date = new Date(test.date || test.timestamp)
      const label = `${date.getMonth() + 1}/${date.getDate()}`
      ctx.fillText(label, x, height - padding + 20)
    })

    // Y-axis labels
    ctx.textAlign = 'right'
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * (5 - i)
      const value = minScore + ((maxScore - minScore) / 5) * i
      ctx.fillText(value.toString(), padding - 10, y + 4)
    }
  }, [testHistory])

  if (testHistory.length === 0) {
    return (
      <div className="data-viz-empty">
        <p>No test history available for visualization</p>
        <p className="empty-hint">Take your first test to see trends over time</p>
      </div>
    )
  }

  // Calculate responsive canvas size
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!canvasRef.current) return
      const container = canvasRef.current.parentElement
      if (container) {
        const width = Math.min(container.offsetWidth, 800)
        canvasRef.current.width = width
        canvasRef.current.height = Math.max(300, width * 0.5)
      }
    }
    
    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

  return (
    <div className="data-visualization">
      <h3 className="viz-title">Vision Health Trends</h3>
      <p className="viz-subtitle">Track your vision health over time</p>
      <div className="viz-container">
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          className="trend-chart"
        />
      </div>
      <div className="viz-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#14b8a6' }}></span>
          <span>Overall Vision Score</span>
        </div>
      </div>
      {testHistory.length > 1 && (
        <div className="viz-stats">
          <div className="stat-item">
            <span className="stat-label">Tests Taken</span>
            <span className="stat-value">{testHistory.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average Score</span>
            <span className="stat-value">
              {Math.round(testHistory.reduce((sum, t) => sum + (t.overallScore || 85), 0) / testHistory.length)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Latest Score</span>
            <span className="stat-value">{testHistory[0]?.overallScore || 85}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataVisualization


