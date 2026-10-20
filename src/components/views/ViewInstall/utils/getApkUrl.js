// Empty string hides the Android app section. Only absolute http(s) links are accepted.
export default function getApkUrl (config) {
  const value = config?.install?.apkUrl
  const url = typeof value === 'string' ? value.trim() : ''
  return /^https?:\/\//i.test(url) ? url : ''
}
