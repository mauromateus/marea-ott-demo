import initGtm from 'components/context/GoogleTagManager/utils/initGtm'

beforeEach(() => {
  delete window.dataLayer
  document.head.innerHTML = ''
})

describe('initGtm', () => {
  it('does nothing when the id is empty (GTM disabled)', () => {
    expect(initGtm('')).toBe(false)
    expect(document.getElementById('gtm-script')).toBeNull()
    expect(window.dataLayer).toBeUndefined()
  })

  it('rejects malformed ids', () => {
    expect(initGtm('<script>')).toBe(false)
    expect(initGtm('UA-123')).toBe(false)
    expect(document.getElementById('gtm-script')).toBeNull()
  })

  it('injects the standard snippet once', () => {
    expect(initGtm('GTM-ABC123')).toBe(true)
    expect(initGtm('GTM-ABC123')).toBe(true)
    const scripts = document.head.querySelectorAll('#gtm-script')
    expect(scripts).toHaveLength(1)
    expect(scripts[0].src).toBe('https://www.googletagmanager.com/gtm.js?id=GTM-ABC123')
    expect(window.dataLayer[0]).toMatchObject({ event: 'gtm.js' })
    expect(window.dataLayer).toHaveLength(1)
  })
})
