import DataLayerService from 'core/services/DataLayerService'
import getStartTime from './getStartTime'
import getTrackingData from './getTrackingData'
import formatDuration from './formatDuration'
import playerTrackingState from './playerTrackingState'
import EVENTS from '../config/constants'

export default function trackPlayerReady ({ content, isDebugMode = false }) {
  const videoStartTime = getStartTime()
  const videoDuration = content?.msVideoDuration ? formatDuration(content.msVideoDuration) : 'not-set'

  // Fresh state for this content only (the real product clears everything; see playerTrackingState).
  playerTrackingState.delete(content._id)
  playerTrackingState.set(content._id, { videoStartTime })

  const eventData = getTrackingData({
    ...content,
    msVideoStartTime: videoStartTime,
    msVideoDuration: videoDuration
  })

  DataLayerService.pushEvent({
    eventName: EVENTS.PLAYER_READY,
    params: eventData
  })

  if (isDebugMode) {
    console.info('Player ready tracked', eventData)
  }
}
