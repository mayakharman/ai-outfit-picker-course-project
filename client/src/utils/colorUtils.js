// Lightweight rule-based color-matching table for outfit recommendations.
// Real color theory has infinite nuance; for a student demo we encode the
// handful of pairings a stylist would actually call out.

const NEUTRALS = new Set(['שחור', 'לבן', 'אפור', 'בז\''])

// Curated "goes well together" pairs (kept small and symmetric on purpose).
const GOOD_PAIRS = [
  ['כחול', 'לבן'],
  ['כחול', 'בז\''],
  ['תכלת', 'לבן'],
  ['חום', 'בז\''],
  ['חום', 'תכלת'],
  ['אדום', 'שחור'],
  ['אדום', 'לבן'],
  ['ירוק', 'בז\''],
  ['ירוק', 'לבן'],
  ['צהוב', 'אפור'],
  ['צהוב', 'כחול'],
  ['כתום', 'כחול'],
  ['סגול', 'אפור'],
  ['ורוד', 'אפור'],
  ['ורוד', 'לבן'],
]

const pairKey = (a, b) => [a, b].sort().join('|')
const GOOD_PAIR_SET = new Set(GOOD_PAIRS.map(([a, b]) => pairKey(a, b)))

// Returns a 0-2 compatibility score between two colors.
export function colorCompatibility(colorA, colorB) {
  if (!colorA || !colorB) return 0
  if (colorA === colorB) return 1.5
  if (NEUTRALS.has(colorA) || NEUTRALS.has(colorB)) return 1.5
  if (GOOD_PAIR_SET.has(pairKey(colorA, colorB))) return 1.5
  return 0.3
}

export function describeColorMatch(colors) {
  const unique = [...new Set(colors.filter(Boolean))]
  if (unique.length <= 1) return 'הלוק עקבי בגוון אחד אחיד.'
  const neutralsUsed = unique.filter((c) => NEUTRALS.has(c))
  if (neutralsUsed.length === unique.length) {
    return 'שילוב צבעים נייטרלי שמתאים לכל אירוע.'
  }
  return `הצבעים ${unique.join(', ')} משלימים זה את זה ויוצרים מראה מאוזן.`
}

