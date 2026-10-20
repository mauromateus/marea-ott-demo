import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const List = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.surface};
`

const Tab = styled.button`
  min-height: 44px;
  padding: 0 18px;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: 600;

  &:hover { color: ${({ theme }) => theme.colors.text}; }
  &[aria-selected='true'] { background: ${({ theme }) => theme.colors.accent}; color: #04211e; }
`

const Panel = styled.div`
  margin-top: 16px;
  padding: 18px 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
`

Tabs.propTypes = {
  idPrefix: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  tabs: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    content: PropTypes.node
  })).isRequired,
  defaultTab: PropTypes.string
}

// Automatic activation: arrow keys move focus and selection together (WAI-ARIA tabs pattern).
export default function Tabs ({ idPrefix, label, tabs, defaultTab }) {
  const [selected, setSelected] = useState(() => (tabs.some((tab) => tab.id === defaultTab) ? defaultTab : tabs[0].id))
  const refs = useRef({})
  const active = tabs.find((tab) => tab.id === selected) || tabs[0]

  const select = (id) => {
    setSelected(id)
    refs.current[id]?.focus()
  }

  const onKeyDown = (event, index) => {
    const last = tabs.length - 1
    const target = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowDown: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last
    }[event.key]

    if (target !== undefined) {
      event.preventDefault()
      select(tabs[target].id)
    }
  }

  return (
    <div>
      <List role='tablist' aria-label={label}>
        {tabs.map((tab, index) => (
          <Tab
            key={tab.id}
            ref={(node) => { refs.current[tab.id] = node }}
            type='button'
            role='tab'
            id={`${idPrefix}-tab-${tab.id}`}
            aria-selected={tab.id === active.id}
            aria-controls={`${idPrefix}-panel-${tab.id}`}
            tabIndex={tab.id === active.id ? 0 : -1}
            onClick={() => select(tab.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {tab.label}
          </Tab>
        ))}
      </List>
      <Panel role='tabpanel' id={`${idPrefix}-panel-${active.id}`} aria-labelledby={`${idPrefix}-tab-${active.id}`} tabIndex={0}>
        {active.content}
      </Panel>
    </div>
  )
}
