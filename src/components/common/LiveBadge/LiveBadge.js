import React from 'react'
import styled, { keyframes } from 'styled-components'

import { translate } from 'core/Translation'

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
  70% { box-shadow: 0 0 0 7px rgba(255, 255, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
`

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 10px 4px 9px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.live};
  color: #1a0a06;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  line-height: 1.4;
`

const Dot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #1a0a06;
  animation: ${pulse} 1.8s ease-out infinite;
`

export default function LiveBadge () {
  return (
    <Badge>
      <Dot aria-hidden='true' />
      {translate('common.live')}
    </Badge>
  )
}
