import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import DebugGate from 'components/common/DebugGate/DebugGate'
import { DEBUG_SESSION_KEY } from 'core/Utils/debugMode'

const renderAt = (route) => render(
  <MemoryRouter initialEntries={[route]}>
    <Switch>
      <Route exact path='/'><p>home page</p></Route>
      <Route path='/debug'><DebugGate><p>secret diagnostics</p></DebugGate></Route>
    </Switch>
  </MemoryRouter>
)

beforeEach(() => window.sessionStorage.clear())

describe('DebugGate', () => {
  it('redirects to the home page when debug mode is off', () => {
    renderAt('/debug')
    expect(screen.getByText('home page')).toBeInTheDocument()
    expect(screen.queryByText('secret diagnostics')).not.toBeInTheDocument()
  })

  it('renders its children when debug mode is on in the session', () => {
    window.sessionStorage.setItem(DEBUG_SESSION_KEY, '1')
    renderAt('/debug')
    expect(screen.getByText('secret diagnostics')).toBeInTheDocument()
  })

  it('renders its children for a first visit with ?debug=1', () => {
    renderAt('/debug?debug=1')
    expect(screen.getByText('secret diagnostics')).toBeInTheDocument()
  })

  it('?debug=0 on the route closes it', () => {
    window.sessionStorage.setItem(DEBUG_SESSION_KEY, '1')
    renderAt('/debug?debug=0')
    expect(screen.getByText('home page')).toBeInTheDocument()
  })
})
