import getBasename, { stripBasename } from 'core/Utils/getBasename'

describe('getBasename', () => {
  it.each([
    [undefined, ''],
    ['', ''],
    ['/', ''],
    ['.', '']
  ])('returns an empty string for the root (%p)', (input, expected) => {
    expect(getBasename(input)).toBe(expected)
  })

  it.each([
    ['/marea-ott-demo', '/marea-ott-demo'],
    ['/marea-ott-demo/', '/marea-ott-demo'],
    ['marea-ott-demo', '/marea-ott-demo'],
    ['/a/b//', '/a/b']
  ])('normalizes %p to %p', (input, expected) => {
    expect(getBasename(input)).toBe(expected)
  })

  it('uses only the pathname of a full URL', () => {
    expect(getBasename('https://mauromateus.github.io/marea-ott-demo/')).toBe('/marea-ott-demo')
    expect(getBasename('https://example.com')).toBe('')
    expect(getBasename('https://example.com/')).toBe('')
  })

  it('reads process.env.PUBLIC_URL by default', () => {
    const previous = process.env.PUBLIC_URL
    process.env.PUBLIC_URL = '/marea-ott-demo'
    try {
      expect(getBasename()).toBe('/marea-ott-demo')
    } finally {
      process.env.PUBLIC_URL = previous
    }
  })
})

describe('stripBasename', () => {
  it('removes the base path so paths match router routes', () => {
    expect(stripBasename('/marea-ott-demo/tv', '/marea-ott-demo')).toBe('/tv')
    expect(stripBasename('/marea-ott-demo', '/marea-ott-demo')).toBe('/')
    expect(stripBasename('/marea-ott-demo/', '/marea-ott-demo')).toBe('/')
  })

  it('leaves paths untouched at the root or outside the base path', () => {
    expect(stripBasename('/tv', '')).toBe('/tv')
    expect(stripBasename('/marea-ott-demo-other/tv', '/marea-ott-demo')).toBe('/marea-ott-demo-other/tv')
  })
})
