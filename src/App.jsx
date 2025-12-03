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
// VisionTrainer removed - games integrated into VisionTests
import Login from './pages/Login'
import Signup from './pages/Signup'
import Verify from './pages/Verify'
import PaymentConfirmation from './pages/PaymentConfirmation'
import NotFound from './pages/NotFound'
import Settings from './pages/Settings'
import Contact from './pages/Contact'
import PreTestConsultation from './pages/PreTestConsultation'
import TestAI from './pages/TestAI'
import BackendTest from './pages/BackendTest'
import SplashScreen from './pages/SplashScreen'
import FAQ from './pages/FAQ'
import OpticiansDashboard from './pages/OpticiansDashboard'
import ClinicLogin from './pages/ClinicLogin'
import ClinicSignup from './pages/ClinicSignup'
import UserTypeSelection from './pages/UserTypeSelection'
import Layout from './components/Layout'
import InstallPrompt from './components/InstallPrompt'
import { VoiceBotProvider } from './contexts/VoiceBotContext'

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
      <VoiceBotProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <InstallPrompt />
          <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pre-test-consultation" element={<PreTestConsultation />} />
            <Route path="/test-ai" element={<TestAI />} />
            <Route path="/backend-test" element={<BackendTest />} />
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
            {/* VisionTrainer route removed - games integrated into VisionTests */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/clinic-login" element={<ClinicLogin />} />
            <Route path="/clinic-signup" element={<ClinicSignup />} />
            <Route path="/user-type-selection" element={<UserTypeSelection />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/opticians-dashboard" element={<OpticiansDashboard />} />
            <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
      </VoiceBotProvider>
    </ErrorBoundary>
  )
}

export default App

