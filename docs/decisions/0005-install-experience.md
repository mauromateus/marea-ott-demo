# 0005. Install experience

## Context

Marea is a PWA, so users can put it on a home screen or desktop. Browsers do not make that easy to find, and they differ:

- Chromium (Chrome and Edge on desktop, Chrome on Android) fires `beforeinstallprompt` when the app is installable. A page can keep that event and show its own "Install app" button.
- Safari on iPhone and iPad has no install API and never fires that event. The only path is the manual Share > Add to Home Screen.
- The same code also runs inside the Android Trusted Web Activity (TWA) shell, the installed PWA and TV shells (ADR 0001). An install prompt makes no sense there, and in a TWA it would offer to install the app the user is already inside.

## Decision

- **Chromium button.** `src/core/services/InstallPromptService.js` is a singleton that listens for `beforeinstallprompt` (calls `preventDefault`, keeps the event) and `appinstalled`. It starts in `src/index.js` before the config fetch, because the event can fire before React mounts. The hook `useInstallPrompt` (`components/common/InstallButton/hooks/`) exposes `{ canInstall, promptInstall }`. `promptInstall()` calls `event.prompt()` synchronously inside the click, then reads `userChoice`. A deferred prompt works once, so the event is dropped as soon as it is used: the button hides after accept, dismiss or `appinstalled`, and comes back only if the browser fires a new event.
- **Only where it makes sense.** `canShowInstallUi(platform)` (`core/Utils/detectInstallContext.js`) is true only for the resolved platform `web`. The button is therefore hidden in the TWA (`android`), the installed app (`pwa-web`), iOS and TV shells. The resolved platform is the single source of truth; the demo does not sniff the user agent for this.
- **iOS banner.** `InstallBanner` (rendered under the header) tells iPhone and iPad Safari users to tap Share, then Add to Home Screen. `detectInstallContext` is a pure function (unit tested): iOS is an iPhone/iPad/iPod user agent, or `MacIntel` with `maxTouchPoints > 1` (iPadOS 13+ sends a desktop Mac user agent). It shows only when not standalone (`navigator.standalone` falsy and display mode not standalone) and the platform is `web`. Dismissal is stored with the `Storage` wrapper under `marea:install-banner-dismissed`; it never shows again after that. It is also hidden on `/install`, which already has the steps.
- **`/install` page.** Lazy-loaded view with a QR code of the site URL (`origin + basename + /`, so it works on GitHub Pages and at the root), a Copy link button (same clipboard-failure fallback as `/debug`, shared in `useCopyText`), numbered steps for Android Chrome, iPhone Safari and desktop Chrome/Edge, the Install app button when available, and an "Already installed" status when standalone. It is linked from the footer and from the iOS banner.
- **QR.** The `qrcode` package (MIT) generates the module matrix from our own URL; `ViewInstall/utils/buildQrPath.js` turns it into one SVG path, rendered inline (no `dangerouslySetInnerHTML`). It is drawn black on a fixed white tile with a 4-module quiet zone, so it scans on the dark theme. The package is imported only by the lazy `/install` chunk and is not in the main bundle.
- **Optional Android app.** `public/config/marea.json` has `"install": { "apkUrl": "" }`. An absolute `http(s)` URL shows a download button; empty or invalid hides the whole section.
- **Analytics** (through `DataLayerService`, `ms_event_` prefix, `ms_platform_origin` from the resolver): `ms_event_install_prompt_shown` (button became available, only when the platform is `web`), `ms_event_install_choice` with `ms_install_outcome: accepted|dismissed`, `ms_event_app_installed`. They show up on `/debug` with the other dataLayer events.

## Consequences

- Firefox and desktop Safari get no button (no `beforeinstallprompt`); the `/install` page still explains what each browser offers.
- iOS cannot be prompted: the banner and page are instructions only. Chrome and Firefox on iOS are also WebKit, and whether they offer Add to Home Screen depends on the iOS version; the banner shows for them too.
- `beforeinstallprompt` only fires when Chrome considers the app installable (HTTPS or localhost, valid manifest, service worker) and the user has not recently dismissed it. A missing button is not always a bug. After a dismissal Chrome applies its own cool-down.
- `ms_event_install_prompt_shown` is sent when the event is captured, not when the user scrolls to the button. It fires again if the browser re-fires the event.
- Because the button depends on the resolved platform, a TWA only gets it removed if the shell passes `?ms_platform=android` (or the referrer signal, still unconfirmed, ADR 0001). That is the same dependency the analytics already have.
- The real product's `AppDownloadBanner` has the same problem the demo avoids by checking the resolved platform (see `docs/PORTING.md`).

## How to test

`beforeinstallprompt` cannot be simulated reliably, so these checks need real browsers on the HTTPS deployment (rows in `docs/test-log.md`). After each, open `/debug` and check the events.

- **Android Chrome, button:** open the site in Chrome, wait a few seconds. "Install app" appears in the header (second row on narrow screens) and on `/install`. Tap it, accept. The button disappears, the app is on the home screen, and `/debug` lists `install_prompt_shown`, `install_choice` (accepted), `app_installed`.
- **Android Chrome, menu:** three-dot menu > Install app. The header button disappears; `/debug` lists `app_installed`.
- **iPhone Safari:** open the site in Safari (not in an in-app browser). The banner shows; Share > Add to Home Screen works; tap Dismiss, reload, the banner stays away. Launch from the home screen: no banner, `/debug` shows `pwa-web`.
- **Desktop Chrome or Edge:** the button shows in the header; the install icon also appears in the address bar. Accepting installs the app window.
- **QR:** open `/install` on a desktop, scan the code with another device. It must open the site at the deployed path (for Pages, `/marea-ott-demo/`).
- **Installed PWA:** launch the installed app. No Install button, no iOS banner, `/install` says "Already installed", `/debug` shows `pwa-web`.
- **TWA:** inside the Android app the button must not show (platform `android`).
