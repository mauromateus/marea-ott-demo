import { translate } from 'core/Translation'
import { isValidPlatform } from 'core/Utils/getPlatformOrigin'

const CARD_KEYS = {
  available: 'debug.install.card.available',
  snoozed: 'debug.install.card.snoozed',
  'hidden-installed': 'debug.install.card.hiddenInstalled',
  'hidden-platform': 'debug.install.card.hiddenPlatform',
  'hidden-route': 'debug.install.card.hiddenRoute',
  'no-offer': 'debug.install.card.noOffer'
}

const yesNo = (value) => translate(value ? 'debug.install.yes' : 'debug.install.no')

const cardText = ({ code, params }) => (
  translate(CARD_KEYS[code], code === 'snoozed' ? { until: new Date(params.until).toLocaleString('es') } : undefined)
)

// Only a valid value other than web is read back by the platform resolver, so only that one hides the install UI.
const hidesInstallUi = (stored) => isValidPlatform(stored) && String(stored).trim().toLowerCase() !== 'web'

/** Rows shared by the panel and the plain-text report, so both always say the same. */
export default function buildInstallRows ({ platform, canInstall, storedPlatform, installedMark, summary }) {
  return [
    { id: 'offered', label: translate('debug.install.label.offered'), value: yesNo(canInstall) },
    { id: 'platform', label: translate('debug.label.platform'), value: platform },
    {
      id: 'storedPlatform',
      label: translate('debug.install.label.storedPlatform'),
      value: storedPlatform ? String(storedPlatform) : translate('debug.install.storedPlatformNone'),
      hint: hidesInstallUi(storedPlatform) ? translate('debug.install.storedPlatformHint') : ''
    },
    { id: 'card', label: translate('debug.install.label.card'), value: cardText(summary) },
    { id: 'installedMark', label: translate('debug.install.label.installedMark'), value: yesNo(installedMark) }
  ]
}
