import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'

import { Button } from 'components/common/Button/Button.styles'
import { InstallIcon } from 'components/common/Icons/Icons'
import { useAppContext } from 'components/context/AppContext/AppContext'
import { canShowInstallUi } from 'core/Utils/detectInstallContext'
import useInstallPrompt from './hooks/useInstallPrompt'

const InstallAction = styled(Button)`
  ${({ $compact }) => $compact && css`
    padding: 0 16px;
    font-size: 0.9rem;
  `}
`

InstallButton.propTypes = {
  compact: PropTypes.bool,
  className: PropTypes.string
}

export default function InstallButton ({ compact = false, className }) {
  const { platform } = useAppContext()
  const { canInstall, promptInstall } = useInstallPrompt()

  // Never inside the Android TWA ('android') or the installed app ('pwa-web'): only in a browser tab.
  if (!canInstall || !canShowInstallUi(platform)) {
    return null
  }

  return (
    <InstallAction type='button' className={className} $compact={compact} onClick={promptInstall}>
      <InstallIcon />
      Install app
    </InstallAction>
  )
}
