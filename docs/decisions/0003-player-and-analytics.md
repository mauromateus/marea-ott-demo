# 0003. Player and analytics

## Context

The real product loads the Lightning player from the public CDN (`https://player.cdn.mdstrm.com/lightning_player/api.js`, exposing `window.loadMSPlayer(containerId, config)`) and reports to GTM through `DataLayerService` with `ms_event_*` events. The PoC must do the same, with the correct platform.

## Decision

Player (`src/core/services/Player/`, mirrors the real `services/Player`):

- `utils/loadPlayer.js` injects the script once (same code as the real one).
- `players/Lightning/` keeps the real `normalizeConfig` and the load / attach events / destroy flow, trimmed to the events Marea uses: `play`, `pause`, `ended`, `canplay` (player ready), `timeupdate`.
- `utils/buildPlayerConfig.js` builds the live config: `{ id, type: 'live', autoplay: true, customer_extras, npaw: { name, version }, events }`. `customer_extras` is `null` for anonymous users, as in the real `getNpawCustomer`. No `access_token`: these signals are public. `npaw.name` comes from `getAnalyticsAppName(config, platform)`.
- Media ids are only in `public/config/marea.json`.
- **The Lightning SDK keeps one player per page.** Loading a second one destroys the first (observed in Chrome). `core/services/Player/index.js` tracks the active player and calls `onEvicted` on the previous owner, so the UI never shows a dead player. This is also what makes "starting video stops audio and the other way round" true at the SDK level. On top of that, jotai atoms (`isPlayingAtom`, `isVideoPlayingAtom`, `activeSourceAtom`) make each player pause when the other becomes active.
- Audio lives in `AudioPlayerProvider` (a root provider with an off-screen mount), so it keeps playing across routes, and `MiniPlayer` controls it.

Analytics (`src/components/context/GoogleTagManager/`, `src/core/services/DataLayerService.js`):

- `getTrackingData` and `trackPageView` keep the real field names (`ms_ott_name`, `ms_page_title`, `ms_video_id`, `ms_category_names`, `ms_login_status`...) but `ms_platform_origin` comes from `getPlatformOrigin()` instead of the literal `'WEB'`.
- Events: `ms_event_page_view` on every route change, `ms_event_player_ready`, `ms_event_video_start` on the first `timeupdate`, `ms_event_video_live_watch` every 30 minutes for live, `ms_event_video_progress` with `ms_video_percent` 25%, 50%, 100% for VOD. Audio uses the same events and tracking code.
- `DataLayerService` pushes `{ event, ...params }` to `window.dataLayer` (created if missing) and keeps a ring buffer of the last 20 pushes, shown on `/debug`.
- If `config.app.gtmId` is non-empty and looks like `GTM-XXXX`, `initGtm` injects the standard snippet at boot; otherwise events only go to the dataLayer.

## Differences from the real product (on purpose)

- Tracking state is cleared per content, not globally, so audio and video do not reset each other.
- VOD progress is simplified: `currentTime / duration`, no seek reset logic. Sample VOD cards are not playable, so this code path is covered by unit tests only.
- Audio events include `timeupdate` tracking. The real audio path (`registerPlayerEvents`) only registers play, pause and ended, and does not send `npaw`. Confirm with the player team that NPAW works for audio live with `npaw` in the setup.
- The first page view is a normal event; the real one is deferred into `initGtm`.
- `autoplay: true` in the setup is an assumption; the real video setup is built in `@mediastream/ott-next-core-common` (`useWebPlayerSetup`), which was not available to read.

## Consequences

- Verified in desktop Chrome: live video loads and tracks `player_ready` with the right platform; live audio plays after a user click, keeps playing across routes, and fires `player_ready` and `video_start`.
- Not verified: iOS autoplay and background audio, TV browsers, Android TWA behavior.

## How to test

- Unit: `npm test -- --watchAll=false` (payload builders, player config, eviction, audio/video exclusivity).
- Manual: `/debug` lists the last 20 dataLayer events with `ms_platform_origin` and `/debug` shows the `npaw` app name that was selected. Start radio, go to `/tv` (radio stops, mini player shows Play), press Play on the radio (TV shows "Resume TV").
