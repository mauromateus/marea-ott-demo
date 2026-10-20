import { PLAYER_EVENTS } from './constants'
import { normalizeConfig } from './config'

// Trimmed version of the real LightningPlayer strategy: same load/attach/destroy flow, only the events Marea uses.
export default class LightningPlayer {
  hasEnded = false

  _boundHandlers = null

  async loadPlayer (containerId, config) {
    if (!window.loadMSPlayer) {
      throw new Error('Lightning Player API not available')
    }

    this.hasEnded = false

    const player = await window.loadMSPlayer(containerId, normalizeConfig(config))
    this.player = player

    this._detachEventListeners(player)
    this._attachEventListeners(player, config?.events)

    return player
  }

  async destroy () {
    try {
      if (this.player) {
        this._detachEventListeners(this.player)
        await this.player.destroy()
      }
    } catch (e) {
      // external player errors during destroy are not actionable
    } finally {
      this.player = null
      this._boundHandlers = null
      this.onDestroy?.()
    }
  }

  _detachEventListeners (player) {
    const handlers = this._boundHandlers
    if (!handlers) {
      return
    }
    player.off(PLAYER_EVENTS.PLAY, handlers.play)
    player.off(PLAYER_EVENTS.ENDED, handlers.ended)
    player.off(PLAYER_EVENTS.PAUSE, handlers.pause)
    if (handlers.timeUpdate) {
      player.off(PLAYER_EVENTS.TIME_UPDATE, handlers.timeUpdate)
    }
    this._boundHandlers = null
  }

  _attachEventListeners (player, eventCallbacks) {
    const handlers = {
      play: () => this._handlePlay(eventCallbacks),
      ended: () => this._handleEnded(eventCallbacks),
      pause: () => eventCallbacks?.onVideoStop?.(),
      timeUpdate: eventCallbacks?.onTimeUpdate ? (currentTime) => eventCallbacks.onTimeUpdate(currentTime) : null
    }
    this._boundHandlers = handlers

    player.on(PLAYER_EVENTS.PLAY, handlers.play)
    player.on(PLAYER_EVENTS.ENDED, handlers.ended)
    player.on(PLAYER_EVENTS.PAUSE, handlers.pause)

    if (eventCallbacks?.onPlayerReady) {
      player.once(PLAYER_EVENTS.CAN_PLAY, () => eventCallbacks.onPlayerReady())
    }
    if (handlers.timeUpdate) {
      player.on(PLAYER_EVENTS.TIME_UPDATE, handlers.timeUpdate)
    }
  }

  _handlePlay (eventCallbacks) {
    if (this.hasEnded) {
      this.hasEnded = false
      eventCallbacks?.onReplay?.()
    } else {
      eventCallbacks?.onPlay?.()
    }
  }

  _handleEnded (eventCallbacks) {
    this.hasEnded = true
    eventCallbacks?.onVideoEnd?.()
  }
}
