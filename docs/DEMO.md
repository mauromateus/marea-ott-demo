# Live demo scenario: change something, add something, see it everywhere

Goal: show that a content, branding or layout change is a web deploy, and that the Android app (TWA), the browser and the iPhone PWA all show it with no store submission.

## Before the audience arrives

1. Marea APK installed on the Android phone (TWA, no address bar).
2. The iPhone viewers open `https://mauromateus.github.io/marea-ott-demo/` in Safari, then Share, then **Add to Home Screen**, and open Marea from the new icon.
3. A browser tab on the site. Everyone compares the footer build id (`compilación ...`), which must be the same on every screen.
4. Check the starting point: purple accent absent, tagline "TV y radio en vivo, directo desde la costa.", three rails.

## The change (what "run the test" does)

`npm run demo:apply` edits only `public/config/marea.json`, through `scripts/sync-media.js`:

| Change | Before | After |
|---|---|---|
| Text | "TV y radio en vivo, directo desde la costa." | "Cambio en vivo: este texto, el color y la fila nueva llegaron sin tocar la app" |
| Color | teal accent `#2EC4B6` | purple accent `#9B5DE5` (logo, buttons, active tab) |
| New content | 3 rails | a fourth rail on top, "Recién agregado en la demo", with 3 medias already approved |

Then `npm run deploy:pages` publishes it. Build and publish take about two minutes.

## Show it

1. Reload the web page: new text, color and rail.
2. Android app: close it from the recent apps list and open it again. Same build id as before, so the APK did not change.
3. iPhone: close the Marea icon app and open it again (or pull to refresh). Same changes.
4. Open a card of the new rail on any device: it plays.

## Undo

`npm run demo:revert` restores the tagline, the color and the three base rails in one run (it uses the default selection), then `npm run deploy:pages`.

## If something does not change

- The page asks the network for the config on every load (`no-cache`) and the service worker tries the network first for 3 seconds, so a plain reload is enough. A stale screen is usually the old tab: close it.
- GitHub Pages can take a minute to serve the new files. Check `https://mauromateus.github.io/marea-ott-demo/config/marea.json` first.
- "Documental: Naturaleza Salvaje" does not play (platform answers 403). Avoid it in the demo.
