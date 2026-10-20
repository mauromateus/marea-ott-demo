import { translate } from 'core/Translation'
import { orNone } from './labels'

const workerVersionLabel = (worker) => {
  if (!worker) return translate('debug.worker.checking')
  if (worker.status === 'answered') return worker.version
  return translate(worker.status === 'none' ? 'debug.worker.none' : 'debug.worker.noResponse')
}

const waitingLabel = (worker) => {
  if (!worker) return translate('debug.worker.checking')
  return translate(worker.waiting ? 'debug.worker.waitingYes' : 'debug.worker.waitingNo')
}

/**
 * Read-only rows that tell which version the page runs and which one the service worker holds.
 * @param {{running: string|null, worker: {status: string, version: string|null, waiting: boolean}|null}} state - worker is null while querying
 * @returns {Array<{id: string, label: string, value: string}>}
 */
export default function buildVersionRows ({ running, worker }) {
  return [
    { id: 'runningVersion', label: translate('debug.label.runningVersion'), value: orNone(running) },
    { id: 'workerVersion', label: translate('debug.label.workerVersion'), value: workerVersionLabel(worker) },
    { id: 'workerWaiting', label: translate('debug.label.workerWaiting'), value: waitingLabel(worker) }
  ]
}
