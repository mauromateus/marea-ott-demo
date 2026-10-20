export const VERSION_TIMEOUT_MS = 2000

export const NO_WORKER = { status: 'none', version: null, waiting: false }

const readRegistration = async (container) => {
  try {
    return container ? await container.getRegistration() : undefined
  } catch (error) {
    return undefined
  }
}

// Resolves the bundle name a worker answers over a MessageChannel, or null on silence, error or an old worker.
const askVersion = (worker, { Channel, timers, timeoutMs }) => new Promise((resolve) => {
  if (!worker || !Channel) {
    resolve(null)
    return
  }
  let timer
  const finish = (version) => {
    timers.clearTimeout(timer)
    resolve(version)
  }
  try {
    const channel = new Channel()
    channel.port1.onmessage = (event) => finish(event.data?.type === 'VERSION' ? event.data.main || null : null)
    timer = timers.setTimeout(() => finish(null), timeoutMs)
    worker.postMessage({ type: 'GET_VERSION' }, [channel.port2])
  } catch (error) {
    finish(null)
  }
})

/**
 * Read-only snapshot for the debug page: the bundle the active worker holds and whether an update is waiting.
 * status: 'none' (no support or nothing registered) | 'unanswered' (no active worker or no answer) | 'answered'.
 */
export default async function queryWorkerVersion ({
  container = typeof navigator !== 'undefined' ? navigator.serviceWorker : undefined,
  Channel = typeof MessageChannel !== 'undefined' ? MessageChannel : null,
  timers = { setTimeout: (fn, ms) => setTimeout(fn, ms), clearTimeout: (id) => clearTimeout(id) },
  timeoutMs = VERSION_TIMEOUT_MS
} = {}) {
  const registration = await readRegistration(container)
  if (!registration) {
    return NO_WORKER
  }
  const waiting = !!registration.waiting
  const version = await askVersion(registration.active, { Channel, timers, timeoutMs })
  return version ? { status: 'answered', version, waiting } : { status: 'unanswered', version: null, waiting }
}
