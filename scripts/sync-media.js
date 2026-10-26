// Fills the home rails of public/config/marea.json with real VOD medias from the Mediastream test account.
// Usage: node scripts/sync-media.js [--dry-run]
//
// Reads the ids to show from scripts/media-selection.json and the API token from the local .env (MS_API_TOKEN).
// The token is only used here, on this machine: the config keeps public metadata only (id, title, duration, thumbnail url).
const fs = require('fs')
const path = require('path')

const API_BASE = 'https://platform.mediastre.am/api'
const TARGET_THUMBNAIL_WIDTH = 640
const ROOT = path.join(__dirname, '..')
const SELECTION_FILE = path.join(__dirname, 'media-selection.json')
const CONFIG_FILE = path.join(ROOT, 'public', 'config', 'marea.json')
const ENV_FILE = path.join(ROOT, '.env')

const parseEnv = (text) => String(text).split(/\r?\n/).reduce((env, line) => {
  const trimmed = line.trim()
  const at = trimmed.indexOf('=')
  if (!trimmed || trimmed.startsWith('#') || at < 1) {
    return env
  }
  return { ...env, [trimmed.slice(0, at).trim()]: trimmed.slice(at + 1).trim() }
}, {})

const parseSize = (size) => {
  const match = /^(\d+)x(\d+)$/.exec(String(size || ''))
  // A thumbnail without size is assumed 16:9; the card only needs the ratio.
  return match ? { width: Number(match[1]), height: Number(match[2]) } : { width: 16, height: 9 }
}

const pickThumbnail = (thumbnails) => {
  const usable = (thumbnails || []).filter((thumb) => /^https:\/\//.test(thumb?.url || ''))
  if (!usable.length) {
    return null
  }
  const defaults = usable.filter((thumb) => thumb.is_default)
  const pool = defaults.length ? defaults : usable
  const sized = pool.map((thumb) => ({ thumb, ...parseSize(thumb.size) }))
  const best = sized.reduce((a, b) => (Math.abs(b.width - TARGET_THUMBNAIL_WIDTH) < Math.abs(a.width - TARGET_THUMBNAIL_WIDTH) ? b : a))
  return { url: best.thumb.url, width: best.width, height: best.height }
}

const formatDuration = (seconds) => {
  const total = Math.round(Number(seconds))
  if (!(total > 0)) {
    return ''
  }
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const rest = total % 60
  if (hours) {
    return minutes ? `${hours} h ${minutes} min` : `${hours} h`
  }
  if (minutes) {
    return rest ? `${minutes} min ${rest} s` : `${minutes} min`
  }
  return `${rest} s`
}

const buildItem = (media) => {
  const thumbnail = pickThumbnail(media.thumbnails)
  if (media.type !== 'video' || !media.is_published || !thumbnail) {
    throw new Error(`Media ${media._id} cannot be shown: it needs to be a published video with a thumbnail`)
  }
  return {
    id: media._id,
    title: String(media.title || '').trim(),
    meta: formatDuration(media.duration),
    thumbnail
  }
}

const buildRails = (selection, medias) => {
  const rails = selection?.rails || []
  if (!rails.length || rails.some((rail) => !rail.mediaIds?.length)) {
    throw new Error('The selection needs at least one rail, and every rail needs at least one media id')
  }
  const byId = new Map(medias.map((media) => [media._id, media]))
  const seen = new Set()

  return rails.map((rail) => ({
    id: rail.id,
    title: rail.title,
    items: rail.mediaIds.map((id) => {
      if (seen.has(id)) {
        throw new Error(`Media ${id} appears more than once in the selection`)
      }
      seen.add(id)
      if (!byId.has(id)) {
        throw new Error(`Media ${id} was not found in the account`)
      }
      return buildItem(byId.get(id))
    })
  }))
}

const fetchMedia = async (id, token) => {
  const res = await fetch(`${API_BASE}/media/${id}`, { headers: { 'X-API-Token': token, Accept: 'application/json' } })
  if (!res.ok) {
    throw new Error(`Media ${id}: the API answered ${res.status}`)
  }
  const body = await res.json()
  return body.data || body
}

const main = async () => {
  const dryRun = process.argv.includes('--dry-run')
  const token = parseEnv(fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, 'utf8') : '').MS_API_TOKEN
  if (!token) {
    throw new Error('MS_API_TOKEN is missing: put it in .env (see .env.example)')
  }

  const selection = JSON.parse(fs.readFileSync(SELECTION_FILE, 'utf8'))
  const ids = selection.rails.flatMap((rail) => rail.mediaIds)
  const medias = await Promise.all(ids.map((id) => fetchMedia(id, token)))
  const rails = buildRails(selection, medias)

  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
  const next = { ...config, rails }
  rails.forEach((rail) => console.log(`${rail.title}: ${rail.items.map((item) => `${item.title} (${item.meta})`).join(' | ')}`))

  if (dryRun) {
    console.log('Dry run: public/config/marea.json was not changed.')
    return
  }
  fs.writeFileSync(CONFIG_FILE, `${JSON.stringify(next, null, 2)}\n`)
  console.log('public/config/marea.json updated.')
}

module.exports = { parseEnv, pickThumbnail, formatDuration, buildItem, buildRails }

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message)
    process.exit(1)
  })
}
