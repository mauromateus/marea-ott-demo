// Static titles keep page_view deterministic (document.title is set asynchronously by react-helmet).
const ROUTE_TITLES = {
  '/': 'Home',
  '/tv': 'Marea TV',
  '/radio': 'Marea Radio',
  '/debug': 'Debug',
  '/install': 'Install',
  '/install': 'Install'
}

export const getRouteTitle = (pathname) => ROUTE_TITLES[pathname] || 'not-set'

export default ROUTE_TITLES
