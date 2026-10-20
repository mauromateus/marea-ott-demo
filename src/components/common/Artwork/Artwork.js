import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Frame = styled.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-top: ${({ $ratio }) => $ratio * 100}%; /* height / width; aspect-ratio is missing on older TV browsers */
  overflow: hidden;
  background: linear-gradient(${({ $angle }) => $angle}deg, ${({ $from }) => $from}, ${({ $to }) => $to});

  svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    color: rgba(255, 255, 255, 0.34);
  }
`

// Simple inline SVG patterns drawn on a 200x300 canvas (no external images).
const GLYPHS = {
  waves: (
    <g fill='none' stroke='currentColor' strokeWidth='3'>
      {[170, 195, 220, 245].map((y, i) => (
        <path key={y} d={`M-10 ${y} C 30 ${y - 28 - i * 3}, 70 ${y + 28}, 105 ${y} S 175 ${y - 28}, 215 ${y}`} />
      ))}
    </g>
  ),
  rings: (
    <g fill='none' stroke='currentColor' strokeWidth='2.5'>
      {[28, 52, 78, 106].map((r) => <circle key={r} cx='140' cy='110' r={r} />)}
    </g>
  ),
  peaks: <path fill='currentColor' opacity='0.8' d='M0 300 L0 200 L55 130 L95 190 L140 100 L200 210 L200 300 Z' />,
  dots: (
    <g fill='currentColor'>
      {Array.from({ length: 30 }, (_, i) => (
        <circle key={i} cx={22 + (i % 5) * 38} cy={34 + Math.floor(i / 5) * 38} r={i % 3 === 0 ? 5 : 3} />
      ))}
    </g>
  ),
  lines: (
    <g stroke='currentColor' strokeWidth='3' strokeLinecap='round'>
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={-20 + i * 28} y1='300' x2={60 + i * 28} y2='0' />)}
    </g>
  ),
  sun: (
    <g fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round'>
      <circle cx='100' cy='120' r='34' fill='currentColor' opacity='0.7' stroke='none' />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6
        return <line key={i} x1={100 + Math.cos(a) * 50} y1={120 + Math.sin(a) * 50} x2={100 + Math.cos(a) * 70} y2={120 + Math.sin(a) * 70} />
      })}
    </g>
  ),
  grid: (
    <g stroke='currentColor' strokeWidth='1.8'>
      {Array.from({ length: 7 }, (_, i) => <line key={`v${i}`} x1={i * 34} y1='0' x2={i * 34} y2='300' />)}
      {Array.from({ length: 10 }, (_, i) => <line key={`h${i}`} x1='0' y1={i * 34} x2='200' y2={i * 34} />)}
    </g>
  ),
  arcs: (
    <g fill='none' stroke='currentColor' strokeWidth='3'>
      {[40, 70, 100, 130].map((r) => <path key={r} d={`M${100 - r} 300 A ${r} ${r} 0 0 1 ${100 + r} 300`} />)}
    </g>
  )
}

Artwork.propTypes = {
  from: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  angle: PropTypes.number,
  glyph: PropTypes.string,
  ratio: PropTypes.number
}

export default function Artwork ({ from, to, angle = 135, glyph = 'waves', ratio = 1.5 }) {
  return (
    <Frame $from={from} $to={to} $angle={angle} $ratio={ratio} aria-hidden='true'>
      <svg viewBox='0 0 200 300' preserveAspectRatio='xMidYMid slice'>{GLYPHS[glyph] || GLYPHS.waves}</svg>
    </Frame>
  )
}
