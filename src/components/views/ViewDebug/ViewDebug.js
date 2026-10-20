import React from 'react'
import styled from 'styled-components'
import { Helmet } from 'react-helmet'

import { Button } from 'components/common/Button/Button.styles'
import useDiagnostics from './hooks/useDiagnostics'
import useCopyReport from './hooks/useCopyReport'
import formatReport from './utils/formatReport'

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
  const { diagnostics: d, events } = useDiagnostics()
  const report = formatReport(d, events)
  const { reportRef, copy, message } = useCopyReport(report)

  const rows = [
    ['Resolved platform', <><strong>{d.platform}</strong> ({d.platformSource})</>],
    ['Analytics appName', <strong>{d.analyticsAppName || '(none)'}</strong>],
    ['Display mode', d.displayMode],
    ['document.referrer', d.referrer || '(empty)'],
    ['Launch query', d.launchQuery || '(none)'],
    ['Stored session platform', d.sessionPlatform || '(none)'],
    ['Service worker controls page', d.serviceWorkerControlling],
    ['Online', d.online ? 'yes' : 'no'],
    ['User agent', d.userAgent]
  ]

  return (
    <Page>
      <Helmet><title>Debug</title></Helmet>
      <h1>Debug</h1>
      <Lead>
        What this device reports to analytics. Open this page inside each shell (browser, installed app, Android app, TV)
        and paste the report into docs/test-log.md.
      </Lead>

      <Grid>
        {rows.map(([label, value]) => (
          <React.Fragment key={label}>
            <Term>{label}</Term>
            <Value>{value}</Value>
          </React.Fragment>
        ))}
      </Grid>

      <Actions>
        <Button type='button' onClick={copy}>Copy report</Button>
        <span role='status'>{message}</span>
      </Actions>

      <Report ref={reportRef} tabIndex={0} aria-label='Plain text report'>{report}</Report>
    </Page>
  )
}
