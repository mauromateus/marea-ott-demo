import formatReport from 'components/views/ViewDebug/utils/formatReport'

describe('formatReport texts', () => {
  const base = {
    platform: 'web',
    platformSource: 'default',
    analyticsAppName: '',
    appVersion: '',
    displayMode: 'browser',
    referrer: '',
    userAgent: 'UA',
    serviceWorkerControlling: 'not supported',
    online: true,
    launchQuery: '',
    sessionPlatform: '',
    url: 'https://marea.test/',
    viewport: '360x640 @3x',
    generatedAt: '2025-01-01T00:00:00.000Z'
  }
  const report = formatReport(base, [])

  it('starts with a Spanish title that keeps the brand', () => {
    expect(report.split('\n')[0]).toBe('Informe de diagnóstico de Marea (2025-01-01T00:00:00.000Z)')
  })

  it('translates the labels and the empty values, keeping technical identifiers', () => {
    expect(report).toContain('appName de analítica: (ninguno)')
    expect(report).toContain('Versión de la app: (ninguno)')
    expect(report).toContain('Parámetros de inicio: (ninguno)')
    expect(report).toContain('Plataforma guardada en la sesión: (ninguno)')
    expect(report).toContain('El service worker controla la página: no compatible')
    expect(report).toContain('En línea: sí')
    expect(report).toContain('Tamaño de la ventana: 360x640 @3x')
  })

  it('has no English labels left', () => {
    expect(report).not.toMatch(/Resolved|Display mode|Launch query|Online:|Viewport|App version/)
  })
})
