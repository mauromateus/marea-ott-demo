const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/

/**
 * Injects the standard GTM snippet. Returns false (and does nothing) when the id is empty or malformed.
 * Without it the app still pushes to window.dataLayer, which is what /debug shows.
 */
export default function initGtm (gtmId) {
  if (!gtmId || !GTM_ID_PATTERN.test(gtmId)) {
    return false
  }
  if (document.getElementById('gtm-script')) {
    return true
  }

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })

  const script = document.createElement('script')
  script.id = 'gtm-script'
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`
  document.head.appendChild(script)
  return true
}
