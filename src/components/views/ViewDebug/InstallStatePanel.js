import React from 'react'
import styled from 'styled-components'

import { translate } from 'core/Translation'
import { Grid, Term, Value } from './ViewDebug.styles'

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Lead = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 68ch;
`

/** @param {{rows: Array<{id: string, label: string, value: string}>}} props */
export default function InstallStatePanel ({ rows }) {
  return (
    <Section aria-labelledby='debug-install-title'>
      <h2 id='debug-install-title'>{translate('debug.install.title')}</h2>
      <Lead>{translate('debug.install.lead')}</Lead>

      <Grid>
        {rows.map(({ id, label, value }) => (
          <React.Fragment key={id}>
            <Term>{label}</Term>
            <Value>{value}</Value>
          </React.Fragment>
        ))}
      </Grid>
    </Section>
  )
}
