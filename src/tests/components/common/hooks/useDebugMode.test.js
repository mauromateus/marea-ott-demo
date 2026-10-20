import React from 'react'
import PropTypes from 'prop-types'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Link } from 'react-router-dom'

import useDebugMode from 'components/common/hooks/useDebugMode'
import { DEBUG_SESSION_KEY } from 'core/Utils/debugMode'

Probe.propTypes = { children: PropTypes.node }
function Probe ({ children }) {
  return <p>{useDebugMode() ? 'on' : 'off'}{children}</p>
}

const renderAt = (route) => render(
  <MemoryRouter initialEntries={[route]}>
    <Probe><Link to='/elsewhere'>go</Link></Probe>
  </MemoryRouter>
)

beforeEach(() => window.sessionStorage.clear())

describe('useDebugMode', () => {
  it('is off by default', () => {
    renderAt('/')
    expect(screen.getByText(/^off/)).toBeInTheDocument()
  })

  it('?debug=1 turns it on, in the first render, and stores it', () => {
    renderAt('/?debug=1')
    expect(screen.getByText(/^on/)).toBeInTheDocument()
    expect(window.sessionStorage.getItem(DEBUG_SESSION_KEY)).toBe('1')
  })

  it('stays on after navigating to a route without the param', () => {
    renderAt('/?debug=1')
    fireEvent.click(screen.getByRole('link', { name: 'go' }))
    expect(screen.getByText(/^on/)).toBeInTheDocument()
  })

  it('?debug=0 turns it off', () => {
    window.sessionStorage.setItem(DEBUG_SESSION_KEY, '1')
    renderAt('/?debug=0')
    expect(screen.getByText(/^off/)).toBeInTheDocument()
    expect(window.sessionStorage.getItem(DEBUG_SESSION_KEY)).toBeNull()
  })

  it('reads a value stored earlier in the session', () => {
    window.sessionStorage.setItem(DEBUG_SESSION_KEY, '1')
    renderAt('/')
    expect(screen.getByText(/^on/)).toBeInTheDocument()
  })
})
