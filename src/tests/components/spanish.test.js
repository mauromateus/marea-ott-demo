import React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import { createStore } from 'jotai'

import Footer from 'components/common/Footer/Footer'
import Header from 'components/common/Header/Header'
import LiveBadge from 'components/common/LiveBadge/LiveBadge'
import ExampleNote from 'components/common/ExampleNote/ExampleNote'
import LiveCard from 'components/content/LiveCard/LiveCard'
import MiniPlayer from 'components/content/MiniPlayer/MiniPlayer'
import Rail from 'components/content/Rail/Rail'
import ViewHome from 'components/views/ViewHome'
import ViewRadio from 'components/views/ViewRadio'
import ViewTv from 'components/views/ViewTv'
import ViewDebug from 'components/views/ViewDebug'
import { audioStatusAtom } from 'components/context/PlayerContext/atoms/playerAtoms'
import { getRouteTitle } from 'components/context/GoogleTagManager/config/routeTitles'
import loadPlayerWithAdapter from 'core/services/Player'
import renderWithProviders, { config } from '../utils/renderWithProviders'

jest.mock('core/services/Player')

const ENGLISH = /\b(Watch|Listen|Install|Refresh|Home|Radio live|Example content|Loading|Pause|Play|Connecting|New version|Open radio|Live now|Debug)\b/

beforeEach(() => {
  // The player never loads: CRA resets mock implementations before every test.
  loadPlayerWithAdapter.mockImplementation(() => new Promise(() => {}))
  window.matchMedia = () => ({ matches: false, addListener () {}, removeListener () {} })
})

describe('key components render Spanish', () => {
  it('LiveBadge says EN VIVO', () => {
    renderWithProviders(<LiveBadge />, { withAudio: false })
    expect(screen.getByText('EN VIVO')).toBeInTheDocument()
  })

  it('Header nav and brand label', () => {
    renderWithProviders(<Header brandName='Marea' />, { withAudio: false })
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir al inicio de Marea' })).toBeInTheDocument()
  })

  it('Footer', () => {
    renderWithProviders(<Footer brandName='Marea' version='0.1.0' />, { route: '/?debug=1', withAudio: false })
    expect(screen.getByText('Demostración de Marea · v0.1.0')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Pie de página' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Diagnóstico' })).toBeInTheDocument()
  })

  it('ExampleNote', () => {
    renderWithProviders(<ExampleNote />, { withAudio: false })
    expect(screen.getByText(/^Contenido de ejemplo:/)).toBeInTheDocument()
  })

  it('LiveCard video and audio', () => {
    const { unmount } = renderWithProviders(<LiveCard kind='video' title='Marea TV' to='/tv' />)
    expect(screen.getByRole('link', { name: /ver en vivo/i })).toBeInTheDocument()
    unmount()
    renderWithProviders(<LiveCard kind='audio' title='Marea Radio' to='/radio' />)
    expect(screen.getByRole('button', { name: 'Escuchar Marea Radio en vivo' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Abrir radio' })).toBeInTheDocument()
  })

  it('Rail card click explains that videos cannot be played yet', () => {
    renderWithProviders(<Rail rail={config.rails[0]} />, { withAudio: false })
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(screen.getByRole('status')).toHaveTextContent(`${config.rails[0].items[0].title}: en esta demostración todavía no se pueden reproducir los videos a pedido.`)
  })

  it('MiniPlayer labels and buttons', () => {
    const store = createStore()
    store.set(audioStatusAtom, 'paused')
    renderWithProviders(<MiniPlayer />, { store })
    expect(screen.getByLabelText('Minirreproductor de Marea Radio')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reproducir Marea Radio' })).toHaveTextContent('Reproducir')
    expect(screen.getByText('EN VIVO')).toBeInTheDocument()
  })

  it('ViewRadio status text', () => {
    renderWithProviders(<ViewRadio />, { route: '/radio' })
    expect(screen.getByText('Pulsa reproducir para sintonizar.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reproducir Marea Radio' })).toBeInTheDocument()
  })

  it('ViewTv shows the Spanish loading overlay', () => {
    renderWithProviders(<ViewTv />, { route: '/tv' })
    expect(screen.getByText('Cargando la señal en vivo...')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Marea TV' })).toBeInTheDocument()
  })

  it('ViewDebug labels', () => {
    renderWithProviders(<ViewDebug />, { route: '/debug' })
    expect(screen.getByRole('heading', { level: 1, name: 'Diagnóstico' })).toBeInTheDocument()
    ;['Plataforma resuelta', 'appName de analítica', 'Modo de pantalla (display-mode)', 'document.referrer', 'userAgent', 'En línea'].forEach((label) => {
      // 'Plataforma resuelta' also appears in the install state panel.
      expect(screen.getAllByText(label)[0]).toBeInTheDocument()
    })
  })

  it('the home page has no leftover English UI words', () => {
    const { container } = renderWithProviders(<ViewHome />)
    expect(screen.getByRole('region', { name: 'En vivo ahora' })).toBeInTheDocument()
    expect(container.textContent).not.toMatch(ENGLISH)
  })
})

describe('config content is Spanish', () => {
  it('uses a Spanish language, tagline, player descriptions and rail meta', () => {
    expect(config.app.language).toBe('es')
    expect(config.brand.tagline).toBe('TV y radio en vivo, directo desde la costa.')
    expect(config.players.video.description).toMatch(/costa/)
    expect(config.players.audio.description).toMatch(/mar/)
    const meta = config.rails.flatMap((rail) => rail.items.map((item) => item.meta))
    expect(meta.join(' ')).not.toMatch(/\b(Documentary|Series|episodes|Food|Family|Sports|Thriller|Kids|Travel|Mystery|Crime|Music|Ambient|Live music|Acoustic|Electronic|Sci-fi)\b/)
  })
})

describe('analytics page titles are Spanish, event names stay English', () => {
  it('maps routes to Spanish titles and keeps brand names', () => {
    expect(getRouteTitle('/')).toBe('Inicio')
    expect(getRouteTitle('/tv')).toBe('Marea TV')
    expect(getRouteTitle('/radio')).toBe('Marea Radio')
    expect(getRouteTitle('/debug')).toBe('Diagnóstico')
    expect(getRouteTitle('/install')).toBe('Instalar')
    expect(getRouteTitle('/nope')).toBe('not-set')
  })
})
