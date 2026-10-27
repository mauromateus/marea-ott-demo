// Generates the webOS launcher images from the PWA icon (public/icons/icon-512.png), so the shell and the PWA share one brand.
// Usage: node shells/lg-webos/build-assets.js
const fs = require('fs')
const path = require('path')
const { PNG } = require('pngjs')

const NAVY = [11, 18, 32]
const SOURCE = path.join(__dirname, '..', '..', 'public', 'icons', 'icon-512.png')

// Box-filter downscale: averages the source pixels under each target pixel.
const resize = (src, width, height) => {
  const out = new PNG({ width, height })
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const x0 = Math.floor((x * src.width) / width)
      const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * src.width) / width))
      const y0 = Math.floor((y * src.height) / height)
      const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * src.height) / height))
      const sum = [0, 0, 0, 0]
      let count = 0
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const i = (sy * src.width + sx) * 4
          for (let c = 0; c < 4; c++) sum[c] += src.data[i + c]
          count++
        }
      }
      const o = (y * width + x) * 4
      for (let c = 0; c < 4; c++) out.data[o + c] = Math.round(sum[c] / count)
    }
  }
  return out
}

const splash = (icon, width, height, iconSize) => {
  const out = new PNG({ width, height })
  for (let i = 0; i < width * height; i++) {
    out.data[i * 4] = NAVY[0]
    out.data[i * 4 + 1] = NAVY[1]
    out.data[i * 4 + 2] = NAVY[2]
    out.data[i * 4 + 3] = 255
  }
  const small = resize(icon, iconSize, iconSize)
  PNG.bitblt(small, out, 0, 0, iconSize, iconSize, Math.floor((width - iconSize) / 2), Math.floor((height - iconSize) / 2))
  return out
}

const write = (name, png) => {
  fs.writeFileSync(path.join(__dirname, name), PNG.sync.write(png))
  console.log(`${name} ${png.width}x${png.height}`)
}

const icon = PNG.sync.read(fs.readFileSync(SOURCE))
write('icon.png', resize(icon, 80, 80))
write('largeIcon.png', resize(icon, 130, 130))
write('splashBackground.png', splash(icon, 1920, 1080, 320))
