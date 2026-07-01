const MOCK_MODE = import.meta.env.VITE_MOCK_MODE !== 'false'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

// Asks Claude for a short, friendly styling explanation for a chosen outfit.
// Falls back to the local rule-based explanation (recommendationEngine.js)
// if mock mode is on or the request fails, so the UI never breaks.
export async function generateOutfitExplanation(items, context, fallbackText) {
  if (MOCK_MODE) return fallbackText

  try {
    const res = await fetch(`${API_BASE_URL}/api/explain-outfit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, context }),
    })
    if (!res.ok) throw new Error(`Explain failed: ${res.status}`)
    const data = await res.json()
    return data.explanation
  } catch {
    return fallbackText
  }
}

export const isMockMode = MOCK_MODE
