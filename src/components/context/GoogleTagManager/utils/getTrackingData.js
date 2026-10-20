import getPlatformOrigin from 'core/Utils/getPlatformOrigin'

export default function getTrackingData (metrics) {
  const event = {
    page: metrics?.page,
    ms_page_title: metrics?.msPageTitle,
    ms_ott_name: metrics?.msOttName,
    ms_show_name: metrics?.msShowName || 'not-set',
    ms_video_id: metrics?.msVideoId || 'not-set',
    ms_video_title: metrics?.msVideoTitle || 'not-set',
    ms_video_type: metrics?.msVideoType,
    ms_video_start_time: metrics?.msVideoStartTime,
    ms_video_duration: metrics?.msVideoDuration,
    ms_category_names: metrics?.msCategoryNames || 'not-set',
    ms_login_status: metrics?.msLoginStatus,
    // The real product hardcodes 'WEB' here.
    ms_platform_origin: getPlatformOrigin()
  }

  if (metrics?.msUserId) {
    event.ms_user_id = metrics?.msUserId
  }
  if (metrics?.msUtmParams) {
    event.utm_params = metrics?.msUtmParams
  }
  return event
}
