import LightningPlayer from './players/Lightning/Lightning'
import loadPlayerScript from './utils/loadPlayer'

// The Lightning SDK keeps a single player per page: a second loadMSPlayer() tears the first one down.
// Tracking the active player lets its owner learn that it was evicted instead of showing a dead UI.
let active = null

const evictActive = () => {
  const previous = active
  active = null
  if (previous) {
    previous.strategy.destroy()
    previous.onEvicted?.()
  }
}

/**
 * Loads the Lightning script and mounts a player in the container.
 * Returns the strategy (it owns event cleanup) and the SDK player instance.
 * The real product also has an adapter and a Screen strategy; the PoC only needs Lightning.
 * @param {string} containerId
 * @param {object} config Lightning config including `events`
 * @param {{onEvicted?: Function}} [options] called when another player takes over the SDK
 */
export default async function loadPlayerWithAdapter (containerId, config, { onEvicted } = {}) {
  await loadPlayerScript()
  evictActive()

  const strategy = new LightningPlayer()
  strategy.onDestroy = () => {
    if (active?.strategy === strategy) {
      active = null
    }
  }

  const player = await strategy.loadPlayer(containerId, config)
  active = { strategy, onEvicted }
  return { strategy, player }
}

export { loadPlayerScript }
