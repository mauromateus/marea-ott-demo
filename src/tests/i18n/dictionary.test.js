import fs from 'fs'
import path from 'path'

import es from 'i18n/es'
import dictionaries from 'i18n'

const SRC = path.resolve(__dirname, '..', '..')
const AREAS = ['common', 'home', 'tv', 'vod', 'radio', 'install', 'debug', 'player', 'errors']
const KEY_PATTERN = new RegExp(String.raw`['"\x60]((?:${AREAS.join('|')})\.[A-Za-z0-9.]+)['"\x60]`, 'g')

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name)
  if (entry.isDirectory()) {
    return ['tests', 'i18n'].includes(entry.name) && dir === SRC ? [] : walk(full)
  }
  return /\.js$/.test(entry.name) ? [full] : []
})

describe('es dictionary', () => {
  it('is registered under its language code', () => {
    expect(dictionaries.es).toBe(es)
  })

  it('has only non-empty string values and area-prefixed keys', () => {
    Object.entries(es).forEach(([key, value]) => {
      expect(typeof value).toBe('string')
      expect(value.trim()).not.toBe('')
      expect(AREAS.some((area) => key.startsWith(`${area}.`))).toBe(true)
    })
  })

  it('defines every key referenced in source', () => {
    const referenced = new Set()
    walk(SRC).forEach((file) => {
      const text = fs.readFileSync(file, 'utf8')
      let match
      while ((match = KEY_PATTERN.exec(text))) {
        referenced.add(match[1])
      }
    })
    expect(referenced.size).toBeGreaterThan(30)
    const missing = [...referenced].filter((key) => !(key in es))
    expect(missing).toEqual([])
  })

  it('has no unused keys', () => {
    const source = walk(SRC).map((file) => fs.readFileSync(file, 'utf8')).join('\n')
    const unused = Object.keys(es).filter((key) => !source.includes(`'${key}'`) && !source.includes(`"${key}"`))
    expect(unused).toEqual([])
  })

  it('keeps install steps short: at most 3 per platform, at most 8 words each', () => {
    ;['android', 'iphone', 'desktop'].forEach((platform) => {
      const steps = Object.keys(es).filter((key) => key.startsWith(`install.steps.${platform}.`))
      expect(steps.length).toBeGreaterThan(0)
      expect(steps.length).toBeLessThanOrEqual(3)
      steps.forEach((key) => expect(es[key].replace('{name}', 'Marea').split(/\s+/).length).toBeLessThanOrEqual(8))
    })
  })
})
