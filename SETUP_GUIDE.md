# 🛠️ AI Outfit Picker - Setup & Implementation Guide

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Browser with localStorage support

### Installation

```bash
# Navigate to project
cd AI-Outfit-Picker

# Install client dependencies
cd client
npm install

# Install server dependencies (if using real API)
cd ../server
npm install
```

### Running the Project

#### Development Mode (with Mock)
```bash
cd client
npm run dev
```
- Opens at `http://localhost:5173`
- Uses mock data (no API keys needed)
- Perfect for demos and class presentations

#### With Real Backend
```bash
# Terminal 1: Start backend
cd server
npm run start
# Server runs on http://localhost:4000

# Terminal 2: Start client
cd client
npm run dev
```

### Environment Variables

Create `.env.local` in `client/` directory:

```env
# Mock mode (set to true for offline demo)
VITE_MOCK_MODE=true

# API Base URL (only needed if using real backend)
VITE_API_BASE_URL=http://localhost:4000

# Or for production:
VITE_API_BASE_URL=https://your-api-domain.com
```

---

## 🎯 Feature Implementation Guide

### Feature 1: Color Detection

**Current Implementation:**
- Automatic histogram-based analysis
- Works in both mock and real mode
- Runs during product image creation

**To customize colors:**

Edit [`client/src/data/constants.js`]:

```javascript
export const COLOR_OPTIONS = [
  { name: 'שחור', hex: '#1a1a1a' },
  { name: 'לבן', hex: '#ffffff' },
  // Add your colors here
  { name: 'משהו חדש', hex: '#hexcode' },
]
```

**To improve color detection:**

Edit [`client/src/utils/colorUtils.js`], function `findClosestColor()`:

```javascript
function findClosestColor(r, g, b) {
  const colors = {
    // Add or adjust RGB values for better accuracy
    'שחור': [26, 26, 26],
  }
  // Euclidean distance calculation
}
```

---

### Feature 2: Duplicate Items

**Current Implementation:**
- ✅ Works out of the box
- Stored in LocalStorage
- Tracked via `duplicateOf` field

**To modify behavior:**

In [`client/src/store/closetStore.jsx`]:

```javascript
function duplicateItem(id, newColor) {
  // Customize duplicate logic here
  // Example: add pricing, availability flags, etc.
  const duplicate = {
    ...original,
    id: crypto.randomUUID(),
    color: newColor,
    duplicateOf: id,
    // Add custom fields:
    price: original.price,
    availability: 'in-stock',
  }
}
```

---

### Feature 3: AI Preview Integration

#### Option A: Using Hugging Face API (Recommended for Demo)

1. **Get API Key**
   - Go to https://huggingface.co
   - Create account
   - Generate API token

2. **Add to Backend** (`server/server.js`):

```javascript
const HF_API_URL = 'https://api-inference.huggingface.co/models/'
const HF_TOKEN = process.env.HUGGING_FACE_TOKEN

app.post('/api/generate-ai-preview', async (req, res) => {
  const { items, context } = req.body
  
  // Create prompt from items
  const prompt = `Professional fashion model wearing: ${items
    .map(i => i.name + ' in ' + i.color)
    .join(', ')}`
  
  // Call IP-Adapter or similar
  const response = await fetch(
    HF_API_URL + 'ip-adapter-full-face',
    {
      headers: { Authorization: `Bearer ${HF_TOKEN}` },
      method: 'POST',
      body: JSON.stringify({ inputs: prompt })
    }
  )
  
  const result = await response.blob()
  res.json({ preview: URL.createObjectURL(result) })
})
```

3. **Update Client** (`client/src/components/AIPreviewSection.jsx`):

```javascript
async function handleGeneratePreview() {
  setIsGenerating(true)
  
  try {
    const response = await fetch('/api/generate-ai-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, context })
    })
    
    const data = await response.json()
    setPreviewImage(data.preview)
    setHasGenerated(true)
  } finally {
    setIsGenerating(false)
  }
}
```

#### Option B: Using Replicate API (Advanced)

```bash
npm install replicate
```

