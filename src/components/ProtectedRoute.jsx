import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

export function ProtectedRoute({ children, requireOnboarding = true }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Not logged in -> redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Onboarding not completed -> redirect to onboarding
  // (except if already on onboarding page or if route doesn't require onboarding)
  if (
    requireOnboarding && 
    user.onboarding_completed === false && 
    location.pathname !== '/onboarding'
  ) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}
