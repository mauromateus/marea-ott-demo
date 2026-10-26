import { translate } from 'core/Translation'

// Static titles keep page_view deterministic (document.title is set asynchronously by react-helmet).
// Literal keys on purpose: the dictionary test scans source for them. Titles are Spanish; event names and keys stay English.
const ROUTE_TITLE_KEYS = {
  '/': 'home.pageTitle',
  '/tv': 'tv.pageTitle',
  '/radio': 'radio.pageTitle',
  '/debug': 'debug.pageTitle',
  '/install': 'install.pageTitle'
}

export const getRouteTitle = (pathname) => {
  if (ROUTE_TITLE_KEYS[pathname]) {
    return translate(ROUTE_TITLE_KEYS[pathname])
  }
  // /ver/<media id>: one title for every on-demand page, the id is already in `page`.
  return pathname.startsWith('/ver/') ? translate('vod.pageTitle') : 'not-set'
}

export default ROUTE_TITLE_KEYS
