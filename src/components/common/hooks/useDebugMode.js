import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import { syncDebugMode } from 'core/Utils/debugMode'

/** Debug mode is off unless ?debug=1 was seen in this session. Synced during render so the first paint is right. */
export default function useDebugMode () {
  const { search } = useLocation()
  return useMemo(() => syncDebugMode(search), [search])
}
