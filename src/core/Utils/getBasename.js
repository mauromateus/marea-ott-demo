// Path prefix the app is served from ('' at the origin root), derived from CRA's PUBLIC_URL.
export default function getBasename (publicUrl = process.env.PUBLIC_URL) {
  let path = String(publicUrl || '').trim()

  // PUBLIC_URL may be a full URL; only its pathname matters for routing and caching.
  if (/^([a-z][a-z0-9+.-]*:)?\/\//i.test(path)) {
    try {
      path = new URL(path, 'https://placeholder.invalid').pathname
    } catch (error) {
      return ''
    }
  }

  const segments = path.split('/').filter((segment) => segment && segment !== '.')
  return segments.length ? `/${segments.join('/')}` : ''
}

// Router-relative path of a browser pathname (what react-router sees and analytics reports).
export const stripBasename = (pathname, basename = getBasename()) => {
  if (!basename || (pathname !== basename && !pathname.startsWith(`${basename}/`))) {
    return pathname
  }
  return pathname.slice(basename.length) || '/'
}
