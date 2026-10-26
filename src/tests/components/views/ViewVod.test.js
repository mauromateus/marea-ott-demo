import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import { Route, Switch } from 'react-router-dom'

import renderWithProviders, { config } from '../../utils/renderWithProviders'
import ViewVod from 'components/views/ViewVod'
import loadPlayerWithAdapter from 'core/services/Player'

jest.mock('core/services/Player')

const item = config.rails[0].items[0]

const renderAt = (route) => renderWithProviders(
  <Switch>
    <Route path='/ver/:id' component={ViewVod} />
    <Route path='/'><p>inicio</p></Route>
  </Switch>,
  { route, withAudio: false }
)

beforeEach(() => {
  loadPlayerWithAdapter.mockImplementation(() => Promise.resolve({ strategy: { destroy: jest.fn() }, player: { pause: jest.fn() } }))
})

afterEach(() => jest.clearAllMocks())

describe('ViewVod', () => {
  it('plays the media of the route as on-demand', async () => {
    renderAt(`/ver/${item.id}`)
    await waitFor(() => expect(loadPlayerWithAdapter).toHaveBeenCalled())
    expect(loadPlayerWithAdapter.mock.calls[0][1]).toMatchObject({ id: item.id, type: 'media', autoplay: true })
  })

  it('shows the title and duration of the media', async () => {
    renderAt(`/ver/${item.id}`)
    expect(await screen.findByRole('heading', { level: 1, name: item.title })).toBeInTheDocument()
    expect(screen.getByText(item.meta)).toBeInTheDocument()
  })

  it('offers a way back to the home', async () => {
    renderAt(`/ver/${item.id}`)
    const back = await screen.findByRole('link', { name: 'Volver al inicio' })
    expect(back).toHaveAttribute('href', '/')
  })

  it('goes back to the home when the media is not in the config', async () => {
    renderAt('/ver/000000000000000000000000')
    expect(await screen.findByText('inicio')).toBeInTheDocument()
    expect(loadPlayerWithAdapter).not.toHaveBeenCalled()
  })

  it('finds medias of any rail', async () => {
    const last = config.rails[config.rails.length - 1].items[0]
    renderAt(`/ver/${last.id}`)
    await waitFor(() => expect(loadPlayerWithAdapter).toHaveBeenCalled())
    expect(loadPlayerWithAdapter.mock.calls[0][1].id).toBe(last.id)
  })
})
