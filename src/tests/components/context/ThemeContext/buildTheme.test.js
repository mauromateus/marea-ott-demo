import buildTheme, { withAlpha } from 'components/context/ThemeContext/utils/buildTheme'
import marea from '../../../../../public/config/marea.json'

describe('withAlpha', () => {
  it('converts a hex color to rgba', () => {
    expect(withAlpha('#2EC4B6', 0.5)).toBe('rgba(46, 196, 182, 0.5)')
  })

  it('returns the input when it is not a 6 digit hex', () => {
    expect(withAlpha('red', 0.5)).toBe('red')
  })
})

describe('buildTheme', () => {
  const theme = buildTheme(marea.brand)

  it('takes colors from the brand config', () => {
    expect(theme.colors.background).toBe('#0B1220')
    expect(theme.colors.accent).toBe('#2EC4B6')
    expect(theme.colors.live).toBe('#FF6B4A')
  })

  it('declares fonts with fallbacks', () => {
    expect(theme.fonts.heading).toMatch(/^'Outfit', /)
    expect(theme.fonts.body).toMatch(/^'DM Sans', /)
    expect(theme.fonts.body).toMatch(/sans-serif$/)
  })

  it('derives glow and focus tokens from the accent', () => {
    expect(theme.shadows.glow).toContain('46, 196, 182')
    expect(theme.shadows.focus).toContain('#2EC4B6')
  })
})
