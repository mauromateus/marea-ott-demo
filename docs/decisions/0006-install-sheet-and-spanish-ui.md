# 0006. Install sheet, simpler /install page and Spanish UI

## Context

Three problems showed up after ADR 0005:

- The install entry points were easy to miss. The header button was small and, on a phone, wrapped into a second row. The iOS banner was a thin bar under the header that people scroll past. Chromium had nothing but that button.
- `/install` was saturated with text on a phone: long paragraphs, a QR code of the screen you are already looking at, and three step cards at once.
- The whole UI was in English, but the audience is Spanish speaking.

## Decision

### Install sheet (`components/common/InstallSheet/`)

- One bottom sheet replaces the iOS-only `InstallBanner`. It is a non-modal `role="dialog"` with an accessible label ("Instalar Marea"), no focus trap, a visible focus ring and a slide-up entrance.
- Variant by device (`readInstallContext`): Chromium shows the app icon, "Instala Marea", one line, a large "Instalar" button (calls the existing `InstallPromptService.promptInstall()`) and a quiet "Ahora no". iOS shows the same card with two steps ("Toca Compartir" with an inline share icon, "Elige Agregar a pantalla de inicio"). A bouncing arrow points down only on iPhone, because Safari's share button is in the bottom toolbar there; iPad (including the desktop-class iPadOS user agent) has no arrow.
- Timing: it appears 4 seconds after load or on the first scroll, whichever comes first (`useInstallSheet`). Chromium also needs `canInstall` (the captured `beforeinstallprompt`); iOS needs iOS Safari that is not standalone.
- Gating: only when the resolved platform is `web`. Never on `/install` or `/debug`, never in the Android shell (`android`) or the installed app (`pwa-web`).
- Dismissal ("Ahora no" or the close icon) stores a timestamp under `marea:install-sheet-dismissed-at` through the `Storage` wrapper and hides the sheet for 7 days (`isSnoozed`; a future or corrupt timestamp does not hide it). An accepted install, or `appinstalled`, stores `marea:install-sheet-installed` and hides it for good. A dismissed browser prompt is not a dismissal of the sheet.
- Mini player: `useMiniPlayerVisible` is the single source for "is the mini player on screen" (audio status not idle and not on `/radio`). When true, the sheet sits above it using the shared `MINI_PLAYER_CLEARANCE`, which the update toast uses too. Everything respects `env(safe-area-inset-bottom)`.
- Motion: a pulse on the primary button for two cycles, then it stops; the arrow bounces for six cycles, then stops. All of it is disabled under `prefers-reduced-motion` (on top of the global rule in `ThemeContext`).
- Header button: a coral filled pill with an icon and "Instalar app", two gentle pulses. On phones the header keeps the logo and the button in the first row and moves the nav to its own row, so the button is never wrapped away.
- Analytics through `trackInstall` with the resolver's `ms_platform_origin`: `ms_event_install_sheet_shown` (once per page load) and `ms_event_install_sheet_dismissed`, both with `ms_install_variant: chromium|ios`. The existing prompt, choice and installed events are unchanged.

### `/install` page for phones

- Short title, a lead of at most 12 words, a status chip ("Aún no está instalada" / "Ya está instalada"). Every paragraph is one short sentence (tested).
- Phone = viewport under 768px or a touch-primary device (`usePhoneLayout`). There the QR is not rendered at all, because scanning your own screen is useless. The page shows the big install button when the browser offers it; otherwise only the steps of the detected platform (`getInstallPlatform`), at most 3 steps of at most 8 words, in a one-item accordion (`aria-expanded`, `aria-controls`). When already installed there is nothing left to do, so no steps.
- Wide screens: QR tile with the link and "Copiar enlace", plus tabs Android, iPhone and Computador (`role="tablist"`, `aria-selected`, arrow keys, Home and End) that default to the detected platform.
- The Android app (APK) section still depends on `install.apkUrl` and is hidden when empty.

### Spanish UI and i18n

- `src/core/Translation.js` mirrors the real product's convention: `translate(key, params)` with `{name}` interpolation. A missing key returns the key and warns with `console.warn` in development only.
- Dictionaries live in `src/i18n/<language>/`, one file per area (`common`, `home`, `tv`, `radio`, `install`, `debug`, `player`, `errors`), flat keys prefixed by the area (`install.sheet.title`). `src/i18n/index.js` registers the languages.
- `public/config/marea.json` has `app.language: "es"`. `initLanguage(config)` runs at boot, before the first render, and sets `document.documentElement.lang`. `public/index.html` has `lang="es"` and the manifest has `"lang": "es"`.
- Content that belongs to the OTT (tagline, player descriptions, rail and card titles and meta) is Spanish directly in `marea.json`, not in the dictionaries, because it is per-client content. Brand names (Marea, Marea TV, Marea Radio) are not translated.
- Style: neutral Latin American Spanish, "tú" imperatives, no voseo.
- Tests: `src/tests/i18n/dictionary.test.js` scans the source and fails when a key referenced in code is missing from the dictionary, or when a key is unused. Components have Spanish assertions.

