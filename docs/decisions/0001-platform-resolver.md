# 0001. Platform resolver

## Context

The real product hardcodes `ms_platform_origin: 'WEB'` in `getTrackingData.js` and `trackPageView.js`, and the NPAW app name is a single value. A user inside an Android app (Trusted Web Activity, TWA), an installed PWA or a TV shell would all be reported as web.

A web page cannot reliably know which shell it runs in, so the shell has to tell it, with sensible fallbacks.

## Decision

`src/core/Utils/getPlatformOrigin.js` resolves one of `web, pwa-web, android, android-tv, fire-tv, samsung-tv, lg-tv, ios`, once, in `initPlatformOrigin()` at boot, then caches it. Priority:

1. **`ms_platform` query parameter** on the launch URL, injected by the native shell. Validated against the whitelist (case and whitespace normalized); unknown values are ignored. Persisted for the session.
2. **Value stored earlier in this session** (needed because the query parameter disappears on the first client-side route change).
3. **Optional, UNCONFIRMED: `document.referrer` starting with `android-app://`** resolves `android`, persisted. Enabled by `analytics.referrerSignal` in the config (default true in the PoC).
4. **Standalone display mode** (`display-mode: standalone` or `navigator.standalone`) resolves `pwa-web`. Not persisted.
5. **`web`**.

Persistence uses `sessionStorage` only, through the `Session` wrapper (which never throws). A TWA shares `localStorage` with Chrome, so persisting there would label later plain browser visits as `android`. Standalone and default results are never persisted, so a later browser visit in the same session is not mislabelled.

The referrer signal ranks above standalone because a TWA also reports `display-mode: standalone`.

`getAnalyticsAppName(config, platform)` returns `config.analytics.appNames[platform]`, falling back to `config.analytics.appName`. The result is passed as `npaw.name` to the Lightning player, as the real product does.

## Consequences

- The shell must append `?ms_platform=<value>` to its launch URL. That is the only reliable signal and needs a change in the native wrappers (TWA launch URL, TV shells).
- The referrer signal has a known false-positive risk: Chrome also sets an `android-app://<package>` referrer when another Android app opens a link in Chrome. It has not been validated on a device. If it proves unreliable, set `analytics.referrerSignal` to `false`, or tighten it to "referrer AND standalone".
- `ms_platform_origin` now carries lowercase whitelist values, while the real product sends `'WEB'`. The analytics team must decide whether to keep lowercase or map to uppercase before porting.
- iOS Safari in a normal tab is `web`; only the installed iOS PWA is `pwa-web` (via `navigator.standalone`). There is no `ios` signal without a native shell injecting it.

## How to test

- Unit: `npm test -- --watchAll=false src/tests/core/Utils/getPlatformOrigin` (whitelist, precedence, persistence across route changes, invalid parameter, standalone, referrer signal, storage unavailable).
- Manual: open `/?ms_platform=android-tv`, navigate between routes, reload `/radio`, then look at `/debug`: "Resolved platform" and "Analytics appName". Repeat in each shell and record results in `docs/test-log.md`.
