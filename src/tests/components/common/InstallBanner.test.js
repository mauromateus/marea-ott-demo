import React from 'react'
import { screen, fireEvent } from '@testing-library/react'

import InstallBanner from 'components/common/InstallBanner/InstallBanner'
import Storage from 'core/Storage'
import renderWithProviders from '../../utils/renderWithProviders'

const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
const MAC_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15'
const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'
const KEY = 'marea:install-banner-dismissed'

const setDevice = ({ ua, platform, touch = 5, standalone = false }) => {
  jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(ua)
  jest.spyOn(window.navigator, 'platform', 'get').mockReturnValue(platform)
  Object.defineProperty(window.navigator, 'maxTouchPoints', { value: touch, configurable: true })
  Object.defineProperty(window.navigator, 'standalone', { value: standalone, configurable: true })
  window.matchMedia = () => ({ matches: false, addListener () {}, removeListener () {} })
}

beforeEach(() => window.localStorage.clear())

afterEach(() => {
  jest.restoreAllMocks()
  delete window.navigator.maxTouchPoints
  delete window.navigator.standalone
})

describe('iOS install instructions banner', () => {
  it('shows the instructions on iPhone Safari in a browser tab, with a link to /install', () => {
    setDevice({ ua: IPHONE_UA, platform: 'iPhone' })
    const { container } = renderWithProviders(<InstallBanner />, { withAudio: false })
    expect(container.textContent).toContain('Install Marea: tap Share, then Add to Home Screen')
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /more help/i })).toHaveAttribute('href', '/install')
  })

  it('shows on iPadOS desktop-class Safari', () => {
    setDevice({ ua: MAC_UA, platform: 'MacIntel', touch: 5 })
    renderWithProviders(<InstallBanner />, { withAudio: false })
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument()
  })

  it.each([
    ['standalone', { ua: IPHONE_UA, platform: 'iPhone', standalone: true }, 'web'],
    ['installed PWA platform', { ua: IPHONE_UA, platform: 'iPhone' }, 'pwa-web'],
    ['Android Chrome', { ua: ANDROID_UA, platform: 'Linux armv8l' }, 'web'],
    ['Android TWA shell', { ua: ANDROID_UA, platform: 'Linux armv8l' }, 'android'],
    ['a Mac without touch', { ua: MAC_UA, platform: 'MacIntel', touch: 0 }, 'web']
  ])('is hidden for %s', (_name, device, platform) => {
    setDevice(device)
    renderWithProviders(<InstallBanner />, { platform, withAudio: false })
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument()
  })

  it('is hidden on the /install page, which already has the steps', () => {
    setDevice({ ua: IPHONE_UA, platform: 'iPhone' })
    renderWithProviders(<InstallBanner />, { route: '/install', withAudio: false })
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument()
  })

  it('remembers the dismissal through the Storage wrapper and does not come back', () => {
    setDevice({ ua: IPHONE_UA, platform: 'iPhone' })
    const first = renderWithProviders(<InstallBanner />, { withAudio: false })
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }))
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument()
    expect(Storage.getItem(KEY)).toBe(true)
    first.unmount()

    renderWithProviders(<InstallBanner />, { withAudio: false })
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument()
  })
})
