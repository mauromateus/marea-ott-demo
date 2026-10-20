// Public CDN script that exposes window.loadMSPlayer. It must never be cached or intercepted by the service worker.
export const LIGHTNING_PLAYER_URL = 'https://player.cdn.mdstrm.com/lightning_player/api.js'

/**
 * Dynamically loads the player script (same approach as the real product).
 */
const loadPlayerScript = (scriptUrl = LIGHTNING_PLAYER_URL) => {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${scriptUrl}"]`)
    if (existingScript) {
      if (window.loadMSPlayer) {
        resolve()
      } else {
        existingScript.addEventListener('load', () => resolve())
        existingScript.addEventListener('error', () => reject(new Error(`Failed to load script: ${scriptUrl}`)))
      }
      return
    }

    const script = document.createElement('script')
    script.src = scriptUrl
    script.type = 'text/javascript'
    script.defer = true
    script.crossOrigin = 'anonymous'

    script.onload = () => resolve()
    script.onerror = () => {
      script.remove()
      reject(new Error(`Failed to load script: ${scriptUrl}`))
    }

    document.head.appendChild(script)
  })
}

export default loadPlayerScript
