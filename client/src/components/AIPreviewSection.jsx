import { useState } from 'react'
import '../styles/AIPreviewSection.css'

export default function AIPreviewSection({ items, context }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)

  async function handleGeneratePreview() {
    setIsGenerating(true)
    // Simulate API call delay
    await new Promise((r) => setTimeout(r, 1500))
    setHasGenerated(true)
    setIsGenerating(false)
  }

  return (
    <section className="ai-preview">
      <h3>👗 הדמיית הלוק על דמות AI</h3>
      <p className="ai-preview__description">
        ראי איך הלוק הזה נראה על דמות אמיתית שנוצרה בעזרת AI — בלי שום שימוש בתמונה האישית שלך
      </p>

      <div className="ai-preview__container">
        {!hasGenerated ? (
          <div className="ai-preview__placeholder">
            <div className="ai-preview__icon">✨</div>
            <p>לחצי על "הדמי לוק" כדי לראות את הלוק על דמות AI</p>
            <button
              className="btn btn--primary btn--large"
              onClick={handleGeneratePreview}
              disabled={isGenerating}
            >
              {isGenerating ? '⏳ מייצרת הדמיה...' : '✨ הדמי לוק'}
            </button>
          </div>
        ) : (
          <div className="ai-preview__generated">
            <div className="ai-preview__figure">
              {/* Demo: Simple figure representation */}
              <svg
                viewBox="0 0 200 400"
                className="ai-preview__model"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Head (simple circle, no face details) */}
                <circle cx="100" cy="50" r="30" fill="#e8b8a8" stroke="#d0a090" strokeWidth="1" />

                {/* Body outline */}
                <ellipse cx="100" cy="120" rx="25" ry="30" fill="#f5f5f5" stroke="#ddd" strokeWidth="1" />

                {/* Legs */}
                <rect x="90" y="160" width="10" height="80" fill="#e8b8a8" stroke="#d0a090" strokeWidth="1" />
                <rect x="100" y="160" width="10" height="80" fill="#e8b8a8" stroke="#d0a090" strokeWidth="1" />

                {/* Feet */}
                <ellipse cx="95" cy="245" rx="12" ry="8" fill="#3a3a3a" />
                <ellipse cx="105" cy="245" rx="12" ry="8" fill="#3a3a3a" />
              </svg>

              {/* Clothing display on top of figure */}
              <div className="ai-preview__clothing">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="ai-preview__item"
                    title={item.name}
                  >
                    <img src={item.productImageUrl} alt={item.name} />
                  </div>
                ))}
              </div>
            </div>

            <div className="ai-preview__details">
              <h4>🎯 הלוק שלך על הדמות</h4>
              <ul className="ai-preview__items-list">
                {items.map((item) => (
                  <li key={item.id}>
                    <span className="ai-preview__item-name">{item.name}</span>
                    <span className="ai-preview__item-color" style={{
                      backgroundColor: item.color === 'שחור' ? '#1a1a1a' :
                                       item.color === 'לבן' ? '#ffffff' :
                                       item.color === 'אפור' ? '#9e9e9e' :
                                       item.color === 'בז\'' ? '#d8c3a5' :
                                       item.color === 'חום' ? '#6f4e37' :
                                       item.color === 'כחול' ? '#2b5797' :
                                       item.color === 'תכלת' ? '#7fb3d5' :
                                       item.color === 'אדום' ? '#c0392b' :
                                       item.color === 'ירוק' ? '#3d8c40' :
                                       item.color === 'צהוב' ? '#e6c200' :
                                       item.color === 'כתום' ? '#d2691e' :
                                       item.color === 'סגול' ? '#7d3c98' :
                                       item.color === 'ורוד' ? '#e6a4b4' : '#999'
                    }}></span>
                    {item.color}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="ai-preview__info">
        <p className="ai-preview__note">
          💡 <strong>הערה:</strong> זו הדמיית דמו. בעתיד, אפשר לחבר API אמיתי (כמו Hugging Face או Replicate) 
          ליצירת הדמיה תלת-ממדית מלאה או virtual try-on בעזרת AI generative models.
        </p>
      </div>

      <button
        className="btn btn--secondary"
        onClick={() => setHasGenerated(false)}
      >
        🔄 הדמי שוב
      </button>
    </section>
  )
}
