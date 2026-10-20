import getMainBundleName, { getRunningMainBundle } from 'core/Utils/getMainBundleName'

describe('getMainBundleName', () => {
  it('extracts the hashed main bundle from absolute and relative URLs', () => {
    expect(getMainBundleName(['https://x.test/marea-ott-demo/static/js/main.d0945250.js'])).toBe('main.d0945250.js')
    expect(getMainBundleName(['/static/js/main.d0945250.js'])).toBe('main.d0945250.js')
  })

  it('skips other chunks, maps and license files', () => {
    expect(getMainBundleName([
      '/static/js/123.abcdef12.chunk.js',
      '/static/js/main.d0945250.js.map',
      '/static/js/main.d0945250.js.LICENSE.txt',
      '/static/css/main.aa11bb22.css',
      '/static/js/main.d0945250.js'
    ])).toBe('main.d0945250.js')
  })

  it('ignores query strings and fragments', () => {
    expect(getMainBundleName(['/static/js/main.d0945250.js?v=1'])).toBe('main.d0945250.js')
  })

  it('returns null when there is no main bundle or the input is not usable', () => {
    expect(getMainBundleName(['/static/js/123.abcdef12.chunk.js'])).toBeNull()
    expect(getMainBundleName([])).toBeNull()
    expect(getMainBundleName(undefined)).toBeNull()
    expect(getMainBundleName([null, undefined, 42])).toBeNull()
  })
})

describe('getRunningMainBundle', () => {
  afterEach(() => { document.head.innerHTML = '' })

  it('reads the main bundle from the document script tags', () => {
    document.head.innerHTML = '<script src="/marea-ott-demo/static/js/main.d0945250.js"></script><script src="/other.js"></script>'
    expect(getRunningMainBundle(document)).toBe('main.d0945250.js')
  })

  it('returns null when the page has no main bundle script (dev server)', () => {
    document.head.innerHTML = '<script src="/static/js/bundle.js"></script>'
    expect(getRunningMainBundle(document)).toBeNull()
  })
})
