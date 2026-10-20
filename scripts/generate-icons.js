// Generates the PWA icons (an "M" made of two waves on the navy background) with pngjs.
// Usage: npm run icons
const fs = require('fs')
const path = require('path')
const { PNG } = require('pngjs')

const NAVY = [11, 18, 32]
const TEAL = [46, 196, 182]
const OUT_DIR = path.join(__dirname, '..', 'public', 'icons')

// Cubic bezier points of the glyph in a 0..1 box.
const cubic = (p0, p1, p2, p3, t) => {
  const u = 1 - t
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]
  ]
}

const glyphPoints = () => {
  const left = [[0, 0.78], [0.1, 0.18], [0.36, 0.18], [0.5, 0.62]]
  const right = [[0.5, 0.62], [0.64, 0.18], [0.9, 0.18], [1, 0.78]]
  const points = []
  for (let i = 0; i <= 600; i++) points.push(cubic(...left, i / 600))
  for (let i = 1; i <= 600; i++) points.push(cubic(...right, i / 600))
  return points
}

const SS = 3 // supersampling per axis

// Stamps round brush dots along the curve into a hi-res coverage mask.
const buildMask = (size, points, radius) => {
  const hi = size * SS
  const mask = new Uint8Array(hi * hi)
  const r = radius * SS
  const r2 = r * r
  points.forEach(([px, py]) => {
    const cx = px * SS
    const cy = py * SS
    for (let y = Math.max(0, Math.floor(cy - r)); y <= Math.min(hi - 1, Math.ceil(cy + r)); y++) {
      for (let x = Math.max(0, Math.floor(cx - r)); x <= Math.min(hi - 1, Math.ceil(cx + r)); x++) {
        if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r2) mask[y * hi + x] = 1
      }
    }
  })
  return mask
}

const render = (size, glyphScale) => {
  const png = new PNG({ width: size, height: size })
  const glyphSize = size * glyphScale
  const offset = (size - glyphSize) / 2
  const points = glyphPoints().map(([x, y]) => [offset + x * glyphSize, offset + (y + 0.02) * glyphSize])
  const mask = buildMask(size, points, glyphSize * 0.07)
  const hi = size * SS

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let covered = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          covered += mask[(y * SS + sy) * hi + x * SS + sx]
        }
      }
      const alpha = covered / (SS * SS)
      const idx = (size * y + x) << 2
      png.data[idx] = Math.round(NAVY[0] + (TEAL[0] - NAVY[0]) * alpha)
      png.data[idx + 1] = Math.round(NAVY[1] + (TEAL[1] - NAVY[1]) * alpha)
      png.data[idx + 2] = Math.round(NAVY[2] + (TEAL[2] - NAVY[2]) * alpha)
      png.data[idx + 3] = 255
    }
  }
  return PNG.sync.write(png)
}

// Maskable icons keep the glyph inside the 80% safe zone; "any" icons can use more of the canvas.
const targets = [
  ['icon-192.png', 192, 0.62],
  ['icon-512.png', 512, 0.62],
  ['icon-maskable-192.png', 192, 0.46],
  ['icon-maskable-512.png', 512, 0.46],
  ['apple-touch-icon.png', 180, 0.56]
]

fs.mkdirSync(OUT_DIR, { recursive: true })
targets.forEach(([name, size, scale]) => {
  fs.writeFileSync(path.join(OUT_DIR, name), render(size, scale))
  console.log(`wrote public/icons/${name}`)
})
