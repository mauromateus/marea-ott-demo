import { trackInstallSheetShown, trackInstallSheetDismissed } from 'components/context/GoogleTagManager/utils/trackInstall'
import DataLayerService from 'core/services/DataLayerService'

describe('install sheet tracking', () => {
  beforeEach(() => {
    delete window.dataLayer
    DataLayerService.clearRecentEvents()
    window.matchMedia = () => ({ matches: false, addListener () {}, removeListener () {} })
  })

  it('pushes the shown and dismissed events with the platform origin', () => {
    trackInstallSheetShown('ios')
    trackInstallSheetDismissed('ios', 'progressive')
    expect(window.dataLayer).toEqual([
      { event: 'ms_event_install_sheet_shown', ms_install_variant: 'ios', ms_platform_origin: 'web' },
      { event: 'ms_event_install_sheet_dismissed', ms_install_variant: 'ios', ms_install_reappear: 'progressive', ms_platform_origin: 'web' }
    ])
  })
})
