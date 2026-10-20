import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Item = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};

  & + & { margin-top: 10px; }
`

const Heading = styled.h3`
  font-size: 1rem;
`

const Trigger = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: 52px;
  padding: 0 18px;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.md};
  background: transparent;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.05rem;
  font-weight: 600;
  text-align: left;

  svg { flex: none; color: ${({ theme }) => theme.colors.accent}; transition: transform 0.2s ease; }
  &[aria-expanded='true'] svg { transform: rotate(180deg); }

  @media (prefers-reduced-motion: reduce) { svg { transition: none; } }
`

const Region = styled.div`
  padding: 0 18px 18px;
`

const Chevron = () => (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true' focusable='false'>
    <path d='m6 9 6 6 6-6' />
  </svg>
)

Accordion.propTypes = {
  idPrefix: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.node
  })).isRequired,
  defaultOpen: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)])
}

export default function Accordion ({ idPrefix, items, defaultOpen = [] }) {
  const [open, setOpen] = useState(() => new Set([].concat(defaultOpen)))

  const toggle = (id) => setOpen((current) => {
    const next = new Set(current)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  return (
    <div>
      {items.map((item) => {
        const expanded = open.has(item.id)
        return (
          <Item key={item.id}>
            <Heading>
              <Trigger
                type='button'
                id={`${idPrefix}-button-${item.id}`}
                aria-expanded={expanded}
                aria-controls={`${idPrefix}-region-${item.id}`}
                onClick={() => toggle(item.id)}
              >
                {item.title}
                <Chevron />
              </Trigger>
            </Heading>
            <Region role='region' id={`${idPrefix}-region-${item.id}`} aria-labelledby={`${idPrefix}-button-${item.id}`} hidden={!expanded}>
              {item.content}
            </Region>
          </Item>
        )
      })}
    </div>
  )
}
