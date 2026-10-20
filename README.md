# Marea (OTT PWA proof of concept)

Marea is a fictional streaming brand with two live signals (TV and radio) and some sample on-demand rails. It exists to show that a **PWA / thin-shell approach works for an OTT**: one web app, installable, that reports the correct platform to analytics (a user inside an Android app is not reported as "web").

It uses the same stack and conventions as `ott-next-core-web` (React 16.12, react-router 5.2, styled-components 5.2.3, jotai 2.16.1, swiper 6, react-helmet 5.2.1, CRA / react-scripts 5.0.1, `baseUrl: "src"` imports, `ms_event_*` analytics), so code can be ported back. See [docs/PORTING.md](docs/PORTING.md).

## Run it

Requires Node 20.19 or newer (`.nvmrc` says 20.19.0). It was built and tested on Node 24.19 with no changes needed.

```bash
npm install            # .npmrc sets legacy-peer-deps=true, like the real repo
npm start              # dev server on http://localhost:3000 (no service worker in dev)
npm test -- --watchAll=false
npm run build          # production build into build/ (includes service-worker.js)
npm run serve:build    # serves build/ (npx serve -s build, default port 3000)
```

To test the PWA you need the production build, because the service worker is only registered in production:

```bash
npm run build
npx serve -s build -l 5050
```

Open `http://localhost:5050`. `localhost` counts as a secure context, so install and service worker work. For a real phone you need HTTPS (a tunnel such as ngrok or Cloudflare Tunnel works).

Pass the platform the way a native shell would, by launching with a query parameter: `http://localhost:5050/?ms_platform=android`. Then open `/debug`.

## Deploy to GitHub Pages

Live URL: https://mauromateus.github.io/marea-ott-demo/ (a project page, so the app runs under the `/marea-ott-demo/` base path; see [ADR 0004](docs/decisions/0004-github-pages-subpath.md)).

```bash
npm run build:pages    # build with PUBLIC_URL=/marea-ott-demo, then add build/404.html and build/.nojekyll
npm run preview:pages  # copy build/ to <tmp>/marea-pages-sim/marea-ott-demo/ and print how to serve it
npm run deploy:pages   # build:pages, then force-push build/ to the gh-pages branch of origin
```

- `build:pages` is the only build to deploy. `404.html` is a copy of `index.html` (Pages cannot rewrite routes) and `.nojekyll` stops Jekyll from skipping files.
- `preview:pages` does not start a server. Serve the folder it prints, for example `npx serve "<folder>" -l 5051`, and open `http://localhost:5051/marea-ott-demo/`.
- `deploy:pages` needs an `origin` remote and the `gh` CLI logged in (`gh auth login`); it uses the `gh` credential helper for that push only. Try `node scripts/deploy-pages.js --dry-run` first (after `build:pages`): it prints every step and pushes nothing.
- In the repo settings, set Pages to deploy from the `gh-pages` branch, root folder.
- This URL is valid for browser, installed PWA and iPhone tests, but not for a TWA: that needs `/.well-known/assetlinks.json` at the origin root.

Regenerate the PWA icons with `npm run icons` (script in `scripts/generate-icons.js`).

Local secrets for Node scripts live in `.env` (git-ignored, never read by this app). Nothing in the browser bundle uses secrets, and no variable is prefixed `REACT_APP_`.

## What you can do in the app

| Route | What |
|---|---|
| `/` | Home: Marea TV live card, Marea Radio live card, Swiper rails of sample content |
| `/tv` | Live video (Lightning player) in a 16:9 frame |
| `/radio` | Live audio. Playback continues on other routes through a mini player |
| `/debug` | What this device reports: platform, analytics appName, display mode, referrer, user agent, service worker, online state, last 20 dataLayer events, "Copy report" button |

## Folder map

