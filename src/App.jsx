import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import HowItWorks from './pages/HowItWorks'
import Onboarding from './pages/Onboarding'
import StartTest from './pages/StartTest'
import EyeScan from './pages/EyeScan'
import VisionTests from './pages/VisionTests'
import MiniGames from './pages/MiniGames'
import Results from './pages/Results'
import EyewearRecommendation from './pages/EyewearRecommendation'
import ARTryOn from './pages/ARTryOn'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import Payment from './pages/Payment'
import AIAnalytics from './pages/AIAnalytics'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import VisionTrainer from './pages/VisionTrainer'
import Login from './pages/Login'
import Signup from './pages/Signup'
import PaymentConfirmation from './pages/PaymentConfirmation'
import NotFound from './pages/NotFound'
import Settings from './pages/Settings'
import Contact from './pages/Contact'
import Layout from './components/Layout'
import InstallPrompt from './components/InstallPrompt'

function App() {
  useEffect(() => {
    // Service worker is auto-registered by vite-plugin-pwa
    // Install prompt is now handled by InstallPrompt component
    
    // Global error handler for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      // Could send to error tracking service here
    })

    // Global error handler for uncaught errors
    window.addEventListener('error', (event) => {
      console.error('Uncaught error:', event.error)
      // Could send to error tracking service here
    })
  }, [])

  return (
    <ErrorBoundary>
      <Router>
        <InstallPrompt />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/start-test" element={<StartTest />} />
            <Route path="/eye-scan" element={<EyeScan />} />
            <Route path="/vision-tests" element={<VisionTests />} />
            <Route path="/mini-games" element={<MiniGames />} />
            <Route path="/results" element={<Results />} />
            <Route path="/eyewear" element={<EyewearRecommendation />} />
            <Route path="/ar-try-on" element={<ARTryOn />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payment" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <Payment />
                </ProtectedRoute>
              } 
            />
            <Route path="/ai-analytics" element={<AIAnalytics />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/vision-trainer" element={<VisionTrainer />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  )
}

export default App

