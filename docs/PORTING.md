# Porting to ott-next-core-web

Paths below are in the real repo `ott-next-core-web` (`src/...`). Marea file names are in this repo. Port in this order; each step is independent and safe to ship alone.

## 1. Platform resolver

Copy `src/core/Utils/getPlatformOrigin.js` to `src/core/Utils/getPlatformOrigin.js` and its tests to `src/tests/core/Utils/`.

- It imports `core/Session`. The real `src/core/Session.js` works, but harden it first: its constructor reads `window.sessionStorage` once and `setItem` / `removeItem` can throw (quota, blocked storage). Marea's `src/core/Session.js` resolves the store per call and guards every access; take that version. The resolver must never throw.
- Call `initPlatformOrigin({ useReferrerSignal })` once at boot, after the config is loaded and before the first render or the first analytics event (`src/index.js` / where `ConfigService.getJson()` resolves). Read `useReferrerSignal` from the OTT config (Marea: `analytics.referrerSignal`).
- Never use `Storage.js` (localStorage) for this value (ADR 0001).

## 2. Analytics: stop hardcoding `'WEB'`

| Real file | Change |
|---|---|
| `src/components/v2/context/GoogleTagManager/utils/getTrackingData.js` line 14 | `ms_platform_origin: 'WEB'` becomes `ms_platform_origin: getPlatformOrigin()` |
| `src/components/v2/context/GoogleTagManager/utils/trackPageView.js` line 22 | same change |
| `src/tests/components/v2/context/GoogleTagManager/utils/getTrackingData.test.js` (lines ~4-5, 18-19, 32) | these tests pin `'WEB'`; update them to assert the resolver value (see Marea `payloadBuilders.test.js`) |
| `src/tests/components/v2/context/GoogleTagManager/utils/trackPageView.test.js` (lines ~2, 33) | same |

Decision needed from analytics: the real value is `'WEB'` (uppercase) and Marea emits lowercase whitelist values (`web`, `android`...). Either keep lowercase and update the GTM / BigQuery side, or upper-case in `getTrackingData` / `trackPageView` (and keep a single mapping function). Check what GTM triggers and reports filter on `ms_platform_origin` before choosing.

Other `getTrackingData` callers (login events, `trackLogin*.js`) go through the same builder, so they follow automatically; verify with a grep for `ms_platform_origin`.

## 3. NPAW app name per platform

`src/components/v2/context/NpawContext/utils/getNpawApp.js` returns `config.analytics.npaw.appName`. Change it to pick the per-platform name, falling back to the current value:

```js
// Marea equivalent: src/core/Utils/getAnalyticsAppName.js
appName: config?.analytics?.npaw?.appNames?.[getPlatformOrigin()] || config?.analytics?.npaw?.appName
```

Note the real config nests it under `analytics.npaw` (Marea uses `analytics.appNames`). `useWebNextPlayer.js` already passes `getNpawApp().appName` as `npaw.name`, so the player picks it up with no further change. Add `appNames` to the OTT configs that have an app (key = platform value, value = the NPAW app name the analytics team created).

Audio: the real audio path (`NextPlayer/utils/playAudioContent.js`) does not send `npaw` at all. Marea sends it for audio live. Confirm with the player team before copying that.

## 4. App download banner

`src/components/v2/content/AppDownloadBanner/AppDownloadBanner.js` renders the banner when `useAppBanner()` says `isModalVisible`. Inside an installed PWA or a native shell, the banner makes no sense. In `hooks/useAppBanner`, return not visible when `getPlatformOrigin() !== 'web'`. The demo's install button and iOS banner avoid the same shell problem the same way (`canShowInstallUi(platform)` in `src/core/Utils/detectInstallContext.js`, ADR 0005): they render only when the resolved platform is `web`.

## 5. Service worker, manifest, icons (needs the platform team)

The real repo has `src/serviceWorker.js` and a CRA-style setup with craco. Marea uses CRA's InjectManifest (`src/service-worker.js`). Before porting:

- Decide per client domain: manifest, icons (192/512, any + maskable) and the worker must be served **from that client's origin at the root**. They are not shared across domains.
- The manifest content (name, colors, icons) should come from the OTT config, like the rest of the brand. Marea's is a static file for the PoC; in the real product it needs to be generated per client, or served by an endpoint behind `/manifest.json`.
- Keep `src/core/services/ServiceWorker/cacheRules.js` and its tests as they are. Never cache `*.mdstrm.com`, player scripts, manifests or segments.
- If craco is used, check that InjectManifest still picks up the worker, or switch to a workbox config of your own.

What each piece needs from the platform team:

| Piece | Needs |
|---|---|
| Manifest + icons per client | Hosting at the client origin root; icon assets from design for each client |
| Service worker per client | Served from `/service-worker.js` at the client origin root, with `Cache-Control: no-cache` so updates are picked up |
| `/.well-known/assetlinks.json` per client | Served with `application/json` by the client domain, with the real package name and the SHA-256 fingerprint of the signing key (template: `docs/assetlinks.example.json`) |
| Native shells (TWA, TV) | Launch URL with `?ms_platform=<value>`; one NPAW app name per shell created on the analytics side |
| HTTPS | Required for install and service worker on every client domain |

## 6. Debug page

`src/components/views/ViewDebug/` is self-contained and can be mounted under a route that is only enabled for internal builds (`?debug` flag or non-production). It is not meant for end users.

## What not to port

`ConfigService` (the real one is the source of truth), `ThemeContext` (the real one exists), the Marea rails and artwork, and `LiveCard` / `MiniPlayer` (PoC UI).
