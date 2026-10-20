import QRCode from 'qrcode'

import buildQrPath from 'components/views/ViewInstall/utils/buildQrPath'
import getApkUrl from 'components/views/ViewInstall/utils/getApkUrl'

describe('buildQrPath', () => {
  it('draws one unit square per dark module', () => {
    const grid = [[1, 0], [0, 1]]
    const modules = { size: 2, get: (row, col) => grid[row][col] }
    expect(buildQrPath(modules)).toBe('M0 0h1v1h-1zM1 1h1v1h-1z')
  })

  it('builds a path from a real QR code with a finder pattern in the corner', () => {
    const { modules } = QRCode.create('https://example.com/', { errorCorrectionLevel: 'M' })
    const path = buildQrPath(modules)
    expect(modules.size).toBeGreaterThanOrEqual(21)
    expect(path.startsWith('M0 0h1v1h-1z')).toBe(true)
    expect(path.match(/M/g).length).toBeGreaterThan(50)
  })
})

describe('getApkUrl', () => {
  it('returns the trimmed absolute http(s) URL', () => {
    expect(getApkUrl({ install: { apkUrl: ' https://example.com/marea.apk ' } })).toBe('https://example.com/marea.apk')
  })

  it('returns an empty string when missing, empty or not http(s)', () => {
    expect(getApkUrl({})).toBe('')
    expect(getApkUrl(null)).toBe('')
    expect(getApkUrl({ install: { apkUrl: '' } })).toBe('')
    expect(getApkUrl({ install: { apkUrl: '   ' } })).toBe('')
    expect(getApkUrl({ install: { apkUrl: 'javascript:alert(1)' } })).toBe('')
  })
})
