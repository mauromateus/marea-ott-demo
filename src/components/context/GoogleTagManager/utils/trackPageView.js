import DataLayerService from 'core/services/DataLayerService'
import getPlatformOrigin from 'core/Utils/getPlatformOrigin'
import EVENTS from '../config/constants'

export default function trackPageView ({ page, pageData, isDebugMode = false }) {
  const eventData = {
    page,
    ms_page_title: pageData?.msPageTitle,
    ms_ott_name: pageData?.msOttName,
    ms_show_name: pageData?.msShowName,
    ms_video_id: pageData?.msVideoId,
    ms_video_title: pageData?.msVideoTitle,
    ms_category_names: pageData?.msCategoryNames || 'not-set',
    ms_login_status: pageData?.msLoginStatus,
    // The real product hardcodes 'WEB' here.
    ms_platform_origin: getPlatformOrigin()
  }

  if (pageData?.msUserId) {
    eventData.ms_user_id = pageData?.msUserId
  }

  if (pageData?.msUtmParams) {
    eventData.utm_params = pageData?.msUtmParams
  }

  // The real one defers the first page view to initGtm; here GTM (if enabled) is injected at boot and reads the queue.
  DataLayerService.pushEvent({
    eventName: EVENTS.PAGE_VIEW,
    params: eventData
  })

  if (isDebugMode) {
    console.info('Page view tracked', eventData)
  }
}
