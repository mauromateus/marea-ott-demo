import React from 'react'
import { screen, fireEvent } from '@testing-library/react'

import Accordion from 'components/common/Accordion/Accordion'
import renderWithProviders from '../../utils/renderWithProviders'

const items = [
  { id: 'a', title: 'Android', content: <p>Pasos Android</p> },
  { id: 'b', title: 'iPhone', content: <p>Pasos iPhone</p> }
]

const renderAccordion = (props = {}) => renderWithProviders(<Accordion idPrefix='acc' items={items} {...props} />, { withAudio: false })

describe('Accordion', () => {
  it('opens the default item and wires the button to its region', () => {
    renderAccordion({ defaultOpen: 'b' })
    const open = screen.getByRole('button', { name: 'iPhone' })
    expect(open).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Android' })).toHaveAttribute('aria-expanded', 'false')
    const region = screen.getByRole('region', { name: 'iPhone' })
    expect(open).toHaveAttribute('aria-controls', region.id)
    expect(region).toHaveTextContent('Pasos iPhone')
    expect(screen.queryByText('Pasos Android')).not.toBeVisible()
  })

  it('toggles an item with the button', () => {
    renderAccordion()
    const button = screen.getByRole('button', { name: 'Android' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Pasos Android')).toBeVisible()
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })
})
