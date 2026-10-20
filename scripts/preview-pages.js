// Simulates the GitHub Pages project subpath locally: copies build/ to <tmp>/marea-pages-sim/marea-ott-demo/.
// Usage: node scripts/preview-pages.js, then serve the printed parent folder.
const fs = require('fs')
const os = require('os')
const path = require('path')

const SUBPATH = 'marea-ott-demo'
const buildDir = path.join(__dirname, '..', 'build')
const simRoot = path.join(os.tmpdir(), 'marea-pages-sim')
const target = path.join(simRoot, SUBPATH)

if (!fs.existsSync(path.join(buildDir, '404.html'))) {
  console.error('build/ is not a Pages build. Run "npm run build:pages" first.')
  process.exit(1)
}

fs.rmSync(simRoot, { recursive: true, force: true })
fs.cpSync(buildDir, target, { recursive: true })
// `serve` looks for 404.html at the served root; Pages uses the project's 404.html for unknown paths under it.
fs.copyFileSync(path.join(buildDir, '404.html'), path.join(simRoot, '404.html'))

console.log(`Copied build/ to ${target}`)
console.log('Serve the parent folder with:')
console.log(`  npx serve "${simRoot}" -l 5051`)
console.log(`Then open http://localhost:5051/${SUBPATH}/`)
