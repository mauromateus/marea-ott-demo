import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { Helmet } from 'react-helmet'

import { Button, ButtonAnchor } from 'components/common/Button/Button.styles'
import InstallButton from 'components/common/InstallButton/InstallButton'
import useCopyText from 'components/common/hooks/useCopyText'
import { InstallIcon } from 'components/common/Icons/Icons'
import { useAppContext } from 'components/context/AppContext/AppContext'
import { readInstallContext } from 'core/Utils/detectInstallContext'
import getSiteUrl from 'core/Utils/getSiteUrl'
import QrCode from './QrCode'
import getApkUrl from './utils/getApkUrl'

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
`

const Lead = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 68ch;
`

const Status = styled.p`
  align-self: flex-start;
  padding: 8px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.surface};
  font-weight: 500;

  &[data-installed='true'] { border-color: ${({ theme }) => theme.colors.accent}; color: ${({ theme }) => theme.colors.accent}; }
`

const Card = styled.section`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
`

const CardBody = styled.div`
  flex: 1 1 260px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const Url = styled.code`
  display: block;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.background};
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9rem;
  overflow-wrap: anywhere;
  user-select: all;
  -webkit-user-select: all;
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 14px;
`

const Steps = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`

const StepCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};

  h2 { font-size: 1.15rem; }
  ol { margin: 0; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 6px; }
  strong { color: ${({ theme }) => theme.colors.accent}; font-weight: 600; }
`

const Note = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.9rem;
  max-width: 68ch;
`

export default function ViewInstall () {
  const { config, platform } = useAppContext()
  const brand = config.brand.name
  const siteUrl = useMemo(() => getSiteUrl(), [])
  const apkUrl = getApkUrl(config)
  const [context] = useState(readInstallContext)
  const { ref, copy, message } = useCopyText(siteUrl, 'link')

  let status = 'Not running as an installed app.'
  let installed = false
  if (platform === 'android') {
    status = `You are using the ${brand} Android app.`
    installed = true
  } else if (platform === 'pwa-web' || context.isStandalone) {
    status = `Already installed: you are using ${brand} as an app.`
    installed = true
  }

  return (
    <Page>
      <Helmet><title>Install</title></Helmet>
      <h1>Install {brand}</h1>
      <Lead>
        {brand} runs in the browser and can also live on your home screen or desktop, full screen and one tap away.
      </Lead>

      <Status role='status' aria-label='Install status' data-installed={installed}>{status}</Status>

      <InstallButton />

      <Card aria-labelledby='install-qr-heading'>
        <QrCode value={siteUrl} label={`QR code that opens ${brand}`} />
        <CardBody>
          <h2 id='install-qr-heading'>Open it on your phone</h2>
          <p>Scan the code with your phone camera, or send yourself the link.</p>
          <Url ref={ref} tabIndex={0}>{siteUrl}</Url>
          <Actions>
            <Button type='button' $variant='secondary' onClick={copy}>Copy link</Button>
            <span role='status'>{message}</span>
          </Actions>
        </CardBody>
      </Card>

      <Steps>
        <StepCard>
          <h2>Android (Chrome)</h2>
          <ol>
            <li>Tap <strong>Install app</strong> on this page when it shows up, or open the Chrome menu (three dots).</li>
            <li>Choose <strong>Install app</strong>.</li>
            <li>Confirm. {brand} opens like any other app.</li>
          </ol>
        </StepCard>
        <StepCard>
          <h2>iPhone and iPad (Safari)</h2>
          <ol>
            <li>Open this page in Safari.</li>
            <li>Tap <strong>Share</strong>.</li>
            <li>Choose <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.</li>
          </ol>
        </StepCard>
        <StepCard>
          <h2>Desktop (Chrome or Edge)</h2>
          <ol>
            <li>Look for the install icon at the right end of the address bar.</li>
            <li>Click it, then choose <strong>Install</strong>.</li>
            <li>Or use the <strong>Install app</strong> button when it shows up.</li>
          </ol>
        </StepCard>
      </Steps>

      {apkUrl && (
        <Card aria-labelledby='install-apk-heading'>
          <CardBody>
            <h2 id='install-apk-heading'>Android app (APK)</h2>
            <p>Prefer a standalone Android app? Download the APK and open it on your phone.</p>
            <Note>Android may ask you to allow installs from this source the first time.</Note>
            <Actions>
              <ButtonAnchor href={apkUrl} download rel='noopener'><InstallIcon />Download Android app</ButtonAnchor>
            </Actions>
          </CardBody>
        </Card>
      )}
    </Page>
  )
}
