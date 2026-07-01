import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/authStore'

export default function SignupPage() {
  const { signUp, isSupabaseConfigured } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      const data = await signUp(email, password)
      if (data.session) {
        navigate('/closet')
      } else {
        // Supabase requires email confirmation by default — no session yet.
        setInfo('נרשמת בהצלחה! בדקי את האימייל שלך לאישור החשבון, ואז התחברי.')
      }
    } catch (err) {
      setError('ההרשמה נכשלה — ' + (err.message || 'נסי שוב.'))
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
      <h2>הרשמה</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          אימייל
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          סיסמה (לפחות 6 תווים)
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="status status--error">{error}</p>}
        {info && <p className="status status--loading">{info}</p>}
        <button className="btn btn--primary" type="submit" disabled={loading}>
          {loading ? 'נרשמת...' : 'הירשמי'}
        </button>
      </form>
      <p className="auth-switch">
        יש לך כבר חשבון? <Link to="/login">התחברות</Link>
      </p>
    </div>
  )
}
