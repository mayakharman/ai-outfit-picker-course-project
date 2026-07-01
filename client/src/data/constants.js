export const CATEGORIES = [
  { key: 'top', label: 'חולצות', icon: '👕' },
  { key: 'bottom', label: 'מכנסיים', icon: '👖' },
  { key: 'skirt', label: 'חצאיות', icon: '👗' },
  { key: 'dress', label: 'שמלות', icon: '👗' },
  { key: 'outerwear', label: 'ג\'קטים / מעילים', icon: '🧥' },
  { key: 'shoes', label: 'נעליים', icon: '👟' },
]

export const CATEGORY_LABELS = CATEGORIES.reduce((acc, c) => {
  acc[c.key] = c.label
  return acc
}, {})

export const STYLES = ['קז\'ואל', 'אלגנטי', 'ספורטיבי', 'רחוב', 'קלאסי']

export const SEASONS = ['קיץ', 'חורף', 'אביב/סתיו', 'כל השנה']

export const WEATHER_OPTIONS = [
  { key: 'hot', label: 'חם', icon: '☀️' },
  { key: 'mild', label: 'נעים', icon: '⛅' },
  { key: 'cold', label: 'קר', icon: '❄️' },
  { key: 'rainy', label: 'גשום', icon: '🌧️' },
]

export const EVENT_OPTIONS = [
  { key: 'casual', label: 'יומיומי' },
  { key: 'work', label: 'עבודה' },
  { key: 'formal', label: 'אירוע רשמי' },
  { key: 'sport', label: 'ספורט' },
  { key: 'party', label: 'מסיבה' },
]

export const COLOR_OPTIONS = [
  { name: 'שחור', hex: '#1a1a1a' },
  { name: 'לבן', hex: '#ffffff' },
  { name: 'אפור', hex: '#9e9e9e' },
  { name: 'בז\'', hex: '#d8c3a5' },
  { name: 'חום', hex: '#6f4e37' },
  { name: 'כחול', hex: '#2b5797' },
  { name: 'תכלת', hex: '#7fb3d5' },
  { name: 'אדום', hex: '#c0392b' },
  { name: 'ירוק', hex: '#3d8c40' },
  { name: 'צהוב', hex: '#e6c200' },
  { name: 'כתום', hex: '#d2691e' },
  { name: 'סגול', hex: '#7d3c98' },
  { name: 'ורוד', hex: '#e6a4b4' },
]

// Mock detection results used when VITE_MOCK_MODE=true (default).
// This lets the whole pipeline run end-to-end with no API keys at all,
// so the class demo never depends on network/API availability.
export const MOCK_DETECTED_ITEMS = [
  {
    type: 'חולצה',
    category: 'top',
    color: 'לבן',
    style: 'קז\'ואל',
    season: 'כל השנה',
    confidence: 0.94,
  },
  {
    type: 'מכנסיים',
    category: 'bottom',
    color: 'כחול',
    style: 'קז\'ואל',
    season: 'כל השנה',
    confidence: 0.91,
  },
  {
    type: 'ג\'קט',
    category: 'outerwear',
    color: 'שחור',
    style: 'אלגנטי',
    season: 'חורף',
    confidence: 0.62,
  },
  {
    type: 'נעליים',
    category: 'shoes',
    color: 'לבן',
    style: 'ספורטיבי',
    season: 'כל השנה',
    confidence: 0.88,
  },
]
