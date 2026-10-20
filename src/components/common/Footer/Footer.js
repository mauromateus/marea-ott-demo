import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import useDebugMode from 'components/common/hooks/useDebugMode'
import { translate } from 'core/Translation'

const Bar = styled.footer`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.875rem;
`

const Inner = styled.div`
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  padding: 24px ${({ theme }) => theme.layout.gutter} calc(24px + env(safe-area-inset-bottom));
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const Links = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const FooterLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.pill};

  &:hover { color: ${({ theme }) => theme.colors.text}; }
`

Footer.propTypes = {
  brandName: PropTypes.string.isRequired,
  version: PropTypes.string
}

export default function Footer ({ brandName, version }) {
  const debugMode = useDebugMode()
  return (
    <Bar>
      <Inner>
        <span>{translate('common.footer.demo', { name: brandName })}{version ? ` · v${version}` : ''}</span>
        <Links aria-label={translate('common.footer.label')}>
          <FooterLink to='/install'>{translate('common.footer.install')}</FooterLink>
          {debugMode && <FooterLink to='/debug'>{translate('common.footer.debug')}</FooterLink>}
        </Links>
      </Inner>
    </Bar>
  )
}
