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

export const getRouteTitle = (pathname) => (ROUTE_TITLE_KEYS[pathname] ? translate(ROUTE_TITLE_KEYS[pathname]) : 'not-set')

export default ROUTE_TITLE_KEYS