```javascript
import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

app.post('/api/generate-ai-preview', async (req, res) => {
  const output = await replicate.run(
    'asiryan/outfit-try-on:model-version-id',
    {
      input: {
        person_image: /* base64 or URL */,
        garment_images: items.map(i => i.productImageUrl),
        category: items.map(i => i.category),
      }
    }
  )
  
  res.json({ preview: output })
})
```

#### Option C: Using Remove.bg API for Simple Try-On

```javascript
app.post('/api/generate-ai-preview', async (req, res) => {
  // Use Remove.bg API to layer clothes on a stock model image
  const modelImage = /* fetch stock model image */
  const composited = /* layer item images on model */
  res.json({ preview: composited })
})
```

---

### Feature 4: Background Removal for Product Images

#### Current Status
- ✅ Mock mode: Simple white canvas crop
- ⚙️ Real mode: Needs API connection

#### Option A: Remove.bg API (Easiest)

1. **Get API Key**
   - Go to https://remove.bg
   - Sign up
   - Get API key from settings

2. **Add to Backend** (`server/.env`):

```env
REMOVE_BG_API_KEY=your-api-key-here
```

3. **Implement Endpoint** (`server/server.js`):

```javascript
import FormData from 'form-data'

app.post('/api/remove-background', async (req, res) => {
  const { image } = req.body
  
  // Convert data URL to buffer
  const buffer = Buffer.from(image.split(',')[1], 'base64')
  
  const formData = new FormData()
  formData.append('image_file', buffer, 'image.png')
  formData.append('size', 'auto')
  formData.append('type', 'product')
  formData.append('format', 'PNG')
  
  try {
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVE_BG_API_KEY,
      },
      body: formData,
    })
    
    const data = await response.arrayBuffer()
    const base64 = Buffer.from(data).toString('base64')
    
    res.json({ image: `data:image/png;base64,${base64}` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
```

#### Option B: Local ML Model (Advanced)

Using `rembg` Python library:

```python
from rembg import remove
from PIL import Image
import base64
import io

@app.post('/api/remove-background')
def remove_background():
    image_data = request.json['image']
    # Decode base64
    image = Image.open(io.BytesIO(base64.b64decode(image_data.split(',')[1])))
    
    # Remove background
    output = remove(image)
    
    # Encode back to base64
    buf = io.BytesIO()
    output.save(buf, format='PNG')
    result = base64.b64encode(buf.getvalue()).decode()
    
    return { 'image': f'data:image/png;base64,{result}' }
```

---

### Feature 5: Clothing Detection (Claude API)

#### Current Implementation
- Already integrated
- Uses Claude vision API
- Configured in `claudeService.js`

#### To modify detection logic:

Edit [`client/src/services/claudeService.js`]:

```javascript
export async function detectClothingItems(imageDataUrl) {
  const res = await fetch(`${API_BASE_URL}/api/detect-clothing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      image: imageDataUrl,
      prompt: 'Detect ONLY these 6 items: ...'  // Customize here
    }),
  })
}
```

In Backend (`server/server.js`):

```javascript
import Anthropic from '@anthropic-ai/sdk'

app.post('/api/detect-clothing', async (req, res) => {
  const { image } = req.body
  
  const client = new Anthropic()
  
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: image.split(',')[1],
            },
          },
          {
            type: 'text',
            text: `Detect clothing items in this image. For each item, provide:
- type: (Hebrew name)
- category: top|bottom|skirt|dress|outerwear|shoes
- color: (Hebrew color name)
- style: קז'ואל|אלגנטי|ספורטיבי|רחוב|קלאסי
- season: קיץ|חורף|אביב/סתיו|כל השנה
- confidence: 0-1
- boundingBox: {x, y, w, h} (normalized 0-1)

Ignore ALL accessories (bags, jewelry, hats, belts, watches, scarves, sunglasses).
Return as JSON array.`,
          },
        ],
      },
    ],
  })
  
  const content = response.content[0]
  if (content.type === 'text') {
    const items = JSON.parse(content.text)
    res.json({ items })
  }
})
```

---

## 🧪 Testing

### Test Checklist

- [ ] Upload single image
- [ ] Upload multiple images
- [ ] Verify colors auto-detect
- [ ] Duplicate item with new color
- [ ] Build outfit with 2+ items
- [ ] Check localStorage persists data
- [ ] Test on mobile (DevTools → Device Mode)
- [ ] RTL text renders correctly
- [ ] All buttons respond to clicks
- [ ] Error messages display clearly

### Manual Test Images

Good test images:
- Simple clothing item on solid background
- Multiple items in one photo
- Low quality/blurry image
- White/light colored items
- Dark/black items

---

## 📊 Performance Tips

### LocalStorage Management

```javascript
// Check storage usage
function getStorageSize() {
  let total = 0
  for (let key in localStorage) {
    total += localStorage[key].length
  }
  return (total / 1024 / 1024).toFixed(2) + ' MB'
}

