import React, { useContext, useMemo } from 'react'
import PropTypes from 'prop-types'
import getNpawApp from 'core/Utils/getNpawApp'

const AppContext = React.createContext({ config: null, platform: 'web', platformSource: 'default', npaw: {} })

AppContextProvider.propTypes = {
  config: PropTypes.object.isRequired,
  platformDetails: PropTypes.shape({ platform: PropTypes.string, source: PropTypes.string }).isRequired,
  children: PropTypes.node
}

export default function AppContextProvider ({ config, platformDetails, children }) {
  const value = useMemo(() => {
    const { appName, appVersion } = getNpawApp(config, platformDetails.platform)
    return {
      config,
      platform: platformDetails.platform,
      platformSource: platformDetails.source,
      // Same { name, version } object the real product sends as npaw to the player.
      npaw: { name: appName, version: appVersion }
    }
  }, [config, platformDetails])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => useContext(AppContext)
