import React from 'react'
import { screen, fireEvent } from '@testing-library/react'

import Tabs from 'components/common/Tabs/Tabs'
import renderWithProviders from '../../utils/renderWithProviders'

const tabs = [
  { id: 'a', label: 'Android', content: <p>Pasos Android</p> },
  { id: 'b', label: 'iPhone', content: <p>Pasos iPhone</p> },
  { id: 'c', label: 'Computador', content: <p>Pasos Computador</p> }
]

const renderTabs = (props = {}) => renderWithProviders(<Tabs idPrefix='t' label='Cómo instalar' tabs={tabs} defaultTab='a' {...props} />, { withAudio: false })

describe('Tabs', () => {
  it('renders a labelled tablist with the default tab selected and only its panel shown', () => {
    renderTabs({ defaultTab: 'b' })
    expect(screen.getByRole('tablist', { name: 'Cómo instalar' })).toBeInTheDocument()
    const selected = screen.getByRole('tab', { name: 'iPhone' })
    expect(selected).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Android' })).toHaveAttribute('aria-selected', 'false')
    const panel = screen.getByRole('tabpanel')
    expect(panel).toHaveTextContent('Pasos iPhone')
    expect(panel).toHaveAttribute('aria-labelledby', selected.id)
    expect(selected).toHaveAttribute('aria-controls', panel.id)
    expect(screen.queryByText('Pasos Android')).not.toBeInTheDocument()
  })

  it('falls back to the first tab for an unknown default', () => {
    renderTabs({ defaultTab: 'zzz' })
    expect(screen.getByRole('tab', { name: 'Android' })).toHaveAttribute('aria-selected', 'true')
  })

  it('switches on click and keeps only the selected tab in the tab order', () => {
    renderTabs()
    fireEvent.click(screen.getByRole('tab', { name: 'Computador' }))
    expect(screen.getByRole('tab', { name: 'Computador' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Pasos Computador')
    expect(screen.getByRole('tab', { name: 'Computador' })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('tab', { name: 'Android' })).toHaveAttribute('tabindex', '-1')
  })

  it('moves with the arrow keys, wrapping around, and moves focus with the selection', () => {
    renderTabs()
    const android = screen.getByRole('tab', { name: 'Android' })
    android.focus()
    fireEvent.keyDown(android, { key: 'ArrowRight' })
    expect(screen.getByRole('tab', { name: 'iPhone' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'iPhone' })).toHaveFocus()
    fireEvent.keyDown(screen.getByRole('tab', { name: 'iPhone' }), { key: 'ArrowLeft' })
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Android' }), { key: 'ArrowLeft' })
    expect(screen.getByRole('tab', { name: 'Computador' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Computador' }), { key: 'ArrowRight' })
    expect(screen.getByRole('tab', { name: 'Android' })).toHaveAttribute('aria-selected', 'true')
  })

  it('supports Home and End', () => {
    renderTabs()
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Android' }), { key: 'End' })
    expect(screen.getByRole('tab', { name: 'Computador' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Computador' }), { key: 'Home' })
    expect(screen.getByRole('tab', { name: 'Android' })).toHaveAttribute('aria-selected', 'true')
  })
})
