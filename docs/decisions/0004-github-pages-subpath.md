# 0004. GitHub Pages project subpath

## Context

The demo is published at `https://mauromateus.github.io/marea-ott-demo/`. A GitHub project page is served from a subpath (`/marea-ott-demo/`), not from the origin root, and GitHub Pages is static hosting: it cannot rewrite routes, and it runs Jekyll unless told not to. The default build (`npm run build`, served at `/`) has to keep working.

## Decision

- The base path comes from CRA's `PUBLIC_URL`. `npm run build:pages` sets `PUBLIC_URL=/marea-ott-demo` (through `cross-env`, so it works on Windows) and then runs `scripts/prepare-pages.js`.
- `src/core/Utils/getBasename.js` normalizes `PUBLIC_URL` (no trailing slash, `''` at the root, only the pathname if it is a full URL). It is the `basename` of `BrowserRouter`, and `stripBasename` keeps analytics `page` values router-relative (`/tv`, not `/marea-ott-demo/tv`).
- `public/manifest.json` uses relative `start_url`, `scope` and icon `src` values (`.` and `icons/...`), which the browser resolves against the manifest URL, so the same file works at any base path.
- The service worker is base-path aware: `cacheRules.js` prefixes the `/config/` runtime rule and the navigation-fallback exclusions with the base path. The worker file is served from `<base>/service-worker.js`, so its default scope is the base path. Players, `*.mdstrm.com` and media are still never intercepted or cached.
- `prepare-pages.js` copies `build/index.html` to `build/404.html` (the SPA fallback) and creates an empty `build/.nojekyll`.
- `npm run preview:pages` copies `build/` to `<tmp>/marea-pages-sim/marea-ott-demo/` so a static server can reproduce the subpath locally.
- `npm run deploy:pages` builds, then `scripts/deploy-pages.js` force-pushes a single-commit copy of `build/` to the `gh-pages` branch of `origin`, using the `gh` credential helper for that one command only. `--dry-run` prints the steps without pushing.

## Consequences

- Android TWA verification needs `/.well-known/assetlinks.json` at the origin root. The root of a project page belongs to `mauromateus.github.io`, not to this repo, so this deployment cannot be verified as a TWA. It is valid for browser, installed PWA and iPhone tests. A user-site repo (`<user>.github.io`) or a custom domain is needed for the TWA.
- The 404.html trick makes a direct hit on a deep link (for example `/marea-ott-demo/tv`) return HTTP status 404, even though the app renders. Browsers show the page; crawlers and uptime checks see a 404. In-app navigation and the service worker fallback are not affected.
- `.nojekyll` is required. Without it Jekyll ignores dot-folders and could drop files.
- The manifest and service worker scope are relative, so the same code works at the root and under the subpath. The default build keeps `PUBLIC_URL` empty and behaves as before.
- A page can only be served from one base path per build: the `build:pages` output must not be served at `/`, and the root build must not be served under the subpath.
