import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeProvider'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'
import { EmailVerification } from '@/pages/EmailVerification'
import { Onboarding } from '@/pages/Onboarding'
import { Dashboard } from '@/pages/Dashboard'
import { Products } from '@/pages/Products'
import { AddEditProduct } from '@/pages/AddEditProduct'
import { Orders } from '@/pages/Orders'
import { Earnings } from '@/pages/Earnings'
import { Settings } from '@/pages/Settings'
import './App.css'

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Email verification - requires auth but not onboarding */}
            <Route path="/email-verification" element={
              <ProtectedRoute requireOnboarding={false}>
                <EmailVerification />
              </ProtectedRoute>
            } />
            
            {/* Onboarding - requires auth and email verification but not completed onboarding */}
            <Route path="/onboarding" element={
              <ProtectedRoute requireOnboarding={false}>
                <Onboarding />
              </ProtectedRoute>
            } />
            
            {/* Main app - requires auth, email verification, and completed onboarding */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="products/add" element={<AddEditProduct />} />
              <Route path="products/edit/:id" element={<AddEditProduct />} />
              <Route path="orders" element={<Orders />} />
              <Route path="earnings" element={<Earnings />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
