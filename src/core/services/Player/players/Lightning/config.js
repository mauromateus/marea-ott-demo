/**
 * Normalizes the player configuration to the Lightning Player API format (same as the real product).
 */
export const normalizeConfig = (config) => {
  const { startTime, aspectRatio, ...restConfig } = config

  return {
    ...restConfig,
    // The SDK keeps one module-level config, so always send aspectRatio to avoid inheriting a previous player's.
    aspectRatio: aspectRatio ?? null,
    startPos: startTime ?? 0
  }
}
