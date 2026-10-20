import styled, { css } from 'styled-components'
import { Link } from 'react-router-dom'

const buttonBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 22px;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: 600;
  font-size: 1rem;
  line-height: 1;
  text-align: center;
  transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease;

  svg { font-size: 1.25em; }

  ${({ $variant, theme }) => ($variant === 'secondary'
    ? css`
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.22);
        color: ${theme.colors.text};
        &:hover { background: rgba(255, 255, 255, 0.16); }
      `
    : css`
        background: ${theme.colors.accent};
        color: #04211e;
        &:hover { box-shadow: ${theme.shadows.glow}; }
      `)}

  &:active { transform: scale(0.97); }
  &[disabled] { opacity: 0.6; cursor: default; }
`

export const Button = styled.button`${buttonBase}`
export const ButtonLink = styled(Link)`${buttonBase}`
