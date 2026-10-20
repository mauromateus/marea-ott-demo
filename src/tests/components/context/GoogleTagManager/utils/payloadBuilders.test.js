import getTrackingData from 'components/context/GoogleTagManager/utils/getTrackingData'
import trackPageView from 'components/context/GoogleTagManager/utils/trackPageView'
import trackPlayerReady from 'components/context/GoogleTagManager/utils/trackPlayerReady'
import trackPlayerTime from 'components/context/GoogleTagManager/utils/trackPlayerTime'
import playerTrackingState from 'components/context/GoogleTagManager/utils/playerTrackingState'
import getStartTime from 'components/context/GoogleTagManager/utils/getStartTime'
import EVENTS from 'components/context/GoogleTagManager/config/constants'
import DataLayerService from 'core/services/DataLayerService'
import { resetPlatformOrigin, initPlatformOrigin } from 'core/Utils/getPlatformOrigin'

const launchAs = (platform) => {
  window.sessionStorage.clear()
  window.history.pushState({}, '', platform ? `/?ms_platform=${platform}` : '/')
  resetPlatformOrigin()
  initPlatformOrigin()
}

const lastEvent = () => window.dataLayer[window.dataLayer.length - 1]
const eventsNamed = (name) => window.dataLayer.filter((e) => e.event === name)

beforeEach(() => {
  delete window.dataLayer
  DataLayerService.clearRecentEvents()
  playerTrackingState.clear()
  window.matchMedia = () => ({ matches: false, addListener () {}, removeListener () {} })
  launchAs(null)
})

afterEach(() => jest.restoreAllMocks())

describe('getTrackingData', () => {
  it('mirrors the real field names and defaults', () => {
    expect(getTrackingData({ page: '/tv', msPageTitle: 'Marea TV', msOttName: 'Marea', msVideoType: 'Live', msLoginStatus: 'anonymous' })).toEqual({
      page: '/tv',
      ms_page_title: 'Marea TV',
      ms_ott_name: 'Marea',
      ms_show_name: 'not-set',
      ms_video_id: 'not-set',
      ms_video_title: 'not-set',
      ms_video_type: 'Live',
      ms_video_start_time: undefined,
      ms_video_duration: undefined,
      ms_category_names: 'not-set',
      ms_login_status: 'anonymous',
      ms_platform_origin: 'web'
    })
  })

  it.each(['web', 'android', 'android-tv', 'ios'])('ms_platform_origin reflects the resolver (%s)', (platform) => {
    launchAs(platform === 'web' ? null : platform)
    expect(getTrackingData({}).ms_platform_origin).toBe(platform)
  })

  it('reports pwa-web when installed (standalone)', () => {
    window.matchMedia = (q) => ({ matches: q === '(display-mode: standalone)', addListener () {}, removeListener () {} })
    resetPlatformOrigin()
    initPlatformOrigin()
    expect(getTrackingData({}).ms_platform_origin).toBe('pwa-web')
  })

  it('adds user and utm only when present', () => {
    expect(getTrackingData({})).not.toHaveProperty('ms_user_id')
    expect(getTrackingData({ msUserId: 'u1', msUtmParams: 'a=b' })).toMatchObject({ ms_user_id: 'u1', utm_params: 'a=b' })
  })
})

describe('trackPageView', () => {
  it('pushes ms_event_page_view with the resolver platform', () => {
    launchAs('fire-tv')
    trackPageView({ page: '/radio', pageData: { msPageTitle: 'Marea Radio', msOttName: 'Marea', msLoginStatus: 'anonymous' } })
    expect(lastEvent()).toMatchObject({
      event: EVENTS.PAGE_VIEW,
      page: '/radio',
      ms_page_title: 'Marea Radio',
      ms_ott_name: 'Marea',
      ms_category_names: 'not-set',
      ms_platform_origin: 'fire-tv'
    })
  })

  it('event names keep the ms_event_ prefix of the real product', () => {
    expect(EVENTS).toEqual({
      PAGE_VIEW: 'ms_event_page_view',
      PLAYER_READY: 'ms_event_player_ready',
      VIDEO_START: 'ms_event_video_start',
      VIDEO_PROGRESS: 'ms_event_video_progress',
      VIDEO_LIVE_WATCH: 'ms_event_video_live_watch',
      INSTALL_PROMPT_SHOWN: 'ms_event_install_prompt_shown',
      INSTALL_CHOICE: 'ms_event_install_choice',
      APP_INSTALLED: 'ms_event_app_installed',
      INSTALL_SHEET_SHOWN: 'ms_event_install_sheet_shown',
      INSTALL_SHEET_DISMISSED: 'ms_event_install_sheet_dismissed'
    })
  })
})

