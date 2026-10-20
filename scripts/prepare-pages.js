// Makes build/ ready for GitHub Pages. Run after the CRA build (npm run build:pages does it).
const fs = require('fs')
const path = require('path')

const buildDir = path.join(__dirname, '..', 'build')
const indexFile = path.join(buildDir, 'index.html')

if (!fs.existsSync(indexFile)) {
  console.error('build/index.html not found. Run the build first.')
  process.exit(1)
}

// Pages cannot rewrite routes: a deep link returns 404.html (status 404), so it must be the app shell.
fs.copyFileSync(indexFile, path.join(buildDir, '404.html'))
// Without this file Jekyll would skip dot-folders such as .well-known.
fs.writeFileSync(path.join(buildDir, '.nojekyll'), '')

console.log('build/404.html and build/.nojekyll created.')
