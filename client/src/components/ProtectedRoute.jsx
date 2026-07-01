import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/authStore'

export default function ProtectedRoute({ children }) {
  const { user, loading, isSupabaseConfigured } = useAuth()
  const location = useLocation()

  // If auth isn't configured at all (no Supabase keys), don't lock the
  // demo out — this keeps the app usable in mock/local-only setups.
  if (!isSupabaseConfigured) return children

  if (loading) {
    return (
      <div className="page">
        <p className="status status--loading">בודקת התחברות...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
