import getSiteUrl from 'core/Utils/getSiteUrl'

describe('getSiteUrl', () => {
  it('joins origin and basename with a trailing slash (GitHub Pages)', () => {
    expect(getSiteUrl({ origin: 'https://mauromateus.github.io', basename: '/marea-ott-demo' }))
      .toBe('https://mauromateus.github.io/marea-ott-demo/')
  })

  it('works at the origin root', () => {
    expect(getSiteUrl({ origin: 'http://localhost:5050', basename: '' })).toBe('http://localhost:5050/')
  })

  it('defaults to window.location.origin and the PUBLIC_URL basename', () => {
    expect(getSiteUrl()).toBe(`${window.location.origin}/`)
  })
})
