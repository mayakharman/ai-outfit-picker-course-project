// Asks Claude to pick the outfit itself from the real wardrobe (not just
// explain an already-picked one). Falls back to the local rule-based
// engine (recommendationEngine.js) when mock mode is on, no API key is
// configured, or the request fails — the page never breaks either way.

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE !== 'false'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

const EVENT_LABELS = {
  casual: 'יום-יום',
  work: 'יום עבודה',
  formal: 'אירוע רשמי',
  sport: 'פעילות ספורטיבית',
  party: 'מסיבה',
}

// Returns the unified look-result shape, or null if Claude selection isn't
// available right now (caller should fall back to the local engine).
export async function selectOutfitWithClaude(closetItems, context) {
  if (MOCK_MODE) return null

  try {
    const slimItems = closetItems.map((i) => ({
      id: i.id,
      type: i.type,
      category: i.category,
      color: i.color,
      style: i.style,
      season: i.season,
    }))

    const res = await fetch(`${API_BASE_URL}/api/select-outfit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: slimItems, context }),
    })
    if (!res.ok) throw new Error(`Selection failed: ${res.status}`)
    const data = await res.json()

    const selectedItems = data.selectedItemIds
      .map((id) => closetItems.find((item) => item.id === id))
      .filter(Boolean)

    if (selectedItems.length === 0) return null

    return {
      outfitTitle: data.outfitTitle,
      occasion: data.occasion || EVENT_LABELS[context.event] || 'יום-יום',
      styleDescription: data.styleDescription,
      items: selectedItems,
      whyItWorks: data.whyItWorks,
      colorExplanation: data.colorExplanation,
      stylingTips: data.stylingTips || [],
      alternativeIdea: data.alternativeIdea || '',
      accessories: data.accessories || null,
      isAiSelected: true,
    }
  } catch (err) {
    console.warn('Claude outfit selection unavailable, falling back to local engine:', err)
    return null
  }
}

// Wraps the local recommendationEngine result into the same shape, so the
// UI layer never has to care which path produced the look.
export function toUnifiedLookResult(localResult, context) {
  return {
    outfitTitle: localResult.lookName,
    occasion: EVENT_LABELS[context.event] || 'יום-יום',
    styleDescription: context.style,
    items: localResult.items,
    whyItWorks: localResult.explanation,
    colorExplanation: localResult.colorMatch,
    stylingTips: localResult.stylingTip ? [localResult.stylingTip] : [],
    alternativeIdea: '',
    accessories: null,
    isAiSelected: false,
  }
}
