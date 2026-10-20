import getAnalyticsAppName from './getAnalyticsAppName'

// Same return shape as the real getNpawApp, but the app name depends on the resolved platform.
export default function getNpawApp (config, platform) {
  return {
    appName: getAnalyticsAppName(config, platform),
    appVersion: config?.app?.version
  }
}
