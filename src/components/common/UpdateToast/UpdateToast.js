import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import ServiceWorkerService from 'core/services/ServiceWorkerService'
import { Button } from 'components/common/Button/Button.styles'

const Toast = styled.div`
  position: fixed;
  left: 50%;
  bottom: calc(88px + env(safe-area-inset-bottom));
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
      <span>New version available</span>
      <Button type='button' onClick={() => ServiceWorkerService.applyUpdate()}>Refresh</Button>
    </Toast>
  )
}
