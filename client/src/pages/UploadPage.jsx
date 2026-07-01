import { useNavigate } from 'react-router-dom'
import ImageUploader from '../components/ImageUploader'

export default function UploadPage() {
  const navigate = useNavigate()

  function handleImagesReady(sourceImages) {
    navigate('/approve', { state: { sourceImages } })
  }

  return (
    <div className="page">
      <h2>העלאת תמונות</h2>
      <p className="page__hint">
        התמונה המקורית שלך נשארת כמו שהיא ולא נחתכת — היא משמשת רק לזיהוי הבגדים. לכל פריט שמזוהה
        נוצרת תמונת מוצר חדשה ונקייה על רקע לבן, בלי האדם, הפנים או הרקע מהתמונה המקורית. המערכת
        תזהה רק פריטי לבוש (חולצות, מכנסיים, חצאיות, שמלות, ג'קטים ונעליים) ותתעלם מכל אקססורי.
      </p>

      <ImageUploader onImagesReady={handleImagesReady} />
    </div>
  )
}
