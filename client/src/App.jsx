import { HashRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './store/authStore'
import { ClosetProvider } from './store/closetStore'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import UploadPage from './pages/UploadPage'
import ApproveClothingPage from './pages/ApproveClothingPage'
import ReviewDetectionPage from './pages/ReviewDetectionPage'
import ClosetPage from './pages/ClosetPage'
import OutfitBuilderPage from './pages/OutfitBuilderPage'
import LookResultPage from './pages/LookResultPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <ClosetProvider>
        <HashRouter>
          <Navbar />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <UploadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/approve"
                element={
                  <ProtectedRoute>
                    <ApproveClothingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/review"
                element={
                  <ProtectedRoute>
                    <ReviewDetectionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/closet"
                element={
                  <ProtectedRoute>
                    <ClosetPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/outfit-builder"
                element={
                  <ProtectedRoute>
                    <OutfitBuilderPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/look-result"
                element={
                  <ProtectedRoute>
                    <LookResultPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </HashRouter>
      </ClosetProvider>
    </AuthProvider>
  )
}

export default App
