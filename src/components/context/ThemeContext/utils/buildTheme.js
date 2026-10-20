export const withAlpha = (hex, alpha) => {
  const match = /^#([0-9a-f]{6})$/i.exec(hex || '')
  if (!match) {
    return hex
  }
  const n = parseInt(match[1], 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

export default function buildTheme (brand) {
  const colors = brand.colors

  return {
    colors,
    fonts: {
      heading: "'Outfit', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      body: "'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    },
    radii: { sm: '8px', md: '14px', lg: '22px', pill: '999px' },
    shadows: {
      glow: `0 0 0 1px ${withAlpha(colors.accent, 0.55)}, 0 10px 32px -8px ${withAlpha(colors.accent, 0.55)}`,
      liveGlow: `0 0 0 1px ${withAlpha(colors.live, 0.5)}, 0 10px 32px -8px ${withAlpha(colors.live, 0.5)}`,
      focus: `0 0 0 3px ${colors.background}, 0 0 0 5px ${colors.accent}`,
      card: '0 8px 24px -12px rgba(0, 0, 0, 0.6)'
    },
    breakpoints: { sm: '600px', md: '900px', lg: '1200px' },
    layout: { maxWidth: '1280px', gutter: 'clamp(16px, 4vw, 40px)', headerHeight: '64px' }
  }
}
