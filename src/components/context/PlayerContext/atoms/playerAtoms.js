import { atom } from 'jotai'

/**
 * Whether the audio player is playing (same name and meaning as the real isPlayingAtom, scoped to audio here).
 */
export const isPlayingAtom = atom(false)

/** idle | loading | playing | paused | error */
export const audioStatusAtom = atom('idle')

export const isVideoPlayingAtom = atom(false)

/**
 * The source that most recently asked to play ('audio' | 'video' | null).
 * Each player pauses itself when the other one becomes the active source.
 */
export const activeSourceAtom = atom(null)
