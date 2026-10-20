import React from 'react'
import styled from 'styled-components'

import { Button } from 'components/common/Button/Button.styles'
import { translate } from 'core/Translation'
import useResetInstallState from './hooks/useResetInstallState'
import { Actions, Grid, Term, Value } from './ViewDebug.styles'

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Lead = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 68ch;
`

const Hint = styled.span`
  display: block;
  margin-top: 6px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.85rem;
`

/** @param {{rows: Array<{id: string, label: string, value: string, hint?: string}>}} props */
export default function InstallStatePanel ({ rows }) {
  const { reset, message, resetting } = useResetInstallState()

  return (
    <Section aria-labelledby='debug-install-title'>
      <h2 id='debug-install-title'>{translate('debug.install.title')}</h2>
      <Lead>{translate('debug.install.lead')}</Lead>

      <Grid>
        {rows.map(({ id, label, value, hint }) => (
          <React.Fragment key={id}>
            <Term>{label}</Term>
            <Value>
              {value}
              {hint ? <Hint>{hint}</Hint> : null}
            </Value>
          </React.Fragment>
        ))}
      </Grid>

      <Actions>
        <Button type='button' $variant='secondary' onClick={reset} disabled={resetting}>{translate('debug.install.reset')}</Button>
        <span role='status'>{message}</span>
      </Actions>
    </Section>
  )
}
