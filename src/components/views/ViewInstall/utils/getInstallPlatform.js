// Which set of steps matches this device. Every iOS device (iPhone, iPad) shares the Safari steps.
export default function getInstallPlatform (context) {
  if (context?.isIos) return 'iphone'
  if (context?.isAndroid) return 'android'
  return 'desktop'
}
