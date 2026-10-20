import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { Link, useLocation } from 'react-router-dom'

import { ShareIcon, CloseIcon } from 'components/common/Icons/Icons'
import { useAppContext } from 'components/context/AppContext/AppContext'
import Storage from 'core/Storage'
import { readInstallContext, shouldShowIosBanner } from 'core/Utils/detectInstallContext'

export const INSTALL_BANNER_DISMISSED_KEY = 'marea:install-banner-dismissed'

const Bar = styled.div`
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border-bottom: 1px solid ${({ theme }) => theme.colors.accent};
`

const Inner = styled.div`
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  padding: 8px ${({ theme }) => theme.layout.gutter};
  display: flex;
  align-items: center;
  gap: 8px 16px;
  font-size: 0.95rem;
`

const Message = styled.p`
  flex: 1;
  min-width: 0;
`

const ShareWord = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accent};
  vertical-align: bottom;

  svg { font-size: 1.2em; }
`

const HelpLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 4px;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
  white-space: nowrap;
`

const Dismiss = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex: none;
  padding: 0;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: transparent;
  font-size: 1.25rem;

  &:hover { background: rgba(255, 255, 255, 0.08); }
`

// Safari on iPhone and iPad cannot be prompted: this explains the manual Share > Add to Home Screen path.
export default function InstallBanner () {
  const { platform, config } = useAppContext()
  const { pathname } = useLocation()
  const [context] = useState(readInstallContext)
  const [dismissed, setDismissed] = useState(() => Storage.getItem(INSTALL_BANNER_DISMISSED_KEY) === true)

  const dismiss = useCallback(() => {
    Storage.setItem(INSTALL_BANNER_DISMISSED_KEY, true)
    setDismissed(true)
  }, [])

  if (dismissed || pathname === '/install' || !shouldShowIosBanner({ context, platform })) {
    return null
  }

  return (
    <Bar role='region' aria-label='Install the app'>
      <Inner>
        <Message>
          Install {config?.brand?.name}: tap <ShareWord><ShareIcon />Share</ShareWord>, then Add to Home Screen.
        </Message>
        <HelpLink to='/install'>More help</HelpLink>
        <Dismiss type='button' aria-label='Dismiss install banner' onClick={dismiss}><CloseIcon /></Dismiss>
      </Inner>
    </Bar>
  )
}
