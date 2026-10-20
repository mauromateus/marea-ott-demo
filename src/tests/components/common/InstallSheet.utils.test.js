import isSnoozed, { SNOOZE_MS } from 'components/common/InstallSheet/utils/isSnoozed'
import { trackInstallSheetShown, trackInstallSheetDismissed } from 'components/context/GoogleTagManager/utils/trackInstall'
import DataLayerService from 'core/services/DataLayerService'

describe('isSnoozed', () => {
  const now = Date.UTC(2026, 0, 15)

  it('is 7 days', () => {
    expect(SNOOZE_MS).toBe(7 * 24 * 60 * 60 * 1000)
  })

  it('is true inside the window and false at and after 7 days', () => {
    expect(isSnoozed(now - 1000, now)).toBe(true)
    expect(isSnoozed(now - SNOOZE_MS + 1, now)).toBe(true)
    expect(isSnoozed(now - SNOOZE_MS, now)).toBe(false)
  })

  it('is false for missing, non numeric or future values', () => {
    expect(isSnoozed(undefined, now)).toBe(false)
    expect(isSnoozed(null, now)).toBe(false)
    expect(isSnoozed('yesterday', now)).toBe(false)
    expect(isSnoozed(now + 1000, now)).toBe(false)
  })
})

describe('install sheet tracking', () => {
  beforeEach(() => {
    delete window.dataLayer
    DataLayerService.clearRecentEvents()
    window.matchMedia = () => ({ matches: false, addListener () {}, removeListener () {} })
  })

  it('pushes the shown and dismissed events with the platform origin', () => {
    trackInstallSheetShown('ios')
    trackInstallSheetDismissed('ios')
    expect(window.dataLayer).toEqual([
      { event: 'ms_event_install_sheet_shown', ms_install_variant: 'ios', ms_platform_origin: 'web' },
      { event: 'ms_event_install_sheet_dismissed', ms_install_variant: 'ios', ms_platform_origin: 'web' }
    ])
  })
})
