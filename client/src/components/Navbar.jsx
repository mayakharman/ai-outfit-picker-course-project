import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/authStore'

const links = [
  { to: '/', label: 'בית' },
  { to: '/upload', label: 'העלאת תמונות' },
  { to: '/closet', label: 'הארון שלי' },
  { to: '/outfit-builder', label: 'בניית לוק' },
]

export default function Navbar() {
  const { user, signOut, isSupabaseConfigured } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="navbar__brand">👗 AI Outfit Picker</div>
      <nav className="navbar__links">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => 'navbar__link' + (isActive ? ' navbar__link--active' : '')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      {isSupabaseConfigured && (
        <div className="navbar__auth">
          {user ? (
            <>
              <span className="navbar__user">{user.email}</span>
              <button className="navbar__logout" onClick={handleLogout}>
                התנתקות
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="navbar__link">
                התחברות
              </NavLink>
              <NavLink to="/signup" className="navbar__link">
                הרשמה
              </NavLink>
            </>
          )}
        </div>
      )}
    </header>
  )
}
