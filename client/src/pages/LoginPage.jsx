import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/authStore'

export default function LoginPage() {
  const { signIn, isSupabaseConfigured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
      navigate(location.state?.from || '/closet')
    } catch (err) {
      setError('התחברות נכשלה — בדקי את האימייל והסיסמה.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="page">
        <p className="status status--error">
          האימות לא מוגדר — צריך להגדיר VITE_SUPABASE_URL ו-VITE_SUPABASE_ANON_KEY (ראו supabase/schema.sql).
        </p>
      </div>
    )
  }

  return (
    <div className="page auth-page">
      <h2>התחברות</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          אימייל
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          סיסמה
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="status status--error">{error}</p>}
        <button className="btn btn--primary" type="submit" disabled={loading}>
          {loading ? 'מתחברת...' : 'התחברי'}
        </button>
      </form>
      <p className="auth-switch">
        אין לך חשבון? <Link to="/signup">הרשמה</Link>
      </p>
    </div>
  )
}
