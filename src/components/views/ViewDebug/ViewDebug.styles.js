import styled from 'styled-components'

export const Grid = styled.dl`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
  margin: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 240px minmax(0, 1fr);
  }
`

export const Term = styled.dt`
  padding: 12px 16px 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.85rem;
  background: ${({ theme }) => theme.colors.surface};

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 12px 16px;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    &:first-of-type { border-top: 0; }
  }
`

export const Value = styled.dd`
  margin: 0;
  padding: 2px 16px 12px;
  background: ${({ theme }) => theme.colors.surface};
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9rem;
  overflow-wrap: anywhere;

  strong { color: ${({ theme }) => theme.colors.accent}; }

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 12px 16px;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    &:nth-of-type(1) { border-top: 0; }
  }
`

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
`
