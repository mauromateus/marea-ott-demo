import getBasename from 'core/Utils/getBasename'

// Canonical URL of the app (what the QR code opens): origin + base path, no query, so it works on Pages and at root.
export default function getSiteUrl ({ origin = window.location.origin, basename = getBasename() } = {}) {
  return `${origin}${basename}/`
}
