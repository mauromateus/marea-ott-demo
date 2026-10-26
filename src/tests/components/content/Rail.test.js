import React from 'react'
import { screen, fireEvent } from '@testing-library/react'

import Rail from 'components/content/Rail/Rail'
import renderWithProviders from '../../utils/renderWithProviders'

const vodRail = {
  id: 'new',
  title: 'Novedades en Marea',
  items: [
    { id: 'm1', title: 'Documental: Naturaleza Salvaje', meta: '1 min 13 s', thumbnail: { url: 'https://thumbs.cdn.mdstrm.com/thumbs/acc/a.jpg', width: 640, height: 360 } },
    { id: 'm2', title: 'Journey Of Life', meta: '2 min 34 s', thumbnail: { url: 'https://thumbs.cdn.mdstrm.com/thumbs/acc/b.jpg', width: 1280, height: 720 } }
  ]
}

const sampleRail = {
  id: 'sample',
  title: 'Ejemplos',
  items: [{ id: 's1', title: 'Línea de sal', meta: 'Documental · 48 min', sample: true, artwork: { from: '#134E5E', to: '#2EC4B6', angle: 120, glyph: 'waves' } }]
}

describe('Rail with real VOD medias', () => {
  it('shows the real thumbnail, title and duration of every card', () => {
    const { container } = renderWithProviders(<Rail rail={vodRail} />, { withAudio: false })
    const images = container.querySelectorAll('img')
    expect(images).toHaveLength(2)
    expect(images[0]).toHaveAttribute('src', 'https://thumbs.cdn.mdstrm.com/thumbs/acc/a.jpg')
    expect(images[0]).toHaveAttribute('loading', 'lazy')
    expect(screen.getByText('Documental: Naturaleza Salvaje')).toBeInTheDocument()
    expect(screen.getByText('2 min 34 s')).toBeInTheDocument()
  })

  it('keeps thumbnails decorative: the title already names the card', () => {
    const { container } = renderWithProviders(<Rail rail={vodRail} />, { withAudio: false })
    container.querySelectorAll('img').forEach((img) => expect(img).toHaveAttribute('alt', ''))
  })

  it('links every real card to its viewing page', () => {
    renderWithProviders(<Rail rail={vodRail} />, { withAudio: false })
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', '/ver/m1')
    expect(links[1]).toHaveAttribute('href', '/ver/m2')
    expect(links[0]).toHaveTextContent('Documental: Naturaleza Salvaje')
  })
})

describe('Rail with sample artwork', () => {
  it('still renders gradient artwork and the example notice', () => {
    const { container } = renderWithProviders(<Rail rail={sampleRail} />, { withAudio: false })
    expect(container.querySelectorAll('img')).toHaveLength(0)
    expect(screen.queryAllByRole('link')).toHaveLength(0)
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(screen.getByRole('status')).toHaveTextContent('Línea de sal es contenido de ejemplo')
  })
})
