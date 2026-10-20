import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Link, NavLink } from 'react-router-dom'

import Logo from 'components/common/Logo/Logo'

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
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`

const Brand = styled(Link)`
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 4px;
`

const Nav = styled.nav`
  display: flex;
  gap: 4px;
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
`

Header.propTypes = {
  brandName: PropTypes.string.isRequired
}

export default function Header ({ brandName }) {
  return (
    <Bar>
      <Inner>
        <Brand to='/' aria-label={`${brandName} home`}><Logo name={brandName} /></Brand>
        <Nav aria-label='Main'>
          <NavItem to='/' exact>Home</NavItem>
          <NavItem to='/tv'>TV</NavItem>
          <NavItem to='/radio'>Radio</NavItem>
        </Nav>
      </Inner>
    </Bar>
  )
}
