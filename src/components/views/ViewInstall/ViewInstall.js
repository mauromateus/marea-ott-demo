import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { Helmet } from 'react-helmet'

import { Button, ButtonAnchor } from 'components/common/Button/Button.styles'
import InstallButton from 'components/common/InstallButton/InstallButton'
import useCanShowInstall from 'components/common/InstallButton/hooks/useCanShowInstall'
import Tabs from 'components/common/Tabs/Tabs'
import Accordion from 'components/common/Accordion/Accordion'
import useCopyText from 'components/common/hooks/useCopyText'
import { InstallIcon } from 'components/common/Icons/Icons'
import { useAppContext } from 'components/context/AppContext/AppContext'
import { translate } from 'core/Translation'
import { readInstallContext } from 'core/Utils/detectInstallContext'
import getSiteUrl from 'core/Utils/getSiteUrl'
import QrCode from './QrCode'
import usePhoneLayout from './hooks/usePhoneLayout'
import getApkUrl from './utils/getApkUrl'
import getInstallPlatform from './utils/getInstallPlatform'

const Page = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  max-width: 880px;
  margin: 0 auto;
  width: 100%;

  > * { max-width: 100%; }
`

const Intro = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;

  h1 { font-size: clamp(2rem, 7vw, 2.8rem); }
`

const Lead = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 1.1rem;
`

const Status = styled.p`
  margin-top: 6px;
  padding: 6px 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.surface};
  font-size: 0.95rem;
  font-weight: 500;

  &[data-installed='true'] { border-color: ${({ theme }) => theme.colors.accent}; color: ${({ theme }) => theme.colors.accent}; }
`

const Section = styled.div`
  width: 100%;
`

const Card = styled.section`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
  width: 100%;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
`

const CardBody = styled.div`
  flex: 1 1 240px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;

  h2 { font-size: 1.15rem; }
`

const Url = styled.code`
  display: block;
  max-width: 100%;
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

const Steps = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  counter-reset: step;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    counter-increment: step;
  }

  li::before {
    content: counter(step);
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.accent};
    color: #04211e;
    font-size: 0.9rem;
    font-weight: 700;
  }
`

const Note = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.9rem;
`

// Literal keys on purpose: the dictionary test scans source for them.
const STEP_KEYS = {
  android: ['install.steps.android.1', 'install.steps.android.2', 'install.steps.android.3'],
  iphone: ['install.steps.iphone.1', 'install.steps.iphone.2', 'install.steps.iphone.3'],
  desktop: ['install.steps.desktop.1', 'install.steps.desktop.2', 'install.steps.desktop.3']
}

const LABEL_KEYS = {
  android: 'install.tabs.android',
  iphone: 'install.tabs.iphone',
  desktop: 'install.tabs.desktop'
}

const PLATFORM_ORDER = ['android', 'iphone', 'desktop']

const StepList = ({ platform, name }) => (
  <Steps>
    {STEP_KEYS[platform].map((key) => <li key={key}>{translate(key, { name })}</li>)}
  </Steps>
)

export default function ViewInstall () {
  const { config, platform } = useAppContext()
  const name = config.brand.name
  const siteUrl = useMemo(() => getSiteUrl(), [])
  const apkUrl = getApkUrl(config)
  const [context] = useState(readInstallContext)
  const isPhone = usePhoneLayout()
  const { canShow: canInstall } = useCanShowInstall()
  const { ref, copy, message } = useCopyText(siteUrl, 'link')

  const installed = platform === 'android' || platform === 'pwa-web' || context.isStandalone
  const detected = getInstallPlatform(context)

  // Phone: the button when the browser offers it, otherwise the steps for this device only. Nothing to do once installed.
  const phoneSteps = isPhone && !canInstall && !installed
  const wide = !isPhone

  return (
    <Page>
      <Helmet><title>{translate('install.pageTitle')}</title></Helmet>

      <Intro>
        <h1>{translate('install.title', { name })}</h1>
        <Lead>{translate('install.lead')}</Lead>
        <Status role='status' aria-label={translate('install.status.label')} data-installed={installed}>
          {translate(installed ? 'install.status.installed' : 'install.status.notInstalled')}
        </Status>
      </Intro>

      <InstallButton large />

      {phoneSteps && (
        <Section>
          <Accordion
            idPrefix='install-steps'
            defaultOpen={detected}
            items={[{ id: detected, title: translate(LABEL_KEYS[detected]), content: <StepList platform={detected} name={name} /> }]}
          />
        </Section>
      )}

      {wide && (
        <Card aria-labelledby='install-qr-heading'>
          <QrCode value={siteUrl} label={translate('install.qr.label', { name })} />
          <CardBody>
            <h2 id='install-qr-heading'>{translate('install.qr.heading')}</h2>
            <p>{translate('install.qr.hint')}</p>
            <Url ref={ref} tabIndex={0}>{siteUrl}</Url>
            <Actions>
              <Button type='button' $variant='secondary' onClick={copy}>{translate('install.qr.copy')}</Button>
              <span role='status'>{message}</span>
            </Actions>
          </CardBody>
        </Card>
      )}

      {wide && (
        <Section>
          <Tabs
            idPrefix='install-tabs'
            label={translate('install.tabs.label')}
            defaultTab={detected}
            tabs={PLATFORM_ORDER.map((id) => ({ id, label: translate(LABEL_KEYS[id]), content: <StepList platform={id} name={name} /> }))}
          />
        </Section>
      )}

      {apkUrl && (
        <Card aria-labelledby='install-apk-heading'>
          <CardBody>
            <h2 id='install-apk-heading'>{translate('install.apk.heading')}</h2>
            <p>{translate('install.apk.hint')}</p>
            <Note>{translate('install.apk.note')}</Note>
            <Actions>
              <ButtonAnchor href={apkUrl} download rel='noopener'><InstallIcon />{translate('install.apk.download')}</ButtonAnchor>
            </Actions>
          </CardBody>
        </Card>
      )}
    </Page>
  )
}
