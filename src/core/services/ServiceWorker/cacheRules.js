// Pure rules shared by src/service-worker.js and the unit tests.
import getBasename from 'core/Utils/getBasename'

const MEDIA_PATH = /\.(m3u8|mpd|ts|m4s|m4a|m4v|aac|mp3|mp4|webm|ogg|cmfv|cmfa)$/i
const MEDIA_DESTINATIONS = ['audio', 'video', 'track']
const FILE_EXTENSION = /\/[^/?]+\.[^/]+$/

const isMdstrmHost = (hostname) => hostname === 'mdstrm.com' || hostname.endsWith('.mdstrm.com')

/** Player scripts, manifests and segments: the service worker must leave these to the network. */
export const isMediaRequest = (url, request) => (
  isMdstrmHost(url.hostname) ||
  MEDIA_PATH.test(url.pathname) ||
  MEDIA_DESTINATIONS.includes(request.destination)
)

/** Same-origin images, fonts and config JSON only. basePath is the deployment subpath ('' at the root). */
export const shouldRuntimeCache = ({ url, request, origin, basePath = getBasename() }) => {
  if (url.origin !== origin || isMediaRequest(url, request)) {
    return false
  }
  return (
    request.destination === 'image' ||
    request.destination === 'font' ||
    (url.pathname.startsWith(`${basePath}/config/`) && url.pathname.endsWith('.json'))
  )
}

/** Navigations that get the SPA shell: not files (e.g. /.well-known/assetlinks.json) nor reserved `/_` paths. */
export const isNavigationFallback = ({ url, request, basePath = getBasename() }) => (
  request.mode === 'navigate' &&
  !url.pathname.startsWith(`${basePath}/_`) &&
  !FILE_EXTENSION.test(url.pathname)
)
