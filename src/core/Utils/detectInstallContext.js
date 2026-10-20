const IOS_UA = /iPad|iPhone|iPod/
const IPHONE_UA = /iPhone|iPod/
const ANDROID_UA = /Android/i

/**
 * Pure device detection for the install UI.
 * iPadOS 13+ Safari sends a desktop Mac UA, so it is told apart by MacIntel plus touch points.
 * isIphone is false for every iPad, including that desktop-class UA.
 */
export default function detectInstallContext ({
  userAgent = '',
  platform = '',
  maxTouchPoints = 0,
  navigatorStandalone = false,
  displayModeStandalone = false
} = {}) {
  const isIos = IOS_UA.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1)
  return {
    isIos,
    isIphone: IPHONE_UA.test(userAgent),
    isAndroid: !isIos && ANDROID_UA.test(userAgent),
    isStandalone: !!navigatorStandalone || !!displayModeStandalone
  }
}

const matchesStandalone = () => {
  try {
    return !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
  } catch (e) {
    return false
  }
}

export const readInstallContext = () => detectInstallContext({
  userAgent: window.navigator.userAgent,
  platform: window.navigator.platform,
  maxTouchPoints: window.navigator.maxTouchPoints,
  navigatorStandalone: window.navigator.standalone,
  displayModeStandalone: matchesStandalone()
})

// Install UI belongs to the browser only: shells (TWA, TV, native) and the installed app must never offer it.
export const canShowInstallUi = (platform) => platform === 'web'

export const shouldShowIosInstructions = ({ context, platform }) => !!context?.isIos && !context.isStandalone && canShowInstallUi(platform)
