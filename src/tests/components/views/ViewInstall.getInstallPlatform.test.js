import getInstallPlatform from 'components/views/ViewInstall/utils/getInstallPlatform'

describe('getInstallPlatform', () => {
  it('maps the detected device to a steps platform', () => {
    expect(getInstallPlatform({ isIos: true, isAndroid: false })).toBe('iphone')
    expect(getInstallPlatform({ isIos: false, isAndroid: true })).toBe('android')
    expect(getInstallPlatform({ isIos: false, isAndroid: false })).toBe('desktop')
  })

  it('tolerates a missing context', () => {
    expect(getInstallPlatform()).toBe('desktop')
  })
})
