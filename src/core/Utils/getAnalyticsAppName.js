export default function getAnalyticsAppName (config, platform) {
  const analytics = config?.analytics
  return analytics?.appNames?.[platform] || analytics?.appName
}
