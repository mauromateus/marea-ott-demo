import React from 'react'
import PropTypes from 'prop-types'
import styled, { css, keyframes } from 'styled-components'

import { Button } from 'components/common/Button/Button.styles'
import { InstallIcon } from 'components/common/Icons/Icons'
import { withAlpha } from 'components/context/ThemeContext/utils/buildTheme'
import { translate } from 'core/Translation'
import useCanShowInstall from './hooks/useCanShowInstall'

const attention = keyframes`
  0% { box-shadow: 0 0 0 0 var(--install-pulse); }
  70% { box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
`

// Compact (header): a coral pill that stands out from the teal nav. Two gentle pulses, then it rests.
const InstallAction = styled(Button)`
  ${({ $compact, theme }) => $compact && css`
    --install-pulse: ${withAlpha(theme.colors.live, 0.6)};
    padding: 0 14px;
    font-size: 0.9rem;
    background: ${theme.colors.live};
    color: #1a0a06;
    white-space: nowrap;
    animation: ${attention} 2.2s ease-out 1.5s 2;

    &:hover { box-shadow: ${theme.shadows.liveGlow}; }
    @media (prefers-reduced-motion: reduce) { animation: none; }
  `}

  ${({ $large }) => $large && css`
    width: 100%;
    max-width: 420px;
    min-height: 60px;
    font-size: 1.2rem;
  `}
`

InstallButton.propTypes = {
  compact: PropTypes.bool,
  large: PropTypes.bool,
  className: PropTypes.string
}

export default function InstallButton ({ compact = false, large = false, className }) {
  const { canShow, promptInstall } = useCanShowInstall()

  if (!canShow) {
    return null
  }

  return (
    <InstallAction type='button' className={className} $compact={compact} $large={large} onClick={promptInstall}>
      <InstallIcon />
      {translate('common.installApp')}
    </InstallAction>
  )
}
