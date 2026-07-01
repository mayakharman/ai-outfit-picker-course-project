import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCloset } from '../store/closetStore'
import { CATEGORIES, COLOR_OPTIONS, SEASONS, STYLES } from '../data/constants'

// Items arriving here already went through /approve — Photoroom (and
// Claude, for detection) already ran. This page is only for reviewing and
// editing the result before saving; it never (re)generates an image.
function flattenDetections(detections) {
  const rows = []
  detections.forEach(({ sourceImage, items }) => {
    items.forEach((detected, i) => {
      rows.push({
        tempId: `${sourceImage.slice(0, 16)}-${i}`,
        sourceImage,
        name: detected.type,
        type: detected.type,
        category: detected.category,
        color: detected.color,
        style: detected.style,
        season: detected.season,
        confidence: detected.confidence,
        productImageUrl: detected.productImageUrl || null,
        needsManualFix: detected.needsManualFix || false,
        error: detected.error || null,
      })
    })
  })
  return rows
}

export default function ReviewDetectionPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { addItems } = useCloset()
  const detections = location.state?.detections

  const [rows, setRows] = useState(() => (detections ? flattenDetections(detections) : []))

  if (!detections) {
    return (
      <div className="page">
        <p>לא נמצאו תמונות לבדיקה.</p>
        <button className="btn" onClick={() => navigate('/upload')}>
          חזרה להעלאה
        </button>
      </div>
    )
  }

  function updateRow(tempId, patch) {
    setRows((prev) => prev.map((r) => (r.tempId === tempId ? { ...r, ...patch } : r)))
  }

  async function handleSaveAll() {
    const toSave = rows.map((r) => ({
      id: crypto.randomUUID(),
      name: r.name,
      type: r.type,
      category: r.category,
      color: r.color,
      style: r.style,
      season: r.season,
      sourceImage: r.sourceImage,
      productImageUrl: r.productImageUrl,
      needsManualFix: r.needsManualFix,
      error: r.error,
    }))
    await addItems(toSave)
    navigate('/closet')
  }

  return (
    <div className="page">
      <h2>בדיקת הפריטים שזוהו</h2>
      <p className="page__hint">
        אפשר לערוך כל פריט לפני ההוספה לארון. אקססוריז לא מוצגים — המערכת מתעלמת מהם. לכל פריט נוצרת
        תמונת מוצר חדשה ונקייה — התמונה המקורית שלך לא נחתכת ולא משתנה.
      </p>

      <div className="review-grid">
        {rows.map((row) => (
          <div key={row.tempId} className="review-card">
            <div className="review-card__image">
              {row.needsManualFix ? (
                <div className="item-card__manual-fix">
                  <span>⚠️ נדרש תיקון ידני</span>
                  {row.error && <p style={{ fontSize: '11px', margin: '4px 0 0' }}>{row.error}</p>}
                </div>
              ) : row.error ? (
                <div className="item-card__error">
                  <span>⚠️ יצירת התמונה נכשלה</span>
                  <p style={{ fontSize: '11px', margin: '4px 0 0' }}>{row.error}</p>
                </div>
              ) : row.productImageUrl ? (
                <img src={row.productImageUrl} alt={row.name} />
              ) : (
                <div className="item-card__manual-fix">
                  <span>⚠️ נדרש תיקון ידני</span>
                </div>
              )}
            </div>

            <label>
              שם הפריט
              <input value={row.name} onChange={(e) => updateRow(row.tempId, { name: e.target.value })} />
            </label>

            <label>
              קטגוריה
              <select value={row.category} onChange={(e) => updateRow(row.tempId, { category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              צבע (זוהה אוטומטית, ניתן לשנות)
              <select value={row.color} onChange={(e) => updateRow(row.tempId, { color: e.target.value })}>
                {COLOR_OPTIONS.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              סגנון
              <select value={row.style} onChange={(e) => updateRow(row.tempId, { style: e.target.value })}>
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label>
              עונה
              <select value={row.season} onChange={(e) => updateRow(row.tempId, { season: e.target.value })}>
                {SEASONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))}
      </div>

      <button className="btn btn--primary" onClick={handleSaveAll}>
        הוסיפי הכל לארון הדיגיטלי
      </button>
    </div>
  )
}
