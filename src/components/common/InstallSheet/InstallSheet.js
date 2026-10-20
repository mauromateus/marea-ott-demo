import React from 'react'
import styled, { css, keyframes } from 'styled-components'

import { Button } from 'components/common/Button/Button.styles'
import { ArrowDownIcon, CloseIcon, ShareIcon } from 'components/common/Icons/Icons'
import { withAlpha } from 'components/context/ThemeContext/utils/buildTheme'
import { useAppContext } from 'components/context/AppContext/AppContext'
import useMiniPlayerVisible from 'components/content/MiniPlayer/hooks/useMiniPlayerVisible'
import { MINI_PLAYER_CLEARANCE } from 'components/content/MiniPlayer/config/constants'
import { translate } from 'core/Translation'
import useInstallSheet from './hooks/useInstallSheet'

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: translateY(0); }
`

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 var(--sheet-pulse); }
  70% { box-shadow: 0 0 0 12px rgba(0, 0, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
`

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
`

const noMotion = css`
  @media (prefers-reduced-motion: reduce) { animation: none; }
`

// Above the mini player (z-index 30) when it is on screen, otherwise at the bottom edge.
const Wrap = styled.section`
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(${({ $aboveMiniPlayer }) => ($aboveMiniPlayer ? MINI_PLAYER_CLEARANCE : '12px')} + env(safe-area-inset-bottom));
  z-index: 35;
  padding: 0 ${({ theme }) => theme.layout.gutter};
  pointer-events: none;
`

const Card = styled.div`
  position: relative;
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 16px 14px;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  box-shadow: 0 18px 48px -12px rgba(0, 0, 0, 0.75), ${({ theme }) => theme.shadows.glow};
  pointer-events: auto;
  animation: ${slideUp} 0.35s ease-out both;
  ${noMotion}
`

const Head = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding-right: 36px;
`

const AppIcon = styled.img`
  width: 48px;
  height: 48px;
  flex: none;
  border-radius: 12px;
`

const Text = styled.div`
  min-width: 0;

  h2 { font-size: 1.25rem; }
  p { margin-top: 2px; color: ${({ theme }) => theme.colors.textMuted}; }
`

const Close = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 1.25rem;

  &:hover { background: rgba(255, 255, 255, 0.08); color: ${({ theme }) => theme.colors.text}; }
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

// Two pulses, then it stops: motion that never ends is a distraction, not a hint.
const Primary = styled(Button)`
  --sheet-pulse: ${({ theme }) => withAlpha(theme.colors.accent, 0.6)};
  flex: 1;
  min-height: 52px;
  font-size: 1.1rem;
  animation: ${pulse} 1.6s ease-out 0.6s 2;
  ${noMotion}
`

const Later = styled.button`
  min-height: 44px;
  padding: 0 14px;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 500;

  &:hover { color: ${({ theme }) => theme.colors.text}; }
`

const Steps = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  counter-reset: step;

  li {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
    counter-increment: step;
  }

  li::before {
    content: counter(step);
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.accent};
    color: #04211e;
    font-size: 0.85rem;
    font-weight: 700;
  }

  svg { font-size: 1.3em; color: ${({ theme }) => theme.colors.accent}; }
`

// Safari's share button is in the bottom toolbar on iPhone only.
const Arrow = styled.span`
  align-self: center;
  display: inline-flex;
  color: ${({ theme }) => theme.colors.accent};
  font-size: 1.6rem;
  animation: ${bounce} 1.1s ease-in-out 6;
  ${noMotion}
`

export default function InstallSheet () {
  const { config } = useAppContext()
  const aboveMiniPlayer = useMiniPlayerVisible()
  const { visible, variant, isIphone, dismiss, install } = useInstallSheet()

  if (!visible) {
    return null
  }

  const name = config?.brand?.name

  return (
    <Wrap $aboveMiniPlayer={aboveMiniPlayer}>
      <Card role='dialog' aria-modal='false' aria-label={translate('install.sheet.label', { name })} data-above-mini-player={aboveMiniPlayer}>
        <Head>
          <AppIcon src={`${process.env.PUBLIC_URL}/icons/icon-192.png`} alt='' width='48' height='48' />
          <Text>
            <h2>{translate('install.sheet.title', { name })}</h2>
            {variant === 'chromium' && <p>{translate('install.sheet.line', { name })}</p>}
          </Text>
        </Head>
        <Close type='button' aria-label={translate('install.sheet.close')} onClick={dismiss}><CloseIcon /></Close>

        {variant === 'ios'
          ? (
            <>
              <Steps data-testid='install-sheet-steps'>
                <li><span>{translate('install.sheet.iosStep1')}</span><ShareIcon /></li>
                <li><span>{translate('install.sheet.iosStep2')}</span></li>
              </Steps>
              <Actions>
                <Later type='button' onClick={dismiss}>{translate('install.sheet.later')}</Later>
              </Actions>
              {isIphone && <Arrow data-testid='install-sheet-arrow' aria-hidden='true'><ArrowDownIcon /></Arrow>}
            </>
            )
          : (
            <Actions>
              <Primary type='button' onClick={install}>{translate('install.sheet.action')}</Primary>
              <Later type='button' onClick={dismiss}>{translate('install.sheet.later')}</Later>
            </Actions>
            )}
      </Card>
    </Wrap>
  )
}
