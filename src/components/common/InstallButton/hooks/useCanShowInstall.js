import { useAppContext } from 'components/context/AppContext/AppContext'
import { canShowInstallUi } from 'core/Utils/detectInstallContext'
import useInstallPrompt from './useInstallPrompt'

// The Chromium install button exists only in a browser tab (never in the Android TWA 'android' or the installed 'pwa-web').
export default function useCanShowInstall () {
  const { platform } = useAppContext()
  const { canInstall, promptInstall } = useInstallPrompt()
  return { canShow: canInstall && canShowInstallUi(platform), promptInstall }
}
