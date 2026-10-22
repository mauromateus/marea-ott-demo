import { getRunningMainBundle } from 'core/Utils/getMainBundleName'

const BUILD_ID = /^main\.([0-9a-f]+)\.js$/i

/** Hash part of a main bundle name (main.75f0989a.js -> 75f0989a), or null when it does not match. */
export default function getBuildId (mainBundleName) {
  const match = typeof mainBundleName === 'string' ? BUILD_ID.exec(mainBundleName) : null
  return match ? match[1] : null
}

/** Build id of the running page; null in the dev server, which has no hashed main bundle. */
export const getRunningBuildId = (doc = document) => getBuildId(getRunningMainBundle(doc))
