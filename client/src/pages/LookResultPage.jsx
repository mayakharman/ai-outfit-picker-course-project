import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCloset } from '../store/closetStore'
import { describeColorMatch } from '../utils/colorUtils'
import OutfitBoard from '../components/OutfitBoard'
import CompleteTheLook from '../components/CompleteTheLook'
import ReplaceItemPicker from '../components/ReplaceItemPicker'
import { COLOR_OPTIONS } from '../data/constants'
import '../styles/LookExperience.css'

export default function LookResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { items: closetItems, saveLook } = useCloset()

  const initialResult = location.state?.result
  const context = location.state?.context

  const [result, setResult] = useState(initialResult)
  const [showReplacePicker, setShowReplacePicker] = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle') // idle | saved

  if (!result) {
    return (
      <div className="page">
        <p>לא נמצאה המלצת לוק.</p>
        <button className="btn" onClick={() => navigate('/outfit-builder')}>
          חזרה לבניית לוק
        </button>
      </div>
    )
  }

  const palette = [...new Set(result.items.map((i) => i.color))]
    .map((name) => COLOR_OPTIONS.find((c) => c.name === name))
    .filter(Boolean)

  function handleReplace(oldItemId, newItem) {
    setResult((prev) => {
      const nextItems = prev.items.map((i) => (i.id === oldItemId ? newItem : i))
      return {
        ...prev,
        items: nextItems,
        colorExplanation: describeColorMatch(nextItems.map((i) => i.color)),
      }
    })
  }

  function handleSave() {
    saveLook(result)
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2500)
  }

  return (
    <div className="page look-reveal">
      <div className="look-reveal__heading">
        {result.isAiSelected && <span className="ai-stylist-badge">✨ AI Stylist Pick</span>}
        <h2>הלוק המושלם שלך מוכן</h2>
        <p className="look-reveal__subtitle">
          {result.styleDescription || `לוק ${context?.style || ''} ל${result.occasion || ''}`}
        </p>
        <div className="look-reveal__tags">
          {result.occasion && <span className="tag tag--pill">{result.occasion}</span>}
          {context?.style && <span className="tag tag--pill">{context.style}</span>}
        </div>
        {palette.length > 0 && (
          <div className="color-palette">
            {palette.map((c) => (
              <span key={c.name} className="color-palette__swatch" style={{ backgroundColor: c.hex }} title={c.name} />
            ))}
          </div>
        )}
      </div>

      <OutfitBoard items={result.items} />

      <CompleteTheLook accessories={result.accessories} />

      <section className="why-it-works">
        <h3>למה הלוק הזה עובד</h3>
        {result.colorExplanation && <p>🎨 {result.colorExplanation}</p>}
        {result.whyItWorks && <p>👗 {result.whyItWorks}</p>}
        {result.stylingTips?.[0] && <p>💡 {result.stylingTips[0]}</p>}
        {result.alternativeIdea && <p className="why-it-works__alt">🔄 {result.alternativeIdea}</p>}
      </section>

      <div className="look-actions">
        <button className="btn btn--primary" onClick={handleSave}>
          {saveStatus === 'saved' ? '✓ נשמר בלוקים שלי' : '💾 שמרי לוק זה'}
        </button>
        <button className="btn btn--secondary" onClick={() => setShowReplacePicker(true)}>
          🔁 החליפי פריט אחד
        </button>
        <button className="btn btn--secondary" onClick={() => navigate('/outfit-builder')}>
          ✨ צרי לוק אחר
        </button>
        <button className="btn btn--secondary" onClick={() => navigate('/closet')}>
          🏠 חזרה לארון
        </button>
      </div>

      {showReplacePicker && (
        <ReplaceItemPicker
          outfitItems={result.items}
          closetItems={closetItems}
          onReplace={handleReplace}
          onClose={() => setShowReplacePicker(false)}
        />
      )}
    </div>
  )
}
