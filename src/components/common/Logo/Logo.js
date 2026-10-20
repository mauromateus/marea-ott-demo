import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Wordmark = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: 700;
  font-size: 1.35rem;
  letter-spacing: 0.01em;

  svg { color: ${({ theme }) => theme.colors.accent}; }
`

Logo.propTypes = {
  name: PropTypes.string.isRequired
}

export default function Logo ({ name }) {
  return (
    <Wordmark>
      <svg width='30' height='30' viewBox='0 0 32 32' fill='none' stroke='currentColor' strokeWidth='3.4' strokeLinecap='round' aria-hidden='true'>
        <path d='M4 24 C 7 8, 13 8, 16 19 C 19 8, 25 8, 28 24' />
      </svg>
      {name}
    </Wordmark>
  )
}
