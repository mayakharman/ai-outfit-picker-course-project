import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// StrictMode is intentionally omitted: it double-invokes effects in dev,
// which silently doubles every paid API call (Claude, Photoroom, Replicate)
// made from useEffect-driven pages like ApproveClothingPage.
createRoot(document.getElementById('root')).render(<App />)
