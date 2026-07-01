import { colorCompatibility, describeColorMatch } from './colorUtils'

// weather -> which seasons are acceptable, and whether a jacket is required
const WEATHER_RULES = {
  hot: { seasons: ['קיץ', 'כל השנה'], needsJacket: false },
  mild: { seasons: ['אביב/סתיו', 'כל השנה'], needsJacket: false },
  cold: { seasons: ['חורף', 'כל השנה'], needsJacket: true },
  rainy: { seasons: ['חורף', 'אביב/סתיו', 'כל השנה'], needsJacket: true },
}

// event -> preferred styles, ranked (first = best match)
const EVENT_STYLE_RULES = {
  casual: ["קז'ואל", 'רחוב', 'ספורטיבי'],
  work: ['קלאסי', 'אלגנטי'],
  formal: ['אלגנטי', 'קלאסי'],
  sport: ['ספורטיבי'],
  party: ['אלגנטי', 'רחוב'],
}

function scoreItem(item, { weather, event, preferredColors }) {
  let score = 0

  const weatherRule = WEATHER_RULES[weather]
  if (weatherRule && weatherRule.seasons.includes(item.season)) score += 2

  const stylePriority = EVENT_STYLE_RULES[event] || []
  const styleRank = stylePriority.indexOf(item.style)
  if (styleRank === 0) score += 2
  else if (styleRank > 0) score += 1

  if (preferredColors?.length && preferredColors.includes(item.color)) score += 2

  return score
}

function pickBest(items, context) {
  if (!items.length) return null
  return items
    .map((item) => ({ item, score: scoreItem(item, context) }))
    .sort((a, b) => b.score - a.score)[0]
}

// Picks one item per needed category from the digital closet and returns
// the chosen outfit plus a human-readable explanation. Pure rule-based logic
// (no network calls) so it always works offline/instantly; generateOutfitExplanation
// in claudeService.js can optionally upgrade the explanation text using Claude.
export function recommendOutfit(closetItems, context) {
  const { weather, event } = context
  const weatherRule = WEATHER_RULES[weather] || WEATHER_RULES.mild

  const byCategory = (key) => closetItems.filter((i) => i.category === key && !i.needsManualFix)

  const dresses = byCategory('dress')
  const tops = byCategory('top')
  const bottoms = byCategory('bottom')
  const skirts = byCategory('skirt')
  const outerwear = byCategory('outerwear')
  const shoes = byCategory('shoes')

  const preferDress = event === 'formal' || event === 'party'
  const bestDress = pickBest(dresses, context)

  const chosen = []
  let usedDress = false

  if (preferDress && bestDress && bestDress.score > 0) {
    chosen.push({ ...bestDress, role: 'dress' })
    usedDress = true
  } else {
    const bestTop = pickBest(tops, context)
    const bestBottom = pickBest([...bottoms, ...skirts], context)
    if (bestTop) chosen.push({ ...bestTop, role: 'top' })
    if (bestBottom) chosen.push({ ...bestBottom, role: bestBottom.item.category })
    if (!bestTop && !bestBottom && bestDress) {
      chosen.push({ ...bestDress, role: 'dress' })
      usedDress = true
    }
  }

  const bestShoes = pickBest(shoes, context)
  if (bestShoes) chosen.push({ ...bestShoes, role: 'shoes' })

  if (weatherRule.needsJacket) {
    const bestJacket = pickBest(outerwear, context)
    if (bestJacket) chosen.push({ ...bestJacket, role: 'outerwear' })
  }

  const colors = chosen.map((c) => c.item.color)
  let colorScore = 0
  let pairs = 0
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      colorScore += colorCompatibility(colors[i], colors[j])
      pairs++
    }
  }
  const avgColorScore = pairs ? colorScore / pairs : 1.5

  const items = chosen.map((c) => c.item)
  const explanation = buildExplanation({ items, context, usedDress, avgColorScore })

  return {
    lookName: buildLookName(context),
    items,
    colorMatch: describeColorMatch(colors),
    colorScore: avgColorScore,
    explanation,
    stylingTip: buildStylingTip({ context, weatherRule }),
  }
}

function buildLookName({ style, event }) {
  return `לוק ${style} ל${eventLabelHebrew(event)}`
}

function buildExplanation({ items, context, usedDress, avgColorScore }) {
  if (!items.length) {
    return 'לא נמצאו מספיק פריטים מתאימים בארון הדיגיטלי שלך לבחירות האלה. נסי להעלות עוד פריטים.'
  }
  const eventLabel = EVENT_STYLE_RULES[context.event] ? context.event : 'casual'
  const itemNames = items.map((i) => i.type).join(', ')
  const colorNote = avgColorScore >= 1.4 ? 'הצבעים מתואמים היטב' : 'יש שילוב צבעים נועז שמוסיף אופי'
  const base = usedDress
    ? `נבחרה שמלה כפריט מרכזי כיוון שהיא מתאימה לאירוע ולסגנון שביקשת.`
    : `הלוק משלב ${itemNames}, שמתאימים למזג האוויר ולסוג האירוע שבחרת.`
  return `${base} ${colorNote}. הלוק הזה מתאים ל${eventLabelHebrew(eventLabel)}.`
}

function eventLabelHebrew(key) {
  const map = {
    casual: 'יום-יום',
    work: 'יום עבודה',
    formal: 'אירוע רשמי',
    sport: 'פעילות ספורטיבית',
    party: 'מסיבה',
  }
  return map[key] || 'היום-יום'
}

function buildStylingTip({ context, weatherRule }) {
  if (weatherRule.needsJacket) return 'טיפ: כדאי לקפל את שרוולי הג\'קט מעט כדי לשבור את הקו הפורמלי.'
  if (context.event === 'formal') return 'טיפ: שמרי על אקססוריז מינימליים כדי שהבגדים ידברו בעד עצמם.'
  if (context.event === 'sport') return 'טיפ: בחרי נעליים נוחות שמתאימות לתנועה חופשית.'
  return 'טיפ: שכבה אחת בולטת מספיקה — תני לה להיות הכוכבת של הלוק.'
}
