import { useState } from 'react'
import { CATEGORY_LABELS } from '../data/constants'
import '../styles/ColorDuplicateDialog.css'

// Lets the user swap a single item in an already-built outfit without
// regenerating the whole look — pick which item to replace, then pick its
// replacement from other wardrobe items in the same category.
export default function ReplaceItemPicker({ outfitItems, closetItems, onReplace, onClose }) {
  const [targetItem, setTargetItem] = useState(null)

  const alternatives = targetItem
    ? closetItems.filter((item) => item.category === targetItem.category && item.id !== targetItem.id)
    : []

  return (
    <div className="dialog-overlay">
      <div className="dialog replace-picker">
        {!targetItem ? (
          <>
            <h3>איזה פריט להחליף?</h3>
            <div className="replace-picker__grid">
              {outfitItems.map((item) => (
                <button key={item.id} className="replace-picker__option" onClick={() => setTargetItem(item)}>
                  <img src={item.productImageUrl} alt={item.name} />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h3>בחרי תחליף מהארון ({CATEGORY_LABELS[targetItem.category] || targetItem.category})</h3>
            {alternatives.length === 0 ? (
              <p className="page__hint">אין פריט אחר מאותה קטגוריה בארון שלך.</p>
            ) : (
              <div className="replace-picker__grid">
                {alternatives.map((item) => (
                  <button
                    key={item.id}
                    className="replace-picker__option"
                    onClick={() => {
                      onReplace(targetItem.id, item)
                      onClose()
                    }}
                  >
                    <img src={item.productImageUrl} alt={item.name} />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        <div className="dialog__actions">
          <button className="btn btn--secondary" onClick={onClose}>
            ביטול
          </button>
        </div>
      </div>
    </div>
  )
}
