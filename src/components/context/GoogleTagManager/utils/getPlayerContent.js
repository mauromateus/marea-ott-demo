/**
 * Builds the content object the tracking utils expect, from a config `players.*` entry.
 * The real product derives the same fields from the GraphQL content (see its getPlayerContent).
 */
export default function getPlayerContent ({ media, kind, ottName, page }) {
  return {
    _id: media.id,
    page,
    msOttName: ottName,
    msPageTitle: media.title,
    msShowName: media.title,
    msVideoId: media.id,
    msVideoTitle: media.title,
    msVideoType: media.type === 'live' ? 'Live' : 'VOD',
    msCategoryNames: kind === 'audio' ? 'Radio' : 'TV',
    msLoginStatus: 'anonymous'
  }
}
