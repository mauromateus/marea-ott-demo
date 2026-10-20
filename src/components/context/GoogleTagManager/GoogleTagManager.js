import React, { useContext, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useLocation } from 'react-router-dom'

import { useAppContext } from 'components/context/AppContext/AppContext'
import initGtm from './utils/initGtm'
import trackPageView from './utils/trackPageView'
import trackPlayerReady from './utils/trackPlayerReady'
import trackPlayerTime from './utils/trackPlayerTime'
import { getRouteTitle } from './config/routeTitles'

const GTMContext = React.createContext({
  trackPlayerReady: () => {},
  trackPlayerTime: () => {}
})

GTMProvider.propTypes = {
  children: PropTypes.node
}

export default function GTMProvider ({ children }) {
  const { config } = useAppContext()
  const location = useLocation()
  const gtmId = config?.app?.gtmId
  const ottName = config?.app?.ottName

  useEffect(() => {
    initGtm(gtmId)
  }, [gtmId])

  useEffect(() => {
    trackPageView({
      page: location.pathname,
      pageData: { msPageTitle: getRouteTitle(location.pathname), msOttName: ottName, msLoginStatus: 'anonymous' }
    })
  }, [location.pathname, ottName])

  const value = useMemo(() => ({ trackPlayerReady, trackPlayerTime }), [])

  return <GTMContext.Provider value={value}>{children}</GTMContext.Provider>
}

export const useGoogleTagManager = () => useContext(GTMContext)
