import React from 'react'
import styled from 'styled-components'
import { Helmet } from 'react-helmet'

import { Button } from 'components/common/Button/Button.styles'
import { useAppContext } from 'components/context/AppContext/AppContext'
import { translate } from 'core/Translation'
import useDiagnostics from './hooks/useDiagnostics'
import useCopyReport from './hooks/useCopyReport'
import useInstallState from './hooks/useInstallState'
import InstallStatePanel from './InstallStatePanel'
import { Actions, Grid, Term, Value } from './ViewDebug.styles'
import formatReport from './utils/formatReport'
import { orEmpty, orNone, serviceWorkerLabel, yesNo } from './utils/labels'

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const Lead = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 68ch;
`

const Report = styled.pre`
  margin: 0;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
  font-size: 0.8rem;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  user-select: text;
  -webkit-user-select: text;
`

export default function ViewDebug () {
  const { config } = useAppContext()
  const { diagnostics: d, events } = useDiagnostics()
  const installRows = useInstallState()
  const report = formatReport(d, events, config.brand.name, installRows)
  const { reportRef, copy, message } = useCopyReport(report)

  const rows = [
    [translate('debug.label.platform'), <><strong>{d.platform}</strong> ({d.platformSource})</>],
    [translate('debug.label.appName'), <strong>{orNone(d.analyticsAppName)}</strong>],
    [translate('debug.label.displayMode'), d.displayMode],
    [translate('debug.label.referrer'), orEmpty(d.referrer)],
    [translate('debug.label.launchQuery'), orNone(d.launchQuery)],
    [translate('debug.label.sessionPlatform'), orNone(d.sessionPlatform)],
    [translate('debug.label.serviceWorker'), serviceWorkerLabel(d.serviceWorkerControlling)],
    [translate('debug.label.online'), yesNo(d.online)],
    [translate('debug.label.userAgent'), d.userAgent]
  ]

  return (
    <Page>
      <Helmet><title>{translate('debug.pageTitle')}</title></Helmet>
      <h1>{translate('debug.title')}</h1>
      <Lead>{translate('debug.lead')}</Lead>

      <Grid>
        {rows.map(([label, value]) => (
          <React.Fragment key={label}>
            <Term>{label}</Term>
            <Value>{value}</Value>
          </React.Fragment>
        ))}
      </Grid>

      <InstallStatePanel rows={installRows} />

      <Actions>
        <Button type='button' onClick={copy}>{translate('debug.copy')}</Button>
        <span role='status'>{message}</span>
      </Actions>

      <Report ref={reportRef} tabIndex={0} aria-label={translate('debug.reportLabel')}>{report}</Report>
    </Page>
  )
}
