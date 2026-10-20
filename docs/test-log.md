# Device test log

Test target: https://mauromateus.github.io/marea-ott-demo/ (GitHub Pages project page; browser, installed PWA and iPhone tests only, it cannot be verified as a TWA, see `docs/decisions/0004-github-pages-subpath.md`).

How to fill a row: open the deployed (HTTPS) build inside the shell under test, launching with the right `?ms_platform=` value when the shell injects it (see `docs/decisions/0001-platform-resolver.md`). Press play on `/tv` and `/radio`, then open `/?debug=1` once (debug mode is off by default and `/debug` redirects home otherwise), go to `/debug` from the footer link, press "Copiar informe" and paste the report below the table (or attach it).

Status values: `pending`, `ok`, `fail`, `n/a`.

| Device | OS / browser | Shell | Install OK | Plays video | Plays audio | Resolved platform | Analytics appName | Notes |
|---|---|---|---|---|---|---|---|---|
| Desktop Chrome (browser) | pending | browser tab | pending | pending | pending | pending | pending | |
| Desktop Chrome (installed) | pending | installed PWA | pending | pending | pending | pending | pending | |
| Android phone Chrome | pending | browser tab | pending | pending | pending | pending | pending | |
| Android phone TWA | pending | Trusted Web Activity | pending | pending | pending | pending | pending | Check the unconfirmed `android-app://` referrer in the report |
| iPhone Safari | pending | browser tab | pending | pending | pending | pending | pending | |
| iPhone installed PWA | pending | Home Screen app | pending | pending | pending | pending | pending | Check audio on first tap and with the screen locked |
| Android TV | pending | pending | pending | pending | pending | pending | pending | Check D-pad focus on cards and buttons |
| Fire TV | pending | pending | pending | pending | pending | pending | pending | |
| Samsung Tizen | pending | pending | pending | pending | pending | pending | pending | Older engines: check layout (no `aspect-ratio`, no `inset`) |
| LG webOS | pending | pending | pending | pending | pending | pending | pending | |

## Install experience checks

Steps for each row are in `docs/decisions/0005-install-experience.md` and `docs/decisions/0006-install-sheet-and-spanish-ui.md` ("How to test"). `beforeinstallprompt` cannot be simulated, so every row needs a real device or browser on the HTTPS deployment. After each check, open `/debug` (first `/?debug=1` once per tab session) and note the install events.

| Check | Device / browser | Status | Notes |
|---|---|---|---|
| Android Chrome: "Instalar app" header button | pending | pending | Header button is visible in the first row at 360px, prompt opens, accepting hides it; `/debug` lists `install_prompt_shown`, `install_choice`, `app_installed` |
| Android Chrome: install sheet | pending | pending | Sheet slides up after 4 s or the first scroll; "Instalar" opens the prompt; "Ahora no" hides it for 7 days; `/debug` lists `install_sheet_shown` and `install_sheet_dismissed` |
| Android Chrome: menu "Install app" | pending | pending | Header button hides after install; `/debug` lists `app_installed` |
| iPhone Safari: install sheet with steps and arrow | pending | pending | Sheet shows after 4 s or the first scroll, two steps, bouncing arrow; "Ahora no" sticks after reload; no sheet once launched from the Home Screen; no arrow on iPad |
| Desktop Chrome: install button | pending | pending | Header button and address-bar icon; accepted install opens an app window |
| `/install` QR scan from another device | pending | pending | Opens the site at `/marea-ott-demo/`, not at the origin root |
| Installed PWA hides the install UI | pending | pending | No install button, no sheet, `/install` says "Ya está instalada", `/debug` shows `pwa-web` |
| Install sheet sits above the mini player | pending | pending | Start the radio, go to Inicio: the sheet is above the mini player and nothing overlaps, also with the iPhone home indicator |
| `/install` on a phone is not saturated | pending | pending | No QR, one title, one line, the big button or one accordion item with at most 3 short steps |
| Whole UI in Spanish | pending | pending | Walk Inicio, TV, Radio, Instalar, Diagnóstico, the update toast and the error states: no English visible (the player's own controls excepted) |

The "Estado de instalación" section of `/debug` explains why the install UI is hidden (platform stored in the tab, 7 day snooze, installed mark, or no browser offer) and is read-only: a stale platform heals itself on the next load. When an install check does not show the button or the sheet, open `/?debug=1`, read that section first and paste the report.

## Expected results

| Shell | Resolved platform | Analytics appName |
|---|---|---|
| Browser tab | `web` | `marea-web` |
| Installed PWA (desktop, Android, iOS) | `pwa-web` | `marea-pwa-web` |
| Android TWA with `?ms_platform=android` | `android` | `marea-pwa-android` |
| Android TV / Fire TV / Samsung / LG with the matching parameter | `android-tv` / `fire-tv` / `samsung-tv` / `lg-tv` | `marea-android-tv` / `marea-fire-tv` / `marea-samsung-tv` / `marea-lg-tv` |

## Results already observed

| Date | Environment | Result |
|---|---|---|
| 2026-10-20 | Desktop Chrome 155 on Windows, production build on `localhost`, launched with `?ms_platform=android` | Service worker activated and precached the shell only; live video loaded and sent `ms_event_player_ready` with `ms_platform_origin: android`; live audio played after a click and sent `player_ready` + `video_start`; platform survived route changes and reloads; update toast and Refresh worked. Not a device test. |

## Pasted reports

(Add one block per row.)
