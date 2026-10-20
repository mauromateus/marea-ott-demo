import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'

import UpdateToast from 'components/common/UpdateToast/UpdateToast'
import ServiceWorkerService from 'core/services/ServiceWorkerService'
import buildTheme from 'components/context/ThemeContext/utils/buildTheme'
import marea from '../../../../public/config/marea.json'

const renderToast = () => render(<ThemeProvider theme={buildTheme(marea.brand)}><UpdateToast /></ThemeProvider>)

afterEach(() => {
  ServiceWorkerService.registration = null
  jest.restoreAllMocks()
})

describe('UpdateToast', () => {
  it('renders nothing without a waiting worker', () => {
    renderToast()
    expect(screen.queryByText(/new version available/i)).not.toBeInTheDocument()
  })

  it('appears when a worker is waiting and applies the update on click', () => {
    renderToast()
    const apply = jest.spyOn(ServiceWorkerService, 'applyUpdate').mockImplementation(() => {})

    act(() => ServiceWorkerService.setRegistration({ waiting: { postMessage: jest.fn() } }))

    expect(screen.getByText(/new version available/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /refresh/i }))
    expect(apply).toHaveBeenCalledTimes(1)
  })
})
