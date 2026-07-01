import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCloset } from '../store/closetStore'
import { recommendOutfit } from '../utils/recommendationEngine'
import { generateOutfitExplanation } from '../services/claudeService'
import { selectOutfitWithClaude, toUnifiedLookResult } from '../services/outfitSelectionService'
import FindingYourLookLoader from '../components/FindingYourLookLoader'
import { COLOR_OPTIONS, EVENT_OPTIONS, STYLES, WEATHER_OPTIONS } from '../data/constants'

export default function OutfitBuilderPage() {
  const navigate = useNavigate()
  const { items } = useCloset()
  const [weather, setWeather] = useState('mild')
  const [event, setEvent] = useState('casual')
  const [style, setStyle] = useState(STYLES[0])
  const [preferredColors, setPreferredColors] = useState([])
  const [loading, setLoading] = useState(false)

  function toggleColor(name) {
    setPreferredColors((prev) => (prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]))
  }

  async function handleSubmit() {
    const context = { weather, event, style, preferredColors }
    setLoading(true)

    // Let Claude pick the actual outfit from the real wardrobe. If that's
    // unavailable (mock mode, no key, request failure) fall back to the
    // local rule-based engine — the page always ends up with a result.
    let result = await selectOutfitWithClaude(items, context)
    if (!result) {
      const localResult = recommendOutfit(items, context)
      const explanation = await generateOutfitExplanation(localResult.items, context, localResult.explanation)
      result = toUnifiedLookResult({ ...localResult, explanation }, context)
    }

    setLoading(false)
    navigate('/look-result', { state: { result, context } })
  }

  if (items.length === 0) {
    return (
      <div className="page">
        <p>הארון שלך ריק — צריך להוסיף פריטים לפני בניית לוק.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page">
        <FindingYourLookLoader />
      </div>
    )
  }

  return (
    <div className="page">
      <h2>בניית לוק חדש</h2>

      <div className="form-section">
        <h3>מזג אוויר</h3>
        <div className="chip-row">
          {WEATHER_OPTIONS.map((w) => (
            <button
              key={w.key}
              className={'chip' + (weather === w.key ? ' chip--active' : '')}
              onClick={() => setWeather(w.key)}
            >
              {w.icon} {w.label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h3>סוג אירוע</h3>
        <div className="chip-row">
          {EVENT_OPTIONS.map((e) => (
            <button
              key={e.key}
              className={'chip' + (event === e.key ? ' chip--active' : '')}
              onClick={() => setEvent(e.key)}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h3>סגנון אישי</h3>
        <div className="chip-row">
          {STYLES.map((s) => (
            <button key={s} className={'chip' + (style === s ? ' chip--active' : '')} onClick={() => setStyle(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h3>צבעים מועדפים (אופציונלי)</h3>
        <div className="chip-row">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.name}
              className={'chip color-chip' + (preferredColors.includes(c.name) ? ' chip--active' : '')}
              style={{ '--chip-color': c.hex }}
              onClick={() => toggleColor(c.name)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <button className="btn btn--primary" onClick={handleSubmit}>
        ✨ מצאי לי לוק
      </button>
    </div>
  )
}
