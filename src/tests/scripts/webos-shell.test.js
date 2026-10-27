const fs = require('fs')
const path = require('path')
const { PNG } = require('pngjs')

const SHELL_DIR = path.join(__dirname, '..', '..', '..', 'shells', 'lg-webos')
const read = (file) => fs.readFileSync(path.join(SHELL_DIR, file), 'utf8')
const pngSize = (file) => {
  const png = PNG.sync.read(fs.readFileSync(path.join(SHELL_DIR, file)))
  return `${png.width}x${png.height}`
}

const appinfo = JSON.parse(read('appinfo.json'))

// Rules from LG's appinfo.json reference (webostv.developer.lge.com/develop/references/appinfo-json).
describe('webOS shell appinfo.json', () => {
  it('has every required property', () => {
    ;['id', 'title', 'type', 'main', 'icon', 'version'].forEach((key) => expect(appinfo[key]).toBeTruthy())
  })

  it('uses a valid app id (a-z, 0-9, dots, hyphens; not a reserved prefix)', () => {
    expect(appinfo.id).toMatch(/^[a-z0-9][a-z0-9.-]+$/)
    expect(appinfo.id).not.toMatch(/^com\.(palm|webos|lge|palmdts)/)
  })

  it('is a web app with a three-integer version and a Launcher title of at most 20 characters', () => {
    expect(appinfo.type).toBe('web')
    expect(appinfo.version).toMatch(/^(0|[1-9]\d{0,8})\.(0|[1-9]\d{0,8})\.(0|[1-9]\d{0,8})$/)
    expect(appinfo.title.length).toBeLessThanOrEqual(20)
  })

  it('points at files that exist, with the sizes webOS expects', () => {
    expect(fs.existsSync(path.join(SHELL_DIR, appinfo.main))).toBe(true)
    expect(pngSize(appinfo.icon)).toBe('80x80')
    expect(pngSize(appinfo.largeIcon)).toBe('130x130')
    expect(pngSize(appinfo.splashBackground)).toBe('1920x1080')
  })

  it('uses a resolution the web runtime accepts', () => {
    expect(['1920x1080', '1280x720']).toContain(appinfo.resolution)
  })
})

describe('webOS shell main page', () => {
  const html = read(appinfo.main)

  it('opens the published PWA and injects the lg-tv platform', () => {
    expect(html).toContain('https://mauromateus.github.io/marea-ott-demo/?ms_platform=lg-tv')
  })

  it('redirects with both meta refresh and script, so one failing does not strand the TV', () => {
    expect(html).toMatch(/<meta http-equiv="refresh"/)
    expect(html).toMatch(/location\.replace\(/)
  })

  it('does not embed secrets', () => {
    expect(html + JSON.stringify(appinfo)).not.toMatch(/token|password|secret/i)
  })
})
