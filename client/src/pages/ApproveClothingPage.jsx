import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { processClothingImage } from '../services/clothingProcessingService'
import { CATEGORIES, CATEGORY_LABELS, COLOR_OPTIONS, SEASONS, STYLES } from '../data/constants'

function makeCard(sourceImage, index) {
  return {
    id: `${index}-${sourceImage.slice(0, 16)}`,
    sourceImage,
    status: 'processing', // processing | ready | error | approved | cancelled
    image: null,
    items: [],
    error: null,
    manualType: '',
    manualCategory: CATEGORIES[0].key,
  }
}

export default function ApproveClothingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const sourceImages = location.state?.sourceImages

  const [cards, setCards] = useState(() => (sourceImages ? sourceImages.map(makeCard) : []))

  async function runProcessing(index) {
    setCards((prev) => prev.map((c, i) => (i === index ? { ...c, status: 'processing', error: null } : c)))
    const result = await processClothingImage(cards[index].sourceImage)
    setCards((prev) =>
      prev.map((c, i) =>
        i === index
          ? {
              ...c,
              status: result.error ? 'error' : 'ready',
              image: result.image,
              items: result.items,
              isPlaceholder: result.isPlaceholder,
              error: result.error,
            }
          : c
      )
    )
  }

  useEffect(() => {
    if (!sourceImages) return
    sourceImages.forEach((_, index) => runProcessing(index))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!sourceImages) {
    return (
      <div className="page">
        <p>לא נמצאו תמונות לעיבוד.</p>
        <button className="btn" onClick={() => navigate('/upload')}>
          חזרה להעלאה
        </button>
      </div>
    )
  }

  function handleApprove(index) {
    setCards((prev) => prev.map((c, i) => (i === index ? { ...c, status: 'approved' } : c)))
  }

  function handleCancel(index) {
    setCards((prev) => prev.map((c, i) => (i === index ? { ...c, status: 'cancelled' } : c)))
  }

  function updateManual(index, patch) {
    setCards((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)))
  }

  const approvedCards = cards.filter((c) => c.status === 'approved')
  const stillProcessing = cards.some((c) => c.status === 'processing')

  function canApprove(card) {
    if (card.status === 'processing') return false
    if (card.items.length > 0) return true
    return card.manualType.trim().length > 0 // error/empty case needs manual classification
  }

  function handleContinue() {
    const detections = approvedCards.map((card) => {
      const items =
        card.items.length > 0
          ? card.items
          : [
              {
                type: card.manualType,
                category: card.manualCategory,
                color: COLOR_OPTIONS[0].name,
                style: STYLES[0],
                season: SEASONS[0],
                confidence: 1,
              },
            ]
      return {
        sourceImage: card.sourceImage,
        items: items.map((item) => ({
          ...item,
          productImageUrl: card.image,
          needsManualFix: !card.image && !card.isPlaceholder,
        })),
      }
    })
    navigate('/review', { state: { detections } })
  }

  return (
    <div className="page">
      <h2>אישור תמונות מוצר</h2>
      <p className="page__hint">
        כל תמונה עוברת ניקוי רקע ויצירת תמונת מוצר (Photoroom), ואז זיהוי פרטי הפריט (Claude). בדקי
        כל תמונה ואשרי, נסי שוב, או בטלי אותה לפני שממשיכים לארון.
      </p>

      <div className="approve-grid">
        {cards.map((card, index) => (
          <div key={card.id} className={`approve-card approve-card--${card.status}`}>
            <div className="approve-card__images">
              <div className="approve-card__image-col">
                <span className="approve-card__label">מקור</span>
                <img src={card.sourceImage} alt="תמונה מקורית" />
              </div>
              <div className="approve-card__image-col">
                <span className="approve-card__label">תוצאה</span>
                {card.status === 'processing' ? (
                  <div className="item-card__placeholder">
                    <span className="item-card__placeholder-icon">⏳</span>
                    <span>מעבדת (Photoroom + Claude)...</span>
                  </div>
                ) : card.error ? (
                  <div className="item-card__error">
                    <span>⚠️ העיבוד נכשל</span>
                    <p style={{ fontSize: '11px', margin: '4px 0 0' }}>{card.error}</p>
                  </div>
                ) : card.image ? (
                  <img src={card.image} alt="תמונת מוצר" />
                ) : (
                  <div className="item-card__placeholder">
                    <span className="item-card__placeholder-icon">🖼️</span>
                    <span>מצב דמו — אין תמונה אמיתית</span>
                  </div>
                )}
              </div>
            </div>

            {card.items.length > 0 ? (
              <div className="approve-card__details">
                {card.items.map((item, i) => (
                  <div key={i} className="item-card__tags">
                    <span className="tag">{item.type}</span>
                    <span className="tag">{CATEGORY_LABELS[item.category] || item.category}</span>
                    <span className="tag">{item.color}</span>
                    <span className="tag">{item.style}</span>
                    <span className="tag">{item.season}</span>
                  </div>
                ))}
              </div>
            ) : (
              card.status !== 'processing' &&
              card.status !== 'cancelled' && (
                <div className="approve-card__manual">
                  <p className="page__hint" style={{ margin: '0 0 8px' }}>
                    הזיהוי האוטומטי לא החזיר פרטים — סווגי ידנית כדי שאפשר יהיה לאשר את הפריט.
                  </p>
                  <label>
                    שם הפריט
                    <input
                      value={card.manualType}
                      placeholder="למשל חולצה לבנה"
                      onChange={(e) => updateManual(index, { manualType: e.target.value })}
                    />
                  </label>
                  <label>
                    קטגוריה
                    <select
                      value={card.manualCategory}
                      onChange={(e) => updateManual(index, { manualCategory: e.target.value })}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )
            )}

            <div className="approve-card__actions">
              {card.status === 'approved' ? (
                <span className="status status--loading">✅ מאושר</span>
              ) : card.status === 'cancelled' ? (
                <span className="status status--error">בוטל</span>
              ) : (
                <>
                  <button className="btn btn--primary" disabled={!canApprove(card)} onClick={() => handleApprove(index)}>
                    ✅ אישור
                  </button>
                  <button
                    className="btn btn--secondary"
                    disabled={card.status === 'processing'}
                    onClick={() => runProcessing(index)}
                  >
                    🔄 ניסיון נוסף
                  </button>
                  <button
                    className="btn btn--secondary"
                    disabled={card.status === 'processing'}
                    onClick={() => handleCancel(index)}
                  >
                    ✕ ביטול
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn--primary" disabled={stillProcessing || approvedCards.length === 0} onClick={handleContinue}>
        המשיכי לארון עם {approvedCards.length} פריט/ים מאושרים
      </button>
    </div>
  )
}
