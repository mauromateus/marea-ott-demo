// Network-first handler for navigations; the precached shell is only the offline/failure fallback.
export const DEFAULT_TIMEOUT_MS = 3000

export const createNavigationHandler = ({
  shellUrl,
  fetchFn,
  fallback,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  isOffline = () => false,
  createRequest = (url, init) => new Request(url, init)
}) => async (options) => {
  if (isOffline()) {
    return fallback(options)
  }

  let timer
  try {
    // A fresh non-navigate request: Workbox ignores fetchOptions on navigations, and no-cache skips the 10 min HTTP cache.
    const request = createRequest(shellUrl, { cache: 'no-cache', credentials: 'same-origin' })
    const timeout = new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(new Error('Navigation fetch timed out')), timeoutMs)
    })
    const response = await Promise.race([fetchFn(request), timeout])
    if (response && response.ok) {
      return response
    }
  } catch (error) {
    // Network error or timeout: serve the precached shell.
  } finally {
    clearTimeout(timer)
  }
  return fallback(options)
}
