import React from 'react'
import { screen } from '@testing-library/react'

import Footer from 'components/common/Footer/Footer'
import { DEBUG_SESSION_KEY } from 'core/Utils/debugMode'
import renderWithProviders from '../../utils/renderWithProviders'

const renderFooter = (route = '/') => renderWithProviders(<Footer brandName='Marea' version='0.1.0' />, { route, withAudio: false })

beforeEach(() => window.sessionStorage.clear())

describe('Footer', () => {
  it('always links to the install page', () => {
    renderFooter()
    expect(screen.getByRole('link', { name: 'Instalar' })).toHaveAttribute('href', '/install')
  })

  it('hides the diagnostics link by default', () => {
    renderFooter()
    expect(screen.queryByRole('link', { name: 'Diagnóstico' })).not.toBeInTheDocument()
  })

  it('shows the diagnostics link once debug mode is on in the session', () => {
    window.sessionStorage.setItem(DEBUG_SESSION_KEY, '1')
    renderFooter()
    expect(screen.getByRole('link', { name: 'Diagnóstico' })).toHaveAttribute('href', '/debug')
  })

  it('shows the diagnostics link for ?debug=1 and hides it again for ?debug=0', () => {
    const { unmount } = renderFooter('/?debug=1')
    expect(screen.getByRole('link', { name: 'Diagnóstico' })).toBeInTheDocument()
    unmount()
    renderFooter('/?debug=0')
    expect(screen.queryByRole('link', { name: 'Diagnóstico' })).not.toBeInTheDocument()
  })
})