```
public/
  config/marea.json         brand, app, analytics, players (media ids), rails (sample)
  manifest.json, icons/     PWA manifest and generated icons
src/
  index.js                  boot: config -> initPlatformOrigin -> render; registers the SW (production)
  App.js                    providers, lazy routes, shell
  service-worker.js         Workbox InjectManifest entry
  serviceWorkerRegistration.js
  core/
    Session.js, Storage.js  storage wrappers (never touch storage directly in components)
    Utils/                  getPlatformOrigin, getAnalyticsAppName, getNpawApp, getConfig
    services/
      Config/ConfigService.js         hostname -> /config/<name>.json
      DataLayerService.js             window.dataLayer + ring buffer for /debug
      Player/                         Lightning loader, config builder, strategy
      ServiceWorker/cacheRules.js     what the SW may and may not cache
      ServiceWorkerService.js         waiting-worker state for the update toast
  components/
    common/                 Header, Footer, Logo, LiveBadge, Artwork, Button, UpdateToast...
    content/                LiveCard, Rail, MiniPlayer, VideoPlayer, Equalizer
    context/                ThemeContext, AppContext, GoogleTagManager, PlayerContext
    views/                  ViewHome, ViewTv, ViewRadio, ViewDebug (lazy loaded)
  tests/                    mirrors the source paths
scripts/                    generate-icons, prepare-pages, preview-pages, deploy-pages
docs/                       decisions (ADRs), PORTING, test-log, assetlinks example
```

## Where is what

| Requirement | Files |
|---|---|
| Platform resolver (whitelist, `ms_platform` param, sessionStorage, standalone, referrer signal) | `src/core/Utils/getPlatformOrigin.js`, `src/core/Session.js` |
| `npaw.name` per platform | `src/core/Utils/getAnalyticsAppName.js`, `src/core/Utils/getNpawApp.js`, `src/components/context/AppContext/AppContext.js` |
| Lightning player config (live video and audio, `npaw`, `customer_extras`) | `src/core/services/Player/utils/buildPlayerConfig.js`, `src/core/services/Player/` |
| Player events to analytics | `src/components/content/VideoPlayer/hooks/useLiveVideoPlayer.js`, `src/components/context/PlayerContext/AudioPlayerProvider.js` |
| Analytics payloads (`ms_platform_origin` from the resolver) | `src/components/context/GoogleTagManager/utils/` |
| dataLayer push, ring buffer, GTM injection | `src/core/services/DataLayerService.js`, `.../GoogleTagManager/utils/initGtm.js` |
| Audio keeps playing across routes, video and audio exclusive | `AudioPlayerProvider.js`, `playerAtoms.js`, `core/services/Player/index.js` |
| Config-driven by hostname | `src/core/services/Config/ConfigService.js`, `public/config/marea.json` |
| Theme (all through a styled-components theme) | `src/components/context/ThemeContext/` |
| Service worker, update toast | `src/service-worker.js`, `src/core/services/ServiceWorker/cacheRules.js`, `src/components/common/UpdateToast/` |
| Manifest, icons, iOS meta tags | `public/manifest.json`, `public/index.html`, `scripts/generate-icons.js` |
| Digital Asset Links for a TWA | `docs/assetlinks.example.json` |
| Debug panel | `src/components/views/ViewDebug/` |
| GitHub Pages subpath | `src/core/Utils/getBasename.js`, `scripts/`, `docs/decisions/0004-github-pages-subpath.md` |
| Decisions | `docs/decisions/0001..0004` |
| Porting guide | `docs/PORTING.md` |
| Device test table | `docs/test-log.md` |

## Known limits of this PoC

- The `android-app://` referrer signal is **unconfirmed**. Validate it on a real Android TWA before relying on it (ADR 0001).
- The Lightning SDK allows one player per page, so starting TV stops the radio and the other way round. The UI reflects this (mini player shows Play, TV shows "Resume TV").
- Autoplay of the TV on `/tv` is blocked by browsers until the user interacts; the player then shows its own play button.
- On iOS, audio may need a second tap because the SDK loads asynchronously after the first tap. Not verified on a device.
- Sample rails are not playable. They are flagged `"sample": true` in the config and the UI shows an "Example content" note.
- Live media ids live only in `public/config/marea.json`.
- `docs/assetlinks.example.json` is a template with placeholder package name and fingerprint. The real file must be served by the real domain at `/.well-known/assetlinks.json`.
