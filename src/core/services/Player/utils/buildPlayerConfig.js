/**
 * Lightning config for a live signal. Same keys the real NextPlayer sends
 * (type, id, npaw, customer_extras, events); no access_token because these signals are public.
 */
export default function buildPlayerConfig ({ media, npaw, customerExtras = null, events }) {
  return {
    id: media.id,
    type: media.type || 'live',
    autoplay: true,
    ...(media.player && { player: media.player }),
    customer_extras: customerExtras,
    npaw: {
      name: npaw?.name,
      version: npaw?.version
    },
    events
  }
}
