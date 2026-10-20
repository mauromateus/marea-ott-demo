import fs from 'fs'
import path from 'path'

import { PRECACHE_OPTIONS } from 'core/services/ServiceWorker/precacheOptions'

describe('precache options', () => {
  it('never lets the precache answer a directory URL such as "/base/" with index.html', () => {
    expect(PRECACHE_OPTIONS.directoryIndex).toBeNull()
  })

  it('does not rewrite clean URLs to .html either', () => {
    expect(PRECACHE_OPTIONS.cleanURLs).toBe(false)
  })

  it('is the option set that src/service-worker.js really passes to precacheAndRoute', () => {
    const source = fs.readFileSync(path.join(__dirname, '../../../../service-worker.js'), 'utf8')
    expect(source).toMatch(/precacheAndRoute\(\s*manifest\s*,\s*PRECACHE_OPTIONS\s*\)/)
  })
})