#### How to add a language

1. Copy `src/i18n/es/` to `src/i18n/<code>/` and translate the values (keys stay).
2. Register it in `src/i18n/index.js`.
3. Translate the OTT content in that client's config, and set `app.language` to the code.
4. Extend the dictionary test to cover the new language (every key of `es` must exist).

## Consequences

- Analytics: the `ms_page_title` values are now Spanish (`Inicio`, `Marea TV`, `Marea Radio`, `Diagnóstico`, `Instalar`). Reports and GTM filters that matched the English titles must be updated. Event names and parameter keys stay English, and so do values such as `ms_video_type` (`Live`) and `ms_category_names` (`TV`, `Radio`).
- The sheet reaches more people than the old banner, so `install_prompt_shown` and `install_sheet_shown` will diverge: the first means the browser offered the prompt, the second means the sheet was on screen.
- A user who dismisses the sheet sees it again after 7 days, and the browser's own cool-down after a dismissed prompt can keep `beforeinstallprompt` from firing at all.
- The QR code is gone on phones by design. Anyone who wants to share the link uses a wide screen or copies the address.
- Before this change a missing English string was visible; now a missing Spanish key renders the key itself, which is why the dictionary test exists.
- The Lightning player SDK has its own controls and labels, which this app cannot translate.
- The real product has no sheet yet. Porting is described in `docs/PORTING.md`.

## How to test

Real devices on the HTTPS deployment, rows in `docs/test-log.md`. `beforeinstallprompt` and real layout cannot be checked in jsdom.

- Android Chrome: the sheet appears after 4 seconds or the first scroll, "Instalar" opens the browser prompt, "Ahora no" hides it and it stays away after a reload.
- iPhone Safari: two steps and the arrow; iPad: two steps and no arrow.
- Start the radio, then check that the sheet sits above the mini player.
- `/install` on a phone: no QR, one button or one accordion item.
- Walk every route and look for English.

## Update: detecting an uninstall

The sheet stores a permanent "installed" mark (`marea:install-sheet-installed`) when `appinstalled` fires or the prompt is accepted. A web page cannot be told that the user uninstalled the app, so the mark went stale and hid the sheet forever.

Decision: the browser only fires `beforeinstallprompt` while the app is not installed. When the hook sees an installable app and finds the mark, it clears the mark and keeps any recent "Not now" snooze. The mark is kept while the browser does not offer the install.

Consequences: detection depends on the browser noticing the uninstall. On Windows and macOS, uninstall from `chrome://apps` (right click, Remove) or from the app's own menu. Removing it from the operating system settings can leave Chrome believing it is still installed until Chrome restarts. Covered by tests in `src/tests/components/common/InstallSheet.test.js` ("after an uninstall").

## Install state panel

Testing the install experience on a desktop browser, hidden state kept suppressing the install UI with nothing on screen to explain it: a platform stored in the tab session by an earlier `?ms_platform=android` (the page believes it runs in the Android shell, so the button and sheet hide and `/install` says "Ya está instalada"), the 7 day "Ahora no" snooze, the stored "installed" mark, or a browser that never offered the install.

Decision: `/debug` has an "Estado de instalación" section right after the diagnostics. Rows: whether the browser offered the install (live, through `InstallPromptService`), the resolved platform, the platform stored in this tab (with a hint when it is a valid value other than `web`), the state of the install card, and the stored installed mark. The button "Restablecer estado de instalación" removes the stored platform (`Session`), the dismissal timestamp and the installed mark (`Storage`, with the keys exported by `useInstallSheet`), shows "Estado restablecido. Recargando…" in a `role="status"` and reloads the page after 900 ms. Nothing else in storage is touched. The same rows go into the copy report.

- The card state comes from the pure `getInstallStateSummary`, which returns a stable code plus params (`hidden-platform`, `hidden-installed`, `snoozed`, `no-offer`, `hidden-route`, `available`). The first cause that applies wins, in that order. It mirrors `useInstallSheet`: the installed mark only counts while the browser is not offering the install (the hook clears it otherwise), iOS needs no browser offer, and `/install` and `/debug` are quiet routes (`isQuietRoute` is now exported). Because `/debug` is a quiet route, the card reads "Oculta en esta ruta" here even when it would show elsewhere.
- Read-only diagnostics plus the reset: install behavior is unchanged.
- A launch URL that still carries `?ms_platform=` stores the platform again after the reload; open `/debug` without the query to finish the reset.
- Tests: `getInstallStateSummary` (every branch and the precedence), the panel states, the reset (exact keys, one reload, unrelated keys untouched) and the report, in `src/tests/components/views/ViewDebug.*.test.js`. Real layout and the real `beforeinstallprompt` are not covered by jsdom.

