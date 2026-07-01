import { useRef, useState } from 'react'
import { readFileAsDataUrl } from '../utils/imageProcessing'

export default function ImageUploader({ onImagesReady }) {
  const inputRef = useRef(null)
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)

  async function handleFiles(fileList) {
    const files = Array.from(fileList)
    if (!files.length) return
    setLoading(true)
    const dataUrls = await Promise.all(files.map(readFileAsDataUrl))
    setPreviews((prev) => [...prev, ...dataUrls])
    setLoading(false)
    onImagesReady?.(dataUrls)
  }

  return (
    <div className="uploader">
      <div
        className="uploader__dropzone"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
      >
        <p>גררי תמונות לכאן או לחצי לבחירה</p>
        <span className="uploader__hint">אפשר לבחור כמה תמונות בבת אחת</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {loading && <p className="uploader__loading">טוענת תמונות...</p>}

      {previews.length > 0 && (
        <div className="uploader__previews">
          {previews.map((src, i) => (
            <img key={i} src={src} alt={`תמונה ${i + 1}`} className="uploader__thumb" />
          ))}
        </div>
      )}
    </div>
  )
}