describe('getStartTime', () => {
  it('rounds to the nearest half hour', () => {
    expect(getStartTime(new Date(2025, 0, 1, 3, 5))).toBe('03:00:00')
    expect(getStartTime(new Date(2025, 0, 1, 3, 20))).toBe('03:30:00')
    expect(getStartTime(new Date(2025, 0, 1, 3, 48))).toBe('04:00:00')
    expect(getStartTime(new Date(2025, 0, 1, 23, 50))).toBe('00:00:00')
  })
})

const liveVideo = { _id: 'vid1', msVideoId: 'vid1', msVideoTitle: 'Marea TV', msVideoType: 'Live', msOttName: 'Marea', msLoginStatus: 'anonymous' }
const liveAudio = { _id: 'aud1', msVideoId: 'aud1', msVideoTitle: 'Marea Radio', msVideoType: 'Live', msOttName: 'Marea', msLoginStatus: 'anonymous' }

describe('trackPlayerReady', () => {
  it('pushes ms_event_player_ready with platform and start time', () => {
    launchAs('android')
    trackPlayerReady({ content: liveVideo })
    expect(lastEvent()).toMatchObject({
      event: EVENTS.PLAYER_READY,
      ms_video_id: 'vid1',
      ms_platform_origin: 'android'
    })
    expect(lastEvent().ms_video_start_time).toMatch(/^\d\d:\d\d:00$/)
  })

  it('does not reset the tracking state of other content', () => {
    trackPlayerReady({ content: liveAudio })
    trackPlayerTime({ currentTime: 1, content: liveAudio })
    trackPlayerReady({ content: liveVideo })
    trackPlayerTime({ currentTime: 1, content: liveAudio })
    expect(eventsNamed(EVENTS.VIDEO_START)).toHaveLength(1)
  })
})

describe('trackPlayerTime (live)', () => {
  it('pushes video_start once for video, with the platform', () => {
    launchAs('samsung-tv')
    trackPlayerReady({ content: liveVideo })
    trackPlayerTime({ currentTime: 1, content: liveVideo })
    trackPlayerTime({ currentTime: 2, content: liveVideo })
    const starts = eventsNamed(EVENTS.VIDEO_START)
    expect(starts).toHaveLength(1)
    expect(starts[0]).toMatchObject({ ms_video_id: 'vid1', ms_platform_origin: 'samsung-tv' })
  })

  it('pushes the equivalent video_start for audio', () => {
    trackPlayerReady({ content: liveAudio })
    trackPlayerTime({ currentTime: 1, content: liveAudio })
    expect(eventsNamed(EVENTS.VIDEO_START)[0]).toMatchObject({ ms_video_id: 'aud1', ms_video_title: 'Marea Radio' })
  })

  it('pushes a live watch event every 30 minutes', () => {
    const now = Date.now()
    const spy = jest.spyOn(Date, 'now').mockReturnValue(now)
    trackPlayerReady({ content: liveVideo })
    trackPlayerTime({ currentTime: 1, content: liveVideo })
    spy.mockReturnValue(now + 31 * 60 * 1000)
    trackPlayerTime({ currentTime: 2, content: liveVideo })
    trackPlayerTime({ currentTime: 3, content: liveVideo })
    const watches = eventsNamed(EVENTS.VIDEO_LIVE_WATCH)
    expect(watches).toHaveLength(1)
    expect(watches[0].ms_video_time_count).toBe(1)
  })
})

describe('trackPlayerTime (VOD progress milestones)', () => {
  const vod = { _id: 'vod1', msVideoId: 'vod1', msVideoTitle: 'Sample', msVideoType: 'VOD', msVideoDuration: 100, msOttName: 'Marea', msLoginStatus: 'anonymous' }

  it('pushes video_start then 25%, 50% and 100% once each, in order', () => {
    trackPlayerReady({ content: vod })
    ;[1, 10, 26, 30, 51, 60, 97, 98].forEach((t) => trackPlayerTime({ currentTime: t, content: vod }))
    expect(eventsNamed(EVENTS.VIDEO_START)).toHaveLength(1)
    expect(eventsNamed(EVENTS.VIDEO_PROGRESS).map((e) => e.ms_video_percent)).toEqual(['25%', '50%', '100%'])
  })

  it('emits one milestone per tick even when several were crossed (a seek forward)', () => {
    trackPlayerReady({ content: vod })
    trackPlayerTime({ currentTime: 1, content: vod })
    trackPlayerTime({ currentTime: 60, content: vod })
    expect(eventsNamed(EVENTS.VIDEO_PROGRESS).map((e) => e.ms_video_percent)).toEqual(['25%'])
    trackPlayerTime({ currentTime: 61, content: vod })
    expect(eventsNamed(EVENTS.VIDEO_PROGRESS).map((e) => e.ms_video_percent)).toEqual(['25%', '50%'])
  })
})
