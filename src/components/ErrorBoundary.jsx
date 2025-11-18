import React from 'react'
import './ErrorBoundary.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })

    // Log to error tracking service (e.g., Sentry) if available
    if (window.Sentry) {
      window.Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } })
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          onGoHome={() => {
            this.handleReset()
            window.location.href = '/'
          }}
        />
      )
    }

    return this.props.children
  }
}

const ErrorFallback = ({ error, errorInfo, onReset, onGoHome }) => {
  const [showDetails, setShowDetails] = React.useState(false)

  return (
    <div className="error-boundary">
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h1 className="error-title">Something went wrong</h1>
        <p className="error-message">
          We're sorry, but something unexpected happened. Don't worry, your data is safe.
        </p>

        <div className="error-actions">
          <button className="error-btn primary" onClick={onReset}>
            Try Again
          </button>
          <button className="error-btn secondary" onClick={onGoHome}>
            Go Home
          </button>
          <button
            className="error-btn secondary"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="error-details">
            <button
              className="error-toggle"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'Show'} Error Details
            </button>
            {showDetails && (
              <div className="error-stack">
                <h3>Error:</h3>
                <pre>{error?.toString()}</pre>
                {errorInfo && (
                  <>
                    <h3>Component Stack:</h3>
                    <pre>{errorInfo.componentStack}</pre>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ErrorBoundary

