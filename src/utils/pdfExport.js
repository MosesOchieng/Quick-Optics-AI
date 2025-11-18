/**
 * PDF Export Utility
 * Exports test results and data to PDF format
 */

const exportToPDF = async (data, filename = 'quick-optics-report') => {
  try {
    // Dynamic import of jsPDF to reduce bundle size
    const { default: jsPDF } = await import('jspdf')
    
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPosition = 20

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace = 20) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        doc.addPage()
        yPosition = 20
        return true
      }
      return false
    }

    // Title
    doc.setFontSize(20)
    doc.setTextColor(20, 184, 166) // Teal color
    doc.text('Quick Optics AI - Vision Test Report', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    // Date
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 20

    // User Information
    if (data.user) {
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text('User Information', 20, yPosition)
      yPosition += 10

      doc.setFontSize(10)
      doc.text(`Name: ${data.user.name || 'N/A'}`, 20, yPosition)
      yPosition += 7
      doc.text(`Email: ${data.user.email || 'N/A'}`, 20, yPosition)
      yPosition += 15
    }

    // Test Results
    if (data.testResults) {
      checkPageBreak(30)
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text('Test Results', 20, yPosition)
      yPosition += 10

      doc.setFontSize(10)
      if (Array.isArray(data.testResults)) {
        data.testResults.forEach((result, index) => {
          checkPageBreak(20)
          doc.setFontSize(12)
          doc.text(`${index + 1}. ${result.testName || 'Test'}`, 20, yPosition)
          yPosition += 8
          doc.setFontSize(10)
          doc.text(`Score: ${result.score || 'N/A'}`, 30, yPosition)
          yPosition += 7
          doc.text(`Date: ${result.date || 'N/A'}`, 30, yPosition)
          yPosition += 10
        })
      } else {
        doc.text(`Overall Score: ${data.testResults.overallScore || 'N/A'}`, 20, yPosition)
        yPosition += 7
        doc.text(`Date: ${data.testResults.date || new Date().toLocaleDateString()}`, 20, yPosition)
        yPosition += 10
      }
    }

    // AI Analysis
    if (data.aiAnalysis) {
      checkPageBreak(30)
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text('AI Analysis', 20, yPosition)
      yPosition += 10

      doc.setFontSize(10)
      if (data.aiAnalysis.conditionProbabilities) {
        doc.text('Condition Probabilities:', 20, yPosition)
        yPosition += 8
        data.aiAnalysis.conditionProbabilities.forEach((prob) => {
          checkPageBreak(10)
          doc.text(`${prob.label}: ${prob.value}%`, 30, yPosition)
          yPosition += 7
        })
      }
    }

    // Recommendations
    if (data.recommendations) {
      checkPageBreak(30)
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text('Recommendations', 20, yPosition)
      yPosition += 10

      doc.setFontSize(10)
      if (Array.isArray(data.recommendations)) {
        data.recommendations.forEach((rec) => {
          checkPageBreak(15)
          doc.text(`• ${rec}`, 20, yPosition)
          yPosition += 7
        })
      }
    }

    // Footer
    const totalPages = doc.internal.pages.length - 1
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(
        `Page ${i} of ${totalPages} - Quick Optics AI`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
    }

    // Save PDF
    doc.save(`${filename}-${Date.now()}.pdf`)
    return true
  } catch (error) {
    console.error('PDF export failed:', error)
    
    // Fallback: Create a simple text file
    try {
      const textContent = generateTextReport(data)
      const blob = new Blob([textContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}-${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return true
    } catch (fallbackError) {
      console.error('Text export fallback also failed:', fallbackError)
      return false
    }
  }
}

const generateTextReport = (data) => {
  let report = 'Quick Optics AI - Vision Test Report\n'
  report += '='.repeat(50) + '\n\n'
  report += `Generated: ${new Date().toLocaleString()}\n\n`

  if (data.user) {
    report += 'User Information:\n'
    report += `Name: ${data.user.name || 'N/A'}\n`
    report += `Email: ${data.user.email || 'N/A'}\n\n`
  }

  if (data.testResults) {
    report += 'Test Results:\n'
    if (Array.isArray(data.testResults)) {
      data.testResults.forEach((result, index) => {
        report += `${index + 1}. ${result.testName || 'Test'}\n`
        report += `   Score: ${result.score || 'N/A'}\n`
        report += `   Date: ${result.date || 'N/A'}\n\n`
      })
    } else {
      report += `Overall Score: ${data.testResults.overallScore || 'N/A'}\n`
      report += `Date: ${data.testResults.date || new Date().toLocaleDateString()}\n\n`
    }
  }

  if (data.aiAnalysis) {
    report += 'AI Analysis:\n'
    if (data.aiAnalysis.conditionProbabilities) {
      data.aiAnalysis.conditionProbabilities.forEach((prob) => {
        report += `${prob.label}: ${prob.value}%\n`
      })
    }
    report += '\n'
  }

  report += '\n' + '='.repeat(50) + '\n'
  report += 'This report is for informational purposes only.\n'
  report += 'Please consult with a licensed eye care professional for definitive diagnosis.\n'

  return report
}

export default exportToPDF

