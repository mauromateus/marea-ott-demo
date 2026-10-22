import getBuildId, { getRunningBuildId } from 'core/Utils/getBuildId'

describe('getBuildId', () => {
  it('returns the hash of a main bundle name, whatever its length', () => {
    expect(getBuildId('main.75f0989a.js')).toBe('75f0989a')
    expect(getBuildId('main.abc.js')).toBe('abc')
    expect(getBuildId('main.0123456789abcdef0123.js')).toBe('0123456789abcdef0123')
  })

  it('returns null when the name is not a main bundle', () => {
    expect(getBuildId('123.abcdef12.chunk.js')).toBeNull()
    expect(getBuildId('main.75f0989a.js.map')).toBeNull()
    expect(getBuildId('main..js')).toBeNull()
    expect(getBuildId('main.js')).toBeNull()
    expect(getBuildId('main.zzzz.js')).toBeNull()
    expect(getBuildId('')).toBeNull()
  })

  it('returns null for missing or non-string input', () => {
    expect(getBuildId()).toBeNull()
    expect(getBuildId(null)).toBeNull()
    expect(getBuildId(42)).toBeNull()
    expect(getBuildId({})).toBeNull()
  })
})

describe('getRunningBuildId', () => {
  afterEach(() => { document.head.innerHTML = '' })

  it('reads the build id from the main script of the page', () => {
    document.head.innerHTML = '<script src="/marea-ott-demo/static/js/main.75f0989a.js"></script>'
    expect(getRunningBuildId(document)).toBe('75f0989a')
  })

  it('returns null when the page has no main bundle script', () => {
    document.head.innerHTML = '<script src="/static/js/bundle.js"></script>'
    expect(getRunningBuildId(document)).toBeNull()
  })
})
