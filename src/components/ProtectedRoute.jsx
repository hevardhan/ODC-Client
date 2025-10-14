import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export function ProtectedRoute({ children, requireOnboarding = true }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [emailVerified, setEmailVerified] = useState(null)
  const [checkingEmail, setCheckingEmail] = useState(true)

  useEffect(() => {
    const checkEmailVerification = async () => {
      if (!user) {
        setCheckingEmail(false)
        return
      }

      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        setEmailVerified(!!authUser?.email_confirmed_at)
      } catch (error) {
        console.error('Error checking email verification:', error)
        setEmailVerified(false)
      } finally {
        setCheckingEmail(false)
      }
    }

    checkEmailVerification()
  }, [user])

  if (loading || checkingEmail) {
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

  // Logged in but email not verified -> redirect to email verification
  // (except if already on email-verification page)
  if (emailVerified === false && location.pathname !== '/email-verification') {
    return <Navigate to="/email-verification" replace />
  }

  // Email verified but onboarding not completed -> redirect to onboarding
  // (except if already on onboarding page or if route doesn't require onboarding)
  if (
    emailVerified === true && 
    requireOnboarding && 
    user.onboarding_completed === false && 
    location.pathname !== '/onboarding'
  ) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}
