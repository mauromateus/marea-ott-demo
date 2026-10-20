# 0001. Platform resolver

## Context

The real product hardcodes `ms_platform_origin: 'WEB'` in `getTrackingData.js` and `trackPageView.js`, and the NPAW app name is a single value. A user inside an Android app (Trusted Web Activity, TWA), an installed PWA or a TV shell would all be reported as web.

A web page cannot reliably know which shell it runs in, so the shell has to tell it, with sensible fallbacks.

## Decision

`src/core/Utils/getPlatformOrigin.js` resolves one of `web, pwa-web, android, android-tv, fire-tv, samsung-tv, lg-tv, ios`, once, in `initPlatformOrigin()` at boot, then caches it. Priority:

1. **`ms_platform` query parameter** on the launch URL, injected by the native shell. Validated against the whitelist (case and whitespace normalized); unknown values are ignored. Persisted for the session only when plausible for the device (see "Device check" below).
2. **Value stored earlier in this session** (needed because the query parameter disappears on the first client-side route change). Ignored and removed when it contradicts the device.
3. **Optional, UNCONFIRMED: `document.referrer` starting with `android-app://`** resolves `android`, persisted only when plausible for the device. Enabled by `analytics.referrerSignal` in the config (default true in the PoC).
4. **Standalone display mode** (`display-mode: standalone` or `navigator.standalone`) resolves `pwa-web`. Not persisted.
5. **`web`**.

Persistence uses `sessionStorage` only, through the `Session` wrapper (which never throws). A TWA shares `localStorage` with Chrome, so persisting there would label later plain browser visits as `android`. Standalone and default results are never persisted, so a later browser visit in the same session is not mislabelled.

The referrer signal ranks above standalone because a TWA also reports `display-mode: standalone`.

`getAnalyticsAppName(config, platform)` returns `config.analytics.appNames[platform]`, falling back to `config.analytics.appName`. The result is passed as `npaw.name` to the Lightning player, as the real product does.

### Device check: self-healing platform

`isPlatformPlausible(platform, { userAgent, maxTouchPoints, navigatorPlatform })` says whether a platform value is consistent with the device (case-insensitive):

| Platform | Plausible when |
|---|---|
| `web`, `pwa-web` | always |
| `android`, `android-tv`, `fire-tv` | the user agent contains `Android` (Fire OS and Android TV do) |
| `samsung-tv` | `Tizen` or `SMART-TV` |
| `lg-tv` | `Web0S`, `webOS` or `NetCast` |
| `ios` | iPhone, iPad or iPod, or an iPadOS desktop-class device (Macintosh with `maxTouchPoints > 1`, same detection as `detectInstallContext`) |

`initPlatformOrigin()` applies it on every load:

- A **stored** value that is not plausible is ignored and removed from the session.
- A value from the **query parameter** is still honored for that page load, so an engineer can simulate a shell with `?ms_platform=...` on any device, but it is persisted only when plausible. A simulation on a desktop lasts only while the parameter is in the URL; a plain refresh returns to `web`.
- The **referrer** signal keeps working and is also persisted only when plausible.
- Client-side navigation keeps the value resolved in memory, as before.

Why: a platform stored by an earlier `?ms_platform=android` made a desktop tab believe it was inside the Android shell, which hid the install button, the install sheet and made `/install` say "Ya está instalada". Nothing on screen explained it, and nobody can be asked to clear their storage. A TWA shares its storage with Chrome, so a stored platform cannot be trusted by itself; the resolver validates it against the device instead, and a stale value heals on the next refresh without any user action.

Limit: the check only catches contradictions. A desktop browser that spoofs an Android user agent is indistinguishable from the shell, which is acceptable for labelling analytics.

## Consequences

- The shell must append `?ms_platform=<value>` to its launch URL. That is the only reliable signal and needs a change in the native wrappers (TWA launch URL, TV shells).
- The referrer signal has a known false-positive risk: Chrome also sets an `android-app://<package>` referrer when another Android app opens a link in Chrome. It has not been validated on a device. If it proves unreliable, set `analytics.referrerSignal` to `false`, or tighten it to "referrer AND standalone".
- `ms_platform_origin` now carries lowercase whitelist values, while the real product sends `'WEB'`. The analytics team must decide whether to keep lowercase or map to uppercase before porting.
- iOS Safari in a normal tab is `web`; only the installed iOS PWA is `pwa-web` (via `navigator.standalone`). There is no `ios` signal without a native shell injecting it.

## How to test

- Unit: `npm test -- --watchAll=false src/tests/core/Utils/getPlatformOrigin` (whitelist, precedence, persistence across route changes, invalid parameter, standalone, referrer signal, storage unavailable).
- Manual: inside a real shell (or on a device whose user agent fits the value), open `/?ms_platform=android-tv`, navigate between routes, reload `/radio`, then open `/?debug=1` once and look at `/debug`: "Plataforma resuelta" and "appName de analítica". Repeat in each shell and record results in `docs/test-log.md`.
- Manual, self-healing: on a desktop browser open `/?ms_platform=android`. The resolved platform is `android` only while the parameter is present: navigate within the app (still `android`, kept in memory), then reload without the parameter and it is `web` again, with nothing stored in the tab. On an Android phone the same URL is persisted and survives a reload without the parameter.
