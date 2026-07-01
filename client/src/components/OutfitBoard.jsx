// Premium "fashion mood board" layout for a chosen outfit. Uses ONLY the
// real, already-processed wardrobe images saved in the closet — this never
// generates a new image. Garments are arranged editorially (outerwear
// floating behind/above, top in the upper-middle, bottom/dress centered,
// shoes anchoring the bottom) instead of being placed in uniform boxes.

const BOARD_ROLE = {
  outerwear: 'outerwear',
  top: 'top',
  bottom: 'bottom',
  skirt: 'bottom',
  dress: 'bottom',
  shoes: 'shoes',
}

export default function OutfitBoard({ items }) {
  const byRole = {}
  items.forEach((item) => {
    const role = BOARD_ROLE[item.category]
    if (role) byRole[role] = item
  })

  return (
    <div className="outfit-board">
      <div className="outfit-board__shape outfit-board__shape--one" />
      <div className="outfit-board__shape outfit-board__shape--two" />

      <div className="outfit-board__grid">
        {byRole.outerwear && (
          <div className="outfit-board__item outfit-board__item--outerwear">
            <img src={byRole.outerwear.productImageUrl} alt={byRole.outerwear.name} />
          </div>
        )}
        {byRole.top && (
          <div className="outfit-board__item outfit-board__item--top">
            <img src={byRole.top.productImageUrl} alt={byRole.top.name} />
          </div>
        )}
        {byRole.bottom && (
          <div className="outfit-board__item outfit-board__item--bottom">
            <img src={byRole.bottom.productImageUrl} alt={byRole.bottom.name} />
          </div>
        )}
        {byRole.shoes && (
          <div className="outfit-board__item outfit-board__item--shoes">
            <img src={byRole.shoes.productImageUrl} alt={byRole.shoes.name} />
          </div>
        )}
      </div>
    </div>
  )
}
