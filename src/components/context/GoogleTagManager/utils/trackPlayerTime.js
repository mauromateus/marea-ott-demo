import DataLayerService from 'core/services/DataLayerService'
import getStartTime from './getStartTime'
import getTrackingData from './getTrackingData'
import formatDuration from './formatDuration'
import playerTrackingState from './playerTrackingState'
import EVENTS from '../config/constants'

const LIVE_WATCH_INTERVAL_MS = 30 * 60 * 1000
const PROGRESS_MILESTONES = [25, 50, 100]

export default function trackPlayerTime ({ currentTime, content, isDebugMode = false }) {
  const contentId = content._id
  let trackingData = playerTrackingState.get(contentId)

  if (!trackingData?.videoStartTime) {
    trackingData = { ...trackingData, videoStartTime: getStartTime() }
    playerTrackingState.set(contentId, trackingData)
  }

  const eventData = getTrackingData({
    ...content,
    msVideoStartTime: trackingData.videoStartTime,
    msVideoDuration: content?.msVideoDuration ? formatDuration(content.msVideoDuration) : 'not-set'
  })

  if (content?.msVideoType === 'Live') {
    liveTracking({ contentId, eventData, isDebugMode })
  } else {
    vodTracking({ contentId, duration: Number(content?.msVideoDuration), currentTime, eventData, isDebugMode })
  }
}

// Same flow as the real product: video_start on the first tick, then one live_watch per 30 minutes.
const liveTracking = ({ contentId, eventData, isDebugMode }) => {
  let state = playerTrackingState.get(contentId)

  if (!state?.startTime) {
    state = { ...state, count: 0, startTime: Date.now() }
    playerTrackingState.set(contentId, state)

    DataLayerService.pushEvent({ eventName: EVENTS.VIDEO_START, params: eventData })
    if (isDebugMode) console.info('Player live start tracked', eventData)
  }

  const intervalsPassed = Math.floor((Date.now() - state.startTime) / LIVE_WATCH_INTERVAL_MS)
  if (intervalsPassed > state.count) {
    state.count = intervalsPassed
    DataLayerService.pushEvent({
      eventName: EVENTS.VIDEO_LIVE_WATCH,
      params: { ...eventData, ms_video_time_count: state.count }
    })
  }
}

// Simplified from the real product: progress is currentTime / duration with no seek reset.
// At most one milestone per tick, lowest first.
const vodTracking = ({ contentId, duration, currentTime, eventData, isDebugMode }) => {
  const state = playerTrackingState.get(contentId)

  if (!state?.tracked) {
    playerTrackingState.set(contentId, { ...state, tracked: true })
    DataLayerService.pushEvent({ eventName: EVENTS.VIDEO_START, params: eventData })
    if (isDebugMode) console.info('Player vod start tracked', eventData)
    return
  }

  if (!(duration > 0 && currentTime > 0)) {
    return
  }

  const percent = (currentTime / duration) * 100
  // Short assets never reach 99%, so the final milestone threshold scales with duration (as in the real product).
  const endThreshold = duration < 60 ? 90 : duration < 300 ? 95 : 99
  const reached = (milestone) => (milestone === 100 ? percent >= endThreshold && currentTime + 3 >= duration : percent >= milestone)

  const next = PROGRESS_MILESTONES.find((milestone) => reached(milestone) && !state[milestone])
  if (next) {
    playerTrackingState.set(contentId, { ...state, [next]: true })
    DataLayerService.pushEvent({
      eventName: EVENTS.VIDEO_PROGRESS,
      params: { ...eventData, ms_video_percent: `${next}%` }
    })
    if (isDebugMode) console.info('Player vod progress tracked', eventData)
  }
}
