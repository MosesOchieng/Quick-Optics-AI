import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import LoadingSpinner from './LoadingSpinner'

const ProtectedRoute = ({ children, requireAuth = false, redirectTo = '/login' }) => {
  const location = useLocation()
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const user = localStorage.getItem('user')

        if (!requireAuth) {
          setIsAuthenticated(true)
          setIsLoading(false)
          return
        }

        if (!token || !user) {
          setIsAuthenticated(false)
          setIsLoading(false)
          return
        }

        // Optionally verify token with backend
        // For now, just check if token exists
        setIsAuthenticated(true)
        setIsLoading(false)
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthenticated(false)
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [requireAuth])

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Checking authentication..." />
  }

  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirect after login
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    )
  }

  return children
}

export default ProtectedRoute

