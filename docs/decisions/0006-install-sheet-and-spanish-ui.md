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
- Dismissal ("Ahora no" or the close icon) stores a timestamp under `marea:install-sheet-dismissed-at` through the `Storage` wrapper and hides the sheet for 7 days (`isSnoozed`; a future or corrupt timestamp does not hide it). Superseded: the reappearance is now configurable, see "Reappearance policy" below. An accepted install, or `appinstalled`, stores `marea:install-sheet-installed` and hides it for good. A dismissed browser prompt is not a dismissal of the sheet.
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

Decision: `/debug` has an "Estado de instalación" section right after the diagnostics. Rows: whether the browser offered the install (live, through `InstallPromptService`), the resolved platform, the platform stored in this tab, the state of the install card, and the stored installed mark. The rows are read-only and the same rows go into the copy report.

Update: the "Restablecer estado de instalación" button (and `useResetInstallState`) was removed. It was a manual workaround for state that should never go stale. The platform resolver now checks every stored, query and referrer value against the device on each load and discards what contradicts it (ADR 0001, "Device check"), so a stale `android` disappears on the next refresh without any user action. The other two values heal on their own: the dismissal expires after 7 days, and the installed mark is cleared when the browser offers the install again.

Update: `/debug` is hidden from clients. Debug mode is off by default and mirrors the real product's `gtmDebug` convention (a query parameter kept in `sessionStorage`):

- `/?debug=1` turns it on for the session (key `ms_debug`, through the `Session` wrapper); `?debug=0` turns it off. Any other value changes nothing. The logic is `src/core/Utils/debugMode.js` and the hook `useDebugMode`.
- The `/debug` route renders only in debug mode; otherwise `DebugGate` redirects to `/` with react-router's `Redirect`, so the basename is respected. The footer link "Diagnóstico" shows only in debug mode, and nothing else links to `/debug`.
- To use it: open `/?debug=1` once, then use the footer link or `/debug` for the rest of the tab session.
- This is not a security boundary: anyone who knows the parameter can open the page. It only keeps a diagnostics page out of what a client sees.

- The card state comes from the pure `getInstallStateSummary`, which returns a stable code plus params (`hidden-platform`, `hidden-installed`, `snoozed`, `no-offer`, `hidden-route`, `available`). The first cause that applies wins, in that order. It mirrors `useInstallSheet`: the installed mark only counts while the browser is not offering the install (the hook clears it otherwise), iOS needs no browser offer, and `/install` and `/debug` are quiet routes (`isQuietRoute` is now exported). Because `/debug` is a quiet route, the card reads "Oculta en esta ruta" here even when it would show elsewhere.
- Read-only diagnostics: install behavior is unchanged.
- Tests: `getInstallStateSummary` (every branch and the precedence), the panel states (including a stale platform healed on load) and the report, in `src/tests/components/views/ViewDebug.*.test.js`; debug mode in `src/tests/core/Utils/debugMode.test.js`, `src/tests/components/common/hooks/useDebugMode.test.js`, `DebugGate.test.js` and `Footer.test.js`. Real layout and the real `beforeinstallprompt` are not covered by jsdom.

## Reappearance policy

Closing the sheet ("Ahora no" or the X) used to hide it for a fixed 7 days. A demo shown to prospects needs the opposite (the card on every load, so it is never missing in a live walkthrough), while a real client wants it far less invasive. The policy is now per client, read from the config (`install.sheet.reappear` in `public/config/marea.json`, through `AppContext` like the rest of the config).

### Modes

| Value | Closing hides the sheet | Storage |
|---|---|---|
| `everyLoad` | for the rest of that page view only | none (component state) |
| `session` | for the tab session | `Session`, key `marea:install-sheet-dismissed-session` |
| `days:N` (positive integer, for example `days:3`) | for N days | `Storage`, key `marea:install-sheet-dismissed-at` (timestamp) |
| `progressive` | 1st close: the rest of the session. 2nd close: 3 days. 3rd close and later: 14 days | `Storage`: `marea:install-sheet-dismiss-count` and the dismissed-at key |

- Defaults: the demo config sets `everyLoad` explicitly. A missing, empty or invalid value (`days:0`, `days:-2`, `days:abc`, an unknown word, a non string) falls back to `session`, the safe default for a real client. Case and surrounding whitespace are ignored (`" EveryLoad "` works).
- Progressive steps are named constants in `utils/reappearPolicy.js` (`PROGRESSIVE_SECOND_DAYS = 3`, `PROGRESSIVE_LATER_DAYS = 14`). The count lives in `localStorage` so it survives sessions; a corrupt count is read as "never closed".
- Everything else is unchanged: 4 seconds or first scroll, quiet routes (`/install`, `/debug`), platform gating, the installed mark and its self-heal, an accepted install hides it for good, and the iOS variant follows the same policy.

### Rationale

Invasiveness against visibility. Every load maximizes installs but nags returning users; a session or a few days is polite but can leave a prospect without the card. The header "Instalar app" pill and `/install` stay visible regardless of the policy, so a user who closed the card can always install.

### Design

- `utils/reappearPolicy.js` is pure: `parseReappear(value)`, `isHiddenByPolicy({ policy, dismissedAt, dismissCount, sessionDismissed, now })`, `getHiddenState` (the same decision with the reason and the end of a snooze, used by `/debug`) and `getDismissalWrites` (what a close must store in each mode). `useInstallSheet` only reads the storage, calls these and writes.
- A future or non numeric timestamp never hides the sheet (same rule as before). `isSnoozed` and the fixed `SNOOZE_MS` were removed.
- Analytics: `ms_event_install_sheet_dismissed` gets `ms_install_reappear` with the active mode name (`everyLoad`, `session`, `days`, `progressive`). Fallbacks report `session`.
- `/debug` (debug mode only): a new row "Reaparición de la tarjeta" (Cada carga, Una vez por sesión, Cada N días, Progresiva), also in the copy report. The card state has a new code, `closed-session` ("Cerrada en esta sesión"); "Pospuesta hasta ..." only appears for `days` and `progressive`; `everyLoad` never reports a snooze or a closed card, because it stores nothing (the close of a page view is invisible to the debug page).

### Migration

Old versions stored a 7 day timestamp under `marea:install-sheet-dismissed-at`. In `everyLoad` and `session` that value is ignored (and never rewritten), so users stuck behind the old snooze see the card again. `progressive` ignores it until the second close; `days:N` still reads it with its own N, which is the intended continuity. Nothing is deleted.

### How to test each mode

Unit tests cover every mode; the real behavior needs a browser (see `docs/test-log.md`). Change `install.sheet.reappear` in the deployed `config/marea.json` (or the dev server's), then:

- `everyLoad`: open the page, wait 4 seconds, close the card. It stays away while you navigate. Reload: it comes back after 4 seconds. Local and session storage hold nothing from the sheet.
- `session`: close, reload (hidden), open a new tab or clear session storage (shown again).
- `days:3`: close, reload (hidden). To skip time, set `marea:install-sheet-dismissed-at` in local storage to a timestamp 4 days ago and reload.
- `progressive`: close once (hidden for the session, shown in a new session); close a second time (hidden for 3 days); set the dismissed-at key 4 days back, reload, close a third time (14 days).
- Invalid value (for example `days:0`): behaves as `session`.
- `/?debug=1`, then `/debug`: the "Reaparición de la tarjeta" row shows the active policy.
