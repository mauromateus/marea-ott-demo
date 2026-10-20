import { translate } from 'core/Translation'

export const yesNo = (value) => translate(value ? 'debug.yes' : 'debug.no')

// collectDiagnostics keeps the technical codes ('yes' | 'no' | 'not supported'); only the display is translated.
export const serviceWorkerLabel = (state) => {
  if (state === 'yes') return translate('debug.yes')
  if (state === 'no') return translate('debug.no')
  return translate('debug.unsupported')
}

export const orNone = (value) => value || translate('debug.none')
export const orEmpty = (value) => value || translate('debug.empty')
