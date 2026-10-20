// Version identity of a build: the hashed CRA entry bundle, e.g. main.d0945250.js.
const MAIN_BUNDLE = /(?:^|\/)(main\.[0-9a-f]+\.js)(?:[?#].*)?$/i

export default function getMainBundleName (urls) {
  if (!Array.isArray(urls)) {
    return null
  }
  for (const url of urls) {
    const match = typeof url === 'string' ? MAIN_BUNDLE.exec(url) : null
    if (match) {
      return match[1]
    }
  }
  return null
}

/** Main bundle of the running page, read from its script tags. */
export const getRunningMainBundle = (doc = document) => (
  getMainBundleName(Array.from(doc.querySelectorAll('script[src]'), (script) => script.getAttribute('src')))
)
