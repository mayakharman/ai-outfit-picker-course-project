// Client-side canvas helpers.
// The original uploaded file is never modified — every function here
// reads the source image and draws into a brand-new canvas/output.

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function hexToRgb(hex) {
  const v = hex.replace('#', '')
  return {
    r: parseInt(v.substring(0, 2), 16),
    g: parseInt(v.substring(2, 4), 16),
    b: parseInt(v.substring(4, 6), 16),
  }
}

// Demo-level "color change": recolors the garment by luminance (duotone),
// so a duplicated item visibly looks like the new color while keeping the
// fabric's light/shadow texture. Background-white pixels (the product
// canvas) are left untouched. This never touches the original image — it
// always reads productImageUrl and returns a brand-new canvas/data URL.
export async function applyColorTint(productImageUrl, hex) {
  const img = await loadImage(productImageUrl)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)

  const target = hexToRgb(hex)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    if (r > 245 && g > 245 && b > 245) continue // leave the white canvas background alone

    const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255
    const lightness = 0.25 + luminance * 0.75
    data[i] = Math.min(255, target.r * lightness)
    data[i + 1] = Math.min(255, target.g * lightness)
    data[i + 2] = Math.min(255, target.b * lightness)
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/png')
}
