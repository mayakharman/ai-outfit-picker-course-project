// Styling-only accessory suggestions from Claude — never real shopping
// products, just small icon cards with a short recommendation each.

const ACCESSORY_CARDS = [
  { key: 'earrings', icon: '💎', label: 'עגילים' },
  { key: 'necklace', icon: '📿', label: 'שרשרת' },
  { key: 'braceletOrWatch', icon: '⌚', label: 'צמיד / שעון' },
  { key: 'bag', icon: '👜', label: 'תיק' },
  { key: 'optionalAccessory', icon: '✨', label: 'אקססורי נוסף' },
]

export default function CompleteTheLook({ accessories }) {
  if (!accessories) return null

  return (
    <section className="complete-the-look">
      <h3>השלימי את הלוק</h3>
      <div className="complete-the-look__grid">
        {ACCESSORY_CARDS.map((card) => {
          const value = accessories[card.key]
          if (!value) return null
          return (
            <div key={card.key} className="complete-the-look__card">
              <span className="complete-the-look__icon">{card.icon}</span>
              <span className="complete-the-look__label">{card.label}</span>
              <span className="complete-the-look__value">{value}</span>
            </div>
          )
        })}
      </div>
      {accessories.reason && <p className="complete-the-look__reason">{accessories.reason}</p>}
    </section>
  )
}
