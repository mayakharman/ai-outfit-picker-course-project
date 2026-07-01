// Calls the combined backend pipeline: Photoroom (background removal +
// flat-lay product photo) followed by Claude Vision (garment details) on
// the *processed* image. One uploaded photo in, one clean product photo +
// its detected attributes out.

import { MOCK_DETECTED_ITEMS } from '../data/constants'

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE !== 'false'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

let mockCycle = 0

export async function processClothingImage(sourceImage) {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 1200))
    const item = MOCK_DETECTED_ITEMS[mockCycle % MOCK_DETECTED_ITEMS.length]
    mockCycle += 1
    return { image: null, items: [{ ...item }], isPlaceholder: true, error: null }
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/process-clothing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: sourceImage }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || `שגיאת שרת (${res.status})`)
    }
    const data = await res.json()
    return { image: data.image, items: data.items || [], isPlaceholder: false, error: null }
  } catch (err) {
    console.warn('process-clothing failed:', err)
    return { image: null, items: [], isPlaceholder: false, error: err.message }
  }
}
