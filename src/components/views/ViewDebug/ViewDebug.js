import React from 'react'
import styled from 'styled-components'
import { Helmet } from 'react-helmet'

import { Button } from 'components/common/Button/Button.styles'
import { useAppContext } from 'components/context/AppContext/AppContext'
import { translate } from 'core/Translation'
import useDiagnostics from './hooks/useDiagnostics'
import useCopyReport from './hooks/useCopyReport'
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

const Grid = styled.dl`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
  margin: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 240px minmax(0, 1fr);
  }
`

const Term = styled.dt`
  padding: 12px 16px 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.85rem;
  background: ${({ theme }) => theme.colors.surface};

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 12px 16px;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    &:first-of-type { border-top: 0; }
  }
`

const Value = styled.dd`
  margin: 0;
  padding: 2px 16px 12px;
  background: ${({ theme }) => theme.colors.surface};
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9rem;
  overflow-wrap: anywhere;

  strong { color: ${({ theme }) => theme.colors.accent}; }

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 12px 16px;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    &:nth-of-type(1) { border-top: 0; }
  }
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
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
  const report = formatReport(d, events, config.brand.name)
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

      <Actions>
        <Button type='button' onClick={copy}>{translate('debug.copy')}</Button>
        <span role='status'>{message}</span>
      </Actions>

      <Report ref={reportRef} tabIndex={0} aria-label={translate('debug.reportLabel')}>{report}</Report>
    </Page>
  )
}
