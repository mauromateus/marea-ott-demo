import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import ServiceWorkerService from 'core/services/ServiceWorkerService'
import { Button } from 'components/common/Button/Button.styles'
import { MINI_PLAYER_CLEARANCE } from 'components/content/MiniPlayer/config/constants'
import { translate } from 'core/Translation'

const Toast = styled.div`
  position: fixed;
  left: 50%;
  bottom: calc(${MINI_PLAYER_CLEARANCE} + env(safe-area-inset-bottom));
  transform: translateX(-50%);
  z-index: 40;
  width: min(92vw, 460px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 10px 10px 18px;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  box-shadow: ${({ theme }) => theme.shadows.glow};
`

export default function UpdateToast () {
  const [hasUpdate, setHasUpdate] = useState(ServiceWorkerService.hasUpdate())

  useEffect(() => ServiceWorkerService.subscribe(() => setHasUpdate(ServiceWorkerService.hasUpdate())), [])

  if (!hasUpdate) {
    return null
  }

  return (
    <Toast role='status'>
      <span>{translate('common.update.available')}</span>
      <Button type='button' onClick={() => ServiceWorkerService.applyUpdate()}>{translate('common.update.action')}</Button>
    </Toast>
  )
}
