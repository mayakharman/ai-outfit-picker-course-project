import { useEffect, useState } from 'react'

const MESSAGES = [
  'בודקת את הארון שלך…',
  'מתאימה צבעים וסגנונות…',
  'בוחרת את האקססוריז המושלמים…',
  'הלוק הסופי כבר כמעט מוכן…',
]

// Cycles through styling messages for as long as the real request is in
// flight. There is no fixed timer for the whole experience — the parent
// unmounts this the moment the actual response (success or fallback)
// arrives, so the animation duration always matches real work being done.
export default function FindingYourLookLoader() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="finding-look">
      <div className="finding-look__sparkle">✨</div>
      <p className="finding-look__message">{MESSAGES[messageIndex]}</p>
      <div className="finding-look__bar">
        <div className="finding-look__bar-fill" />
      </div>
    </div>
  )
}
