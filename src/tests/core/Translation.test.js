import { translate, setLanguage, getLanguage, initLanguage, DEFAULT_LANGUAGE } from 'core/Translation'

afterEach(() => {
  setLanguage(DEFAULT_LANGUAGE)
  document.documentElement.lang = ''
  jest.restoreAllMocks()
})

describe('translate', () => {
  it('returns the Spanish text for a known key', () => {
    expect(translate('common.live')).toBe('EN VIVO')
  })

  it('interpolates {name}-style params', () => {
    expect(translate('install.sheet.title', { name: 'Marea' })).toBe('Instala Marea')
  })

  it('leaves a placeholder untouched when its param is missing', () => {
    expect(translate('install.sheet.title')).toBe('Instala {name}')
  })

  it('returns the key for a missing entry', () => {
    expect(translate('nope.missing')).toBe('nope.missing')
  })

  it('warns about a missing key in development only', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const env = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    translate('nope.missing')
    expect(warn).not.toHaveBeenCalled()
    process.env.NODE_ENV = 'development'
    translate('nope.missing')
    process.env.NODE_ENV = env
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('nope.missing')
  })
})

describe('language selection', () => {
  it('defaults to es', () => {
    expect(getLanguage()).toBe('es')
  })

  it('falls back to the default language for an unknown code', () => {
    expect(setLanguage('xx')).toBe('es')
  })

  it('initLanguage reads app.language and sets <html lang>', () => {
    expect(initLanguage({ app: { language: 'es' } })).toBe('es')
    expect(document.documentElement.lang).toBe('es')
  })

  it('initLanguage tolerates a config without a language', () => {
    expect(initLanguage({ app: {} })).toBe('es')
    expect(document.documentElement.lang).toBe('es')
  })
})
