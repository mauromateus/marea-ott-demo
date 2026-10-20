import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Link, NavLink } from 'react-router-dom'

import Logo from 'components/common/Logo/Logo'
import InstallButton from 'components/common/InstallButton/InstallButton'
import { translate } from 'core/Translation'

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  background: ${({ theme }) => theme.colors.background}ee;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: env(safe-area-inset-top);
`

const Inner = styled.div`
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  min-height: ${({ theme }) => theme.layout.headerHeight};
  padding: 0 ${({ theme }) => theme.layout.gutter};
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0 16px;
`

// Phones: the button stays in the first row next to the logo and the nav drops to its own row,
// instead of the button wrapping into a row of its own that is easy to miss.
const Install = styled(InstallButton)`
  flex: none;

  @media (max-width: 599px) { order: 2; margin-left: auto; }
`

const Brand = styled(Link)`
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 4px;
`

const Nav = styled.nav`
  display: flex;
  gap: 4px;
  margin-left: auto;

  @media (max-width: 599px) { order: 3; }
`

const NavItem = styled(NavLink)`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 14px;
  border-radius: ${({ theme }) => theme.radii.pill};
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 500;
  transition: color 0.2s ease, background 0.2s ease;

  &:hover { color: ${({ theme }) => theme.colors.text}; background: rgba(255, 255, 255, 0.06); }
  &.active { color: ${({ theme }) => theme.colors.accent}; background: rgba(46, 196, 182, 0.12); }

  @media (max-width: 599px) { padding: 0 12px; }
`

Header.propTypes = {
  brandName: PropTypes.string.isRequired
}

export default function Header ({ brandName }) {
  return (
    <Bar>
      <Inner>
        <Brand to='/' aria-label={translate('common.brand.home', { name: brandName })}><Logo name={brandName} /></Brand>
        <Nav aria-label={translate('common.nav.label')}>
          <NavItem to='/' exact>{translate('common.nav.home')}</NavItem>
          <NavItem to='/tv'>{translate('common.nav.tv')}</NavItem>
          <NavItem to='/radio'>{translate('common.nav.radio')}</NavItem>
        </Nav>
        <Install compact />
      </Inner>
    </Bar>
  )
}
