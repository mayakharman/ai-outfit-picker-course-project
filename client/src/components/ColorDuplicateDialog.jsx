import { useState } from 'react'
import { COLOR_OPTIONS } from '../data/constants'
import '../styles/ColorDuplicateDialog.css'

export default function ColorDuplicateDialog({ item, isProcessing = false, onConfirm, onCancel }) {
  const [selectedColor, setSelectedColor] = useState(item.color)

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h3>שכפול פריט: {item.name}</h3>
        <p>בחרי צבע חדש לעותק הזה:</p>

        <div className="color-picker">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.name}
              className={'color-option' + (selectedColor === c.name ? ' color-option--active' : '')}
              style={{ '--color-hex': c.hex }}
              onClick={() => setSelectedColor(c.name)}
              title={c.name}
            >
              <span className="color-option__swatch"></span>
              <span className="color-option__label">{c.name}</span>
            </button>
          ))}
        </div>

        <div className="dialog__actions">
          <button className="btn btn--secondary" onClick={onCancel} disabled={isProcessing}>
            ביטול
          </button>
          <button
            className="btn btn--primary"
            onClick={() => onConfirm(selectedColor)}
            disabled={isProcessing}
          >
            {isProcessing ? '⏳ משכפלת...' : '✨ שכפל עם צבע זה'}
          </button>
        </div>
      </div>
    </div>
  )
}
