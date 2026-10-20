import React from 'react'
import styled from 'styled-components'

import { translate } from 'core/Translation'

const Note = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.textMuted};
    flex: none;
  }
`

export default function ExampleNote () {
  return <Note>{translate('common.exampleNote')}</Note>
}
