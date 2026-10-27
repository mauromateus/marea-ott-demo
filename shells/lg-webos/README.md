# Marea for LG webOS TV (hosted web app shell)

A webOS app is a folder with `appinfo.json` and an HTML entry. This one is a **hosted web app**: `index.html` only redirects to the published PWA
(`https://mauromateus.github.io/marea-ott-demo/?ms_platform=lg-tv`), so every PWA deploy reaches the TV with no new package, like the Android TWA.
`ms_platform=lg-tv` tells the platform resolver which shell it runs in (ADR 0001); analytics report `marea-lg-tv`.

Target of the first test: LG 60UN7310PDA, webOS TV 5.6.2 (2020, Chromium 68 per LG's web engine table).

## Files

| File | Purpose |
|---|---|
| `appinfo.json` | App id `io.github.mauromateus.marea`, title, icons, 1920x1080 |
| `index.html` | Redirect to the PWA (meta refresh + `location.replace`) |
| `icon.png` (80), `largeIcon.png` (130), `splashBackground.png` (1920x1080) | Generated from the PWA icon by `node shells/lg-webos/build-assets.js` |

## Install on the TV

Needs a free LG Developer account, the TV and the PC on the same network, and Node.js. LG recommends Node 14.15-16.20; newer versions may work but are not guaranteed.

1. PC: `npm install -g @webos-tools/cli`, then `ares -V`.
2. TV: install the **Developer Mode** app from LG Content Store, open it, sign in with the LG Developer account and turn on **Dev Mode Status** (the TV reboots). Open it again, turn on **Key Server** and note the IP, the port (9922) and the passphrase shown.
3. PC: `ares-setup-device` and choose `add`. Name `marea-tv`, the TV IP, port `9922`, user `prisoner`.
4. PC: `ares-novacom --device marea-tv --getkey` and type the passphrase.
5. PC: `ares-device --system-info --device marea-tv` must print TV data.
6. From this repo:

```bash
cd shells/lg-webos
mkdir dist
cd dist
ares-package ..
ares-install --device marea-tv io.github.mauromateus.marea_0.1.0_all.ipk
ares-launch --device marea-tv io.github.mauromateus.marea
```

Debug: `ares-inspect --device marea-tv --app io.github.mauromateus.marea --open` opens Chrome DevTools on the TV page.
Uninstall: `ares-install --device marea-tv --remove io.github.mauromateus.marea`.

Developer Mode runs for a limited time: extend it with **EXTEND** in the app before it runs out, or the dev apps are removed.

## Not verified yet

- Service worker, localStorage and IndexedDB from a hosted origin: LG's docs do not say; check in the TV in the inspector.
- Arrow-key (5-way) focus movement: LG's docs do not say whether the platform provides it. The Magic Remote pointer is the safe path for now.
- Whether LG Content Store accepts a hosted app (this is a development install only).
- The Back key: by default webOS 5 goes to the Home launcher from the first page.
- LG's docs disagree on whether `largeIcon`, `splashBackground` and `iconColor` are optional; they are included.
