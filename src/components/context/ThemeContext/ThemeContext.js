import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { ThemeProvider, createGlobalStyle } from 'styled-components'
import buildTheme from './utils/buildTheme'

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }

  html { -webkit-text-size-adjust: 100%; }

  body {
    margin: 0;
    min-width: 320px;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 16px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3 { font-family: ${({ theme }) => theme.fonts.heading}; margin: 0; line-height: 1.15; }
  p { margin: 0; }
  a { color: inherit; text-decoration: none; }
  button { font: inherit; color: inherit; cursor: pointer; }
  img, svg { display: block; max-width: 100%; }

  /* Visible focus on every interactive element (keyboard and TV remote). */
  a:focus-visible,
  button:focus-visible,
  [role="button"]:focus-visible,
  [tabindex]:focus-visible,
  summary:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadows.focus};
    border-radius: ${({ theme }) => theme.radii.sm};
  }

  *:focus:not(:focus-visible) { outline: none; }

  ::selection { background: ${({ theme }) => theme.colors.accent}; color: ${({ theme }) => theme.colors.background}; }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
  }
`

ThemeContextProvider.propTypes = {
  brand: PropTypes.object.isRequired,
  children: PropTypes.node
}

export default function ThemeContextProvider ({ brand, children }) {
  const theme = useMemo(() => buildTheme(brand), [brand])

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  )
}
