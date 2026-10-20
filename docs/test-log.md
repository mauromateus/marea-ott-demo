# Device test log

Test target: https://mauromateus.github.io/marea-ott-demo/ (GitHub Pages project page; browser, installed PWA and iPhone tests only, it cannot be verified as a TWA, see `docs/decisions/0004-github-pages-subpath.md`).

How to fill a row: open the deployed (HTTPS) build inside the shell under test, launching with the right `?ms_platform=` value when the shell injects it (see `docs/decisions/0001-platform-resolver.md`). Press play on `/tv` and `/radio`, then open `/debug`, press "Copy report" and paste the report below the table (or attach it).

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
