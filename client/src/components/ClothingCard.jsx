import { useState } from 'react'
import { CATEGORIES, CATEGORY_LABELS, COLOR_OPTIONS } from '../data/constants'
import { useCloset } from '../store/closetStore'
import ColorDuplicateDialog from './ColorDuplicateDialog'

export default function ClothingCard({ item, onRemove, selected = false, showDuplicateButton = false }) {
  const { duplicateItem } = useCloset()
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)

  async function handleDuplicate(newColor) {
    setIsDuplicating(true)
    await duplicateItem(item.id, newColor)
    setIsDuplicating(false)
    setShowDuplicateDialog(false)
  }

  const colorOption = COLOR_OPTIONS.find((c) => c.name === item.color)

  return (
    <>
      <div className={'item-card' + (selected ? ' item-card--selected' : '')}>
        <div className="item-card__image">
          {item.needsManualFix ? (
            <div className="item-card__manual-fix">
              <span>⚠️ נדרש תיקון ידני</span>
            </div>
          ) : item.error ? (
            <div className="item-card__error">
              <span>⚠️ יצירת התמונה נכשלה</span>
            </div>
          ) : item.isPlaceholder || !item.productImageUrl ? (
            <div className="item-card__placeholder">
              <span className="item-card__placeholder-icon">
                {CATEGORIES.find((c) => c.key === item.category)?.icon || '🖼️'}
              </span>
              <span>תמונת מוצר תיווצר כאן</span>
            </div>
          ) : (
            <img src={item.productImageUrl} alt={item.name} />
          )}
        </div>
        <div className="item-card__body">
          <h4>{item.name}</h4>
          <p className="item-card__meta">{CATEGORY_LABELS[item.category] || item.category}</p>
          <div className="item-card__tags">
            <span className="tag tag--color">
              {colorOption && (
                <span
                  className="tag__color-swatch"
                  style={{ backgroundColor: colorOption.hex }}
                  title={item.color}
                ></span>
              )}
              {item.color}
            </span>
            <span className="tag">{item.style}</span>
            <span className="tag">{item.season}</span>
          </div>
        </div>
        <div className="item-card__actions">
          {showDuplicateButton && (
            <button
              className="item-card__btn item-card__duplicate"
              onClick={() => setShowDuplicateDialog(true)}
              title="שכפל פריט בצבע אחר"
            >
              📋 שכפל
            </button>
          )}
          {onRemove && (
            <button className="item-card__remove" onClick={() => onRemove(item.id)} aria-label="הסר פריט">
              ✕
            </button>
          )}
        </div>
      </div>

      {showDuplicateDialog && (
        <ColorDuplicateDialog
          item={item}
          isProcessing={isDuplicating}
          onConfirm={handleDuplicate}
          onCancel={() => setShowDuplicateDialog(false)}
        />
      )}
    </>
  )
}
