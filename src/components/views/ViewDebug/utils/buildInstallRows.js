import { REAPPEAR_MODES } from 'components/common/InstallSheet/utils/reappearPolicy'
import { translate } from 'core/Translation'

const CARD_KEYS = {
  available: 'debug.install.card.available',
  'closed-session': 'debug.install.card.closedSession',
  snoozed: 'debug.install.card.snoozed',
  'hidden-installed': 'debug.install.card.hiddenInstalled',
  'hidden-platform': 'debug.install.card.hiddenPlatform',
  'hidden-route': 'debug.install.card.hiddenRoute',
  'no-offer': 'debug.install.card.noOffer'
}

const REAPPEAR_KEYS = {
  [REAPPEAR_MODES.EVERY_LOAD]: 'debug.install.reappear.everyLoad',
  [REAPPEAR_MODES.SESSION]: 'debug.install.reappear.session',
  [REAPPEAR_MODES.PROGRESSIVE]: 'debug.install.reappear.progressive'
}

const yesNo = (value) => translate(value ? 'debug.install.yes' : 'debug.install.no')

const cardText = ({ code, params }) => (
  translate(CARD_KEYS[code], code === 'snoozed' ? { until: new Date(params.until).toLocaleString('es') } : undefined)
)

const policyText = ({ mode, days }) => {
  if (mode === REAPPEAR_MODES.DAYS) {
    return days === 1 ? translate('debug.install.reappear.day') : translate('debug.install.reappear.days', { days })
  }
  return translate(REAPPEAR_KEYS[mode])
}

/** Rows shared by the panel and the plain-text report, so both always say the same. */
export default function buildInstallRows ({ platform, canInstall, storedPlatform, installedMark, summary, policy }) {
  return [
    { id: 'offered', label: translate('debug.install.label.offered'), value: yesNo(canInstall) },
    { id: 'platform', label: translate('debug.label.platform'), value: platform },
    {
      id: 'storedPlatform',
      label: translate('debug.install.label.storedPlatform'),
      value: storedPlatform ? String(storedPlatform) : translate('debug.install.storedPlatformNone')
    },
    { id: 'card', label: translate('debug.install.label.card'), value: cardText(summary) },
    { id: 'reappear', label: translate('debug.install.label.reappear'), value: policyText(policy) },
    { id: 'installedMark', label: translate('debug.install.label.installedMark'), value: yesNo(installedMark) }
  ]
}