// Clear old items if needed
function clearOldItems(days = 30) {
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000)
  // Implement cleanup logic
}
```

### Image Optimization

```javascript
// Compress images before storage
async function compressImage(dataUrl) {
  const canvas = document.createElement('canvas')
  const img = new Image()
  
  img.onload = () => {
    canvas.width = img.width * 0.8  // 80% size
    canvas.height = img.height * 0.8
    
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    
    return canvas.toDataURL('image/jpeg', 0.8)  // 80% quality
  }
  
  img.src = dataUrl
}
```

---

## 🐛 Common Issues & Fixes

### Issue: Images not saving
**Solution:**
```javascript
// Check localStorage quota
try {
  localStorage.setItem('test', 'test')
  localStorage.removeItem('test')
  console.log('Storage available')
} catch (e) {
  console.log('Storage full or disabled')
}
```

### Issue: Colors not detecting
**Solution:**
```javascript
// Debug color detection
async function debugColor(imageUrl) {
  const color = await detectDominantColor(imageUrl)
  console.log('Detected:', color)
  // Check histogram output
}
```

### Issue: API timeouts
**Solution:**
```javascript
// Add timeout handling
const timeout = (ms) => new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Timeout')), ms)
)

Promise.race([apiCall(), timeout(10000)])
```

---

## 📱 Mobile Optimization

### Already Implemented
- ✅ Responsive grid layout
- ✅ Touch-friendly buttons (min 44x44px)
- ✅ RTL support for Hebrew
- ✅ Mobile viewport meta tag

### To test on mobile:
```bash
# Get local IP
ifconfig | grep inet

# Open on phone:
# http://YOUR_IP:5173
```

---

## 🚀 Deployment

### Deploy to Vercel (Client Only)

```bash
cd client
npm run build
# Drag 'dist' folder to Vercel
```

### Deploy with Backend (Render/Railway)

1. **Backend** (`server` folder)
   - Push to GitHub
   - Connect to Render.com or Railway.app
   - Set environment variables
   - Deploy

2. **Client** (`client` folder)
   - Update `VITE_API_BASE_URL` to deployed backend
   - Deploy to Vercel

---

## 📞 Debugging

### Enable Debug Logs

Add to `client/src/main.jsx`:

```javascript
if (process.env.NODE_ENV === 'development') {
  window.DEBUG = true
}
```

### Check API Calls

In browser console:
```javascript
// Monitor all fetch requests
const originalFetch = window.fetch
window.fetch = function(...args) {
  console.log('FETCH:', args)
  return originalFetch.apply(this, args)
}
```

### LocalStorage Inspector

```javascript
// View all stored items
console.table(JSON.parse(localStorage.getItem('ai-outfit-picker.closet')))

// Clear if needed
localStorage.clear()
```

---

## ✅ Checklist for Class Presentation

- [ ] Environment variables set correctly
- [ ] Images upload successfully
- [ ] Colors auto-detect
- [ ] Can duplicate items
- [ ] Can build outfits
- [ ] AI preview section visible
- [ ] No console errors
- [ ] Mobile responsive (test on phone)
- [ ] Documentation printed/available
- [ ] Backup demo data ready

---

## 📚 Additional Resources

### Documentation
- React Docs: https://react.dev
- Vite Guide: https://vitejs.dev
- Claude API: https://anthropic.com/docs
- Remove.bg API: https://www.remove.bg/api

### Helpful Libraries
```json
{
  "canvas-related": "html2canvas, fabric.js",
  "image-processing": "sharp, jimp, canvas",
  "ai-models": "replicate, hugging-face, tf.js",
  "styling": "tailwindcss, sass"
}
```

---

Last Updated: 2026-06-17
