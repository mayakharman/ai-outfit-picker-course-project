import { Link } from 'react-router-dom'

const STEPS = [
  '📷 העלאת תמונות',
  '🔍 זיהוי בגדים בלבד (בלי אקססוריז)',
  '✂️ הפרדה לרקע לבן',
  '👚 בניית ארון דיגיטלי',
  '🌤️ בחירת מזג אוויר / אירוע / סגנון',
  '✨ קבלת לוק מומלץ + הדמיה',
]

export default function HomePage() {
  return (
    <div className="page page--home">
      <h1>AI Outfit Picker</h1>
      <p className="page__subtitle">
        מערכת חכמה שעוזרת לך לבחור מה ללבוש — מעלה תמונות, בונה לך ארון דיגיטלי, ומציעה לוקים מותאמים אישית.
      </p>

      <ol className="steps-list">
        {STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <Link to="/upload" className="btn btn--primary">
        בואי נתחיל — העלאת תמונות
      </Link>
    </div>
  )
}
