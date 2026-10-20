# 0005. Install experience

Status: accepted. The install UI was reworked in [ADR 0006](0006-install-sheet-and-spanish-ui.md): the iOS banner became a bottom install sheet for every browser, the `/install` page is simplified for phones, and all texts are Spanish. This document keeps the mechanics that did not change (prompt service, platform gating, QR, APK, analytics).

## Context

Marea is a PWA, so users can put it on a home screen or desktop. Browsers do not make that easy to find, and they differ:

- Chromium (Chrome and Edge on desktop, Chrome on Android) fires `beforeinstallprompt` when the app is installable. A page can keep that event and show its own "Install app" button.
- Safari on iPhone and iPad has no install API and never fires that event. The only path is the manual Share > Add to Home Screen.
- The same code also runs inside the Android Trusted Web Activity (TWA) shell, the installed PWA and TV shells (ADR 0001). An install prompt makes no sense there, and in a TWA it would offer to install the app the user is already inside.

## Decision

- **Chromium prompt.** `src/core/services/InstallPromptService.js` is a singleton that listens for `beforeinstallprompt` (calls `preventDefault`, keeps the event) and `appinstalled`. It starts in `src/index.js` before the config fetch, because the event can fire before React mounts. The hook `useInstallPrompt` (`components/common/InstallButton/hooks/`) exposes `{ canInstall, promptInstall }`. `promptInstall()` calls `event.prompt()` synchronously inside the click, then reads `userChoice`. A deferred prompt works once, so the event is dropped as soon as it is used: the install UI hides after accept, dismiss or `appinstalled`, and comes back only if the browser fires a new event. Two surfaces use it: the header button ("Instalar app") and the install sheet (ADR 0006).
- **Only where it makes sense.** `canShowInstallUi(platform)` (`core/Utils/detectInstallContext.js`) is true only for the resolved platform `web`. The header button, the install sheet and the iOS instructions are therefore hidden in the TWA (`android`), the installed app (`pwa-web`), iOS and TV shells. The resolved platform is the single source of truth; the demo does not sniff the user agent for this.
- **iOS instructions.** `detectInstallContext` is a pure function (unit tested): iOS is an iPhone/iPad/iPod user agent, or `MacIntel` with `maxTouchPoints > 1` (iPadOS 13+ sends a desktop Mac user agent); `isIphone` is false for every iPad. `shouldShowIosInstructions` is true only when iOS, not standalone (`navigator.standalone` falsy and display mode not standalone) and the platform is `web`. They are shown by the install sheet (ADR 0006), which replaced the old `InstallBanner` and its `marea:install-banner-dismissed` key.
- **`/install` page.** Lazy-loaded view with a QR code of the site URL (`origin + basename + /`, so it works on GitHub Pages and at the root), a Copiar enlace button (same clipboard-failure fallback as `/debug`, shared in `useCopyText`), steps per platform, the install button when available and an "Ya está instalada" status when standalone. On phones the QR is hidden and the page shows only the button or the steps of the detected platform (ADR 0006). It is linked from the footer.
- **QR.** The `qrcode` package (MIT) generates the module matrix from our own URL; `ViewInstall/utils/buildQrPath.js` turns it into one SVG path, rendered inline (no `dangerouslySetInnerHTML`). It is drawn black on a fixed white tile with a 4-module quiet zone, so it scans on the dark theme. The package is imported only by the lazy `/install` chunk and is not in the main bundle.
- **Optional Android app.** `public/config/marea.json` has `"install": { "apkUrl": "" }`. An absolute `http(s)` URL shows a download button; empty or invalid hides the whole section.
- **Analytics** (through `DataLayerService`, `ms_event_` prefix, `ms_platform_origin` from the resolver): `ms_event_install_prompt_shown` (button became available, only when the platform is `web`), `ms_event_install_choice` with `ms_install_outcome: accepted|dismissed`, `ms_event_app_installed`, plus `ms_event_install_sheet_shown` and `ms_event_install_sheet_dismissed` (ADR 0006). They show up on `/debug` with the other dataLayer events.

## Consequences

- Firefox and desktop Safari get no install button or sheet (no `beforeinstallprompt`); the `/install` page still explains what each browser offers.
- iOS cannot be prompted: the sheet and the page are instructions only. Chrome and Firefox on iOS are also WebKit, and whether they offer Add to Home Screen depends on the iOS version; the sheet shows for them too.
- `beforeinstallprompt` only fires when Chrome considers the app installable (HTTPS or localhost, valid manifest, service worker) and the user has not recently dismissed it. A missing button is not always a bug. After a dismissal Chrome applies its own cool-down.
- `ms_event_install_prompt_shown` is sent when the event is captured, not when the user sees the sheet or scrolls to the button; `ms_event_install_sheet_shown` is the one that means the sheet was on screen. The prompt event fires again if the browser re-fires it.
- Because the install UI depends on the resolved platform, a TWA only gets it removed if the shell passes `?ms_platform=android` (or the referrer signal, still unconfirmed, ADR 0001). That is the same dependency the analytics already have.
- The real product's `AppDownloadBanner` has the same problem the demo avoids by checking the resolved platform (see `docs/PORTING.md`).

## How to test

`beforeinstallprompt` cannot be simulated reliably, so these checks need real browsers on the HTTPS deployment (rows in `docs/test-log.md`). After each, open `/debug` and check the events.

- **Android Chrome, sheet and button:** open the site in Chrome. After 4 seconds (or the first scroll) the install sheet slides up; "Instalar app" is also in the header (first row, next to the logo) and on `/install`. Tap Instalar, accept. The sheet and the button disappear, the app is on the home screen, and `/debug` lists `install_sheet_shown`, `install_prompt_shown`, `install_choice` (accepted), `app_installed`.
- **Android Chrome, menu:** three-dot menu > Install app. The sheet and the header button disappear; `/debug` lists `app_installed`.
- **iPhone Safari:** open the site in Safari (not in an in-app browser). The sheet shows the two steps and an arrow toward the share button; Share > Add to Home Screen works; tap Ahora no, reload, the sheet stays away for 7 days. Launch from the home screen: no sheet, `/debug` shows `pwa-web`. On iPad the sheet has no arrow.
- **Desktop Chrome or Edge:** the button shows in the header; the install icon also appears in the address bar. Accepting installs the app window.
- **QR:** open `/install` on a desktop, scan the code with another device. It must open the site at the deployed path (for Pages, `/marea-ott-demo/`).
- **Installed PWA:** launch the installed app. No install button, no sheet, `/install` says "Ya está instalada", `/debug` shows `pwa-web`.
- **TWA:** inside the Android app the button must not show (platform `android`).
